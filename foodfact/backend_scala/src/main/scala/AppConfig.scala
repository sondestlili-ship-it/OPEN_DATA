package app

import com.comcast.ip4s.Port
import scala.concurrent.duration.*

case class AppConfig(
  port: Port,
  offTimeout: FiniteDuration,
  corsOrigins: List[String],
  cacheTtl: FiniteDuration,
  rateLimitPerMinute: Int
)

object AppConfig {
  def load: AppConfig = {
    val portNum = sys.env.get("PORT").flatMap(_.toIntOption).getOrElse(8080)
    val timeoutMs = sys.env.get("OFF_TIMEOUT_MS").flatMap(_.toIntOption).getOrElse(10000)
    val origins = sys.env
      .get("CORS_ORIGINS")
      .map(_.split(",").map(_.trim).filter(_.nonEmpty).toList)
      .getOrElse(List("http://localhost:3000"))
    val cacheTtlSec = sys.env.get("CACHE_TTL_SECONDS").flatMap(_.toIntOption).getOrElse(300)
    val rateLimit = sys.env.get("RATE_LIMIT_PER_MINUTE").flatMap(_.toIntOption).getOrElse(30)

    AppConfig(
      port = Port.fromInt(portNum).getOrElse(Port.fromInt(8080).get),
      offTimeout = timeoutMs.millis,
      corsOrigins = origins,
      cacheTtl = cacheTtlSec.seconds,
      rateLimitPerMinute = rateLimit
    )
  }
}
