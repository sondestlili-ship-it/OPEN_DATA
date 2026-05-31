package app

import cats.effect.IO
import java.util.concurrent.ConcurrentHashMap
import scala.concurrent.duration.*

final class SearchCache(ttl: FiniteDuration) {
  private case class Entry(response: OffSearchResponse, expiresAt: Long)

  private val store = new ConcurrentHashMap[String, Entry]()

  def get(key: String): Option[OffSearchResponse] = {
    Option(store.get(key)).flatMap { entry =>
      if System.currentTimeMillis() > entry.expiresAt then
        store.remove(key)
        None
      else Some(entry.response)
    }
  }

  def put(key: String, response: OffSearchResponse): Unit =
    store.put(key, Entry(response, System.currentTimeMillis() + ttl.toMillis))

  def cachedSearch(
      key: String
  )(fetch: => IO[OffSearchResponse]): IO[OffSearchResponse] =
    get(key) match
      case Some(cached) => IO.pure(cached)
      case None =>
        fetch.flatMap { resp =>
          IO.delay(put(key, resp)).as(resp)
        }
}
