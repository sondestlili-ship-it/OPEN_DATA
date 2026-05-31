package app

import cats.effect.IO
import org.http4s.{HttpApp, Response, Status}
import org.http4s.server.HttpMiddleware
import io.circe.syntax._
import io.circe.Json

import java.util.concurrent.ConcurrentHashMap

final class RateLimiter(maxPerMinute: Int) {
  private case class Window(count: Int, startMs: Long)

  private val store = new ConcurrentHashMap[String, Window]()

  def allow(key: String): Boolean = {
    val now = System.currentTimeMillis()
    val windowMs = 60_000L
    val existing = store.get(key)

    if existing == null || now - existing.startMs >= windowMs then
      store.put(key, Window(1, now))
      true
    else if existing.count < maxPerMinute then
      store.put(key, Window(existing.count + 1, existing.startMs))
      true
    else false
  }

  def middleware: HttpMiddleware[IO] = { httpApp: HttpApp[IO] =>
    HttpApp[IO] { req =>
      val ip = req.remoteAddr.map(_.toString).getOrElse("unknown")
      if allow(ip) then httpApp.run(req)
      else
        IO.pure(
          Response[IO](
            Status.TooManyRequests,
            org.http4s.headers.`Content-Type`(org.http4s.MediaType.application.json)
          ).withEntity(Json.obj("error" -> Json.fromString("Rate limit exceeded")).noSpaces)
        )
    }
  }
}
