package app

import cats.effect.IO
import cats.effect.Temporal
import org.http4s._
import org.http4s.client._
import org.http4s.implicits._
import org.http4s.circe.CirceEntityCodec._

import scala.concurrent.duration.FiniteDuration

class OpenFoodClient(client: Client[IO], timeout: FiniteDuration) {

  private val searchFields =
    "code,product_name,brands,categories,quantity,nutriscore_grade,ecoscore_grade,nova_group,ingredients_text,allergens,labels,countries,image_small_url,image_url,nutriments"

  private def withTimeout[A](io: IO[A]): IO[A] =
    Temporal[IO].timeoutTo(
      io,
      timeout,
      IO.raiseError(OffTimeoutException("OpenFoodFacts request timed out"))
    )

  /** Recherche OpenFoodFacts brute (avec images) */
  def rawSearch(query: String, page: Int = 1, pageSize: Int = 50): IO[OffSearchResponse] = {
    val safePage = math.max(1, page)
    val safeSize = math.min(100, math.max(1, pageSize))

    val uri = uri"https://world.openfoodfacts.org/cgi/search.pl"
      .withQueryParams(
        Map(
          "search_terms"  -> query,
          "search_simple" -> "1",
          "action"        -> "process",
          "json"          -> "1",
          "page"          -> safePage.toString,
          "page_size"     -> safeSize.toString,
          "fields"        -> searchFields
        )
      )

    withTimeout(
      client
        .expect[OffSearchResponse](Request[IO](method = Method.GET, uri = uri))
        .handleErrorWith(e => IO.raiseError(OffUpstreamException(s"OpenFoodFacts error: ${e.getMessage}")))
    )
  }

  /** Détails produit par code-barres */
  def getProduct(barcode: String): IO[Product] = {
    val uri = uri"https://world.openfoodfacts.org/api/v0/product" / s"$barcode.json"

    withTimeout(
      client
        .expect[ProductResponse](Request[IO](Method.GET, uri))
        .map { resp =>
          resp.product.getOrElse(
            Product(
              code = barcode,
              product_name = None,
              brands = None,
              categories = None,
              quantity = None,
              nutriscore_grade = None,
              ecoscore_grade = None,
              nova_group = None,
              ingredients_text = None,
              allergens = None,
              additives_tags = None,
              labels = None,
              countries = None,
              image_url = None,
              image_small_url = None,
              image_front_url = None,
              nutriments = None
            )
          )
        }
        .handleErrorWith(e => IO.raiseError(OffUpstreamException(s"OpenFoodFacts error: ${e.getMessage}")))
    )
  }

  /** Alternatives par catégorie, triées par Nutri-Score */
  def getAlternatives(product: Product, limit: Int = 8): IO[List[Product]] = {
    val mainCategory = product.categories
      .flatMap(_.split(",").headOption)
      .map(_.trim)
      .filter(_.nonEmpty)
      .getOrElse("")

    if mainCategory.isBlank then IO.pure(Nil)
    else
      rawSearch(mainCategory, page = 1, pageSize = 50).map { resp =>
        resp.products
          .filter(p => p.code != product.code)
          .sortBy(p => ProductFilters.nutriscoreRank(p.nutriscore_grade))
          .take(limit)
      }
  }
}
