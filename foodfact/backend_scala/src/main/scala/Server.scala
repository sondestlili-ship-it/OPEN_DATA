package app

import cats.effect._
import org.http4s._
import org.http4s.dsl.io._
import org.http4s.server.Router
import org.http4s.implicits._
import org.http4s.ember.server._
import org.http4s.ember.client._
import org.http4s.circe._
import org.http4s.server.middleware.CORS
import io.circe.syntax._
import io.circe.Json
import com.comcast.ip4s._

object QParam           extends OptionalQueryParamDecoderMatcher[String]("q")
object BrandParam       extends OptionalQueryParamDecoderMatcher[String]("brand")
object CountryParam     extends OptionalQueryParamDecoderMatcher[String]("country")
object SortByParam      extends OptionalQueryParamDecoderMatcher[String]("sortBy")
object OrderParam       extends OptionalQueryParamDecoderMatcher[String]("order")
object MinEnergyParam   extends OptionalQueryParamDecoderMatcher[Double]("minEnergy")
object MaxEnergyParam   extends OptionalQueryParamDecoderMatcher[Double]("maxEnergy")
object MinSugarParam    extends OptionalQueryParamDecoderMatcher[Double]("minSugar")
object MaxSugarParam    extends OptionalQueryParamDecoderMatcher[Double]("maxSugar")
object MinFatParam      extends OptionalQueryParamDecoderMatcher[Double]("minFat")
object MaxFatParam      extends OptionalQueryParamDecoderMatcher[Double]("maxFat")
object PageParam        extends OptionalQueryParamDecoderMatcher[Int]("page")
object PageSizeParam    extends OptionalQueryParamDecoderMatcher[Int]("pageSize")
object NutriscoreParam  extends OptionalQueryParamDecoderMatcher[String]("nutriscore")
object NovaParam        extends OptionalQueryParamDecoderMatcher[String]("nova")

object Server extends IOApp {

  private def errorResponse(status: Status, message: String): IO[Response[IO]] =
    Response[IO](status)
      .withEntity(Json.obj("error" -> Json.fromString(message)).noSpaces)
      .pure[IO]

  private def handleApiError(error: Throwable): IO[Response[IO]] = error match
    case e: OffTimeoutException   => errorResponse(Status.GatewayTimeout, e.message)
    case e: OffUpstreamException  => errorResponse(Status.BadGateway, e.message)
    case e: BadRequestException   => errorResponse(Status.BadRequest, e.message)
    case e                        => errorResponse(Status.InternalServerError, e.getMessage)

  override def run(args: List[String]): IO[ExitCode] = {
    val config = AppConfig.load
    val cache  = new SearchCache(config.cacheTtl)
    val limiter = new RateLimiter(config.rateLimitPerMinute)

    EmberClientBuilder.default[IO].build.use { client =>
      val api = new OpenFoodClient(client, config.offTimeout)

      val apiRoutes = HttpRoutes.of[IO] {
        case GET -> Root / "health" =>
          Ok(Json.obj("status" -> Json.fromString("ok")))

        case GET -> Root / "api" / "search"
            :? QParam(maybeQ)
            +& BrandParam(maybeBrand)
            +& CountryParam(maybeCountry)
            +& SortByParam(maybeSortBy)
            +& OrderParam(maybeOrder)
            +& MinEnergyParam(minEnergy)
            +& MaxEnergyParam(maxEnergy)
            +& MinSugarParam(minSugar)
            +& MaxSugarParam(maxSugar)
            +& MinFatParam(minFat)
            +& MaxFatParam(maxFat)
            +& PageParam(maybePage)
            +& PageSizeParam(maybePageSize)
            +& NutriscoreParam(maybeNutriscore)
            +& NovaParam(maybeNova) =>

          val filterParams = FilterParams(
            country = maybeCountry.filter(_.trim.nonEmpty),
            brand = maybeBrand.filter(_.trim.nonEmpty),
            minEnergy = minEnergy,
            maxEnergy = maxEnergy,
            minSugar = minSugar,
            maxSugar = maxSugar,
            minFat = minFat,
            maxFat = maxFat,
            nutriscores = ProductFilters.parseCsvSet(maybeNutriscore),
            novaGroups = ProductFilters.parseNovaSet(maybeNova),
            sortBy = maybeSortBy.filter(_.trim.nonEmpty),
            order = maybeOrder.filter(_.trim.nonEmpty)
          )

          val page     = maybePage.filter(_ > 0).getOrElse(1)
          val pageSize = maybePageSize.filter(_ > 0).map(math.min(_, 100)).getOrElse(50)

          val query = maybeQ.map(_.trim).filter(_.nonEmpty).getOrElse {
            if ProductFilters.hasActiveFilters(filterParams) then "a" else ""
          }

          if query.isEmpty then
            errorResponse(Status.BadRequest, "Missing search query or filters")
          else
            val cacheKey = s"$query|$page|$pageSize"
            cache
              .cachedSearch(cacheKey)(api.rawSearch(query, page, pageSize))
              .flatMap { resp =>
                val filtered = ProductFilters.applyFilters(resp.products, filterParams)
                val sorted   = ProductFilters.sortProducts(filtered, filterParams.sortBy, filterParams.order)

                Ok(
                  ApiSearchResponse(
                    count = sorted.length,
                    totalFromOff = resp.count,
                    page = page,
                    pageSize = pageSize,
                    products = sorted
                  ).asJson
                )
              }
              .handleErrorWith(handleApiError)

        case GET -> Root / "api" / "product" / barcode =>
          (for {
            product      <- api.getProduct(barcode)
            alternatives <- api.getAlternatives(product)
            res          <- Ok(
              Json.obj(
                "product"      -> product.asJson,
                "alternatives" -> alternatives.asJson
              )
            )
          } yield res).handleErrorWith(handleApiError)
      }

      val corsPolicy = CORS.policy
        .withAllowOriginHost(originHost =>
          config.corsOrigins.exists(origin =>
            origin
              .replace("http://", "")
              .replace("https://", "")
              .split(":") match
              case Array(host, port) =>
                originHost.host.toString == host &&
                originHost.port.map(_.toString).contains(port)
              case Array(host) =>
                originHost.host.toString == host
          )
        )
        .withAllowMethodsAll
        .withAllowHeadersAll

      val httpApp = corsPolicy(apiRoutes).orNotFound
      val rateLimited = limiter.middleware(httpApp)

      EmberServerBuilder
        .default[IO]
        .withPort(config.port)
        .withHost(ipv4"0.0.0.0")
        .withHttpApp(rateLimited)
        .build
        .useForever
        .as(ExitCode.Success)
    }
  }
}
