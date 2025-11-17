package services

import org.apache.pekko
import org.apache.pekko.actor.ActorSystem
import pekko.http.scaladsl.Http
import pekko.http.scaladsl.model._
import pekko.http.scaladsl.unmarshalling.Unmarshal
import spray.json._

import scala.collection.mutable
import scala.concurrent.{ExecutionContextExecutor, Future}

class NominatimClient(implicit val system: ActorSystem, implicit val executionContext: ExecutionContextExecutor) {
  val baseUrl = "https://nominatim.openstreetmap.org/search"
  private val cache: mutable.LinkedHashMap[String, JsValue] = new mutable.LinkedHashMap[String, JsValue]()
  private val maxCacheSize = 300

  private def cleanUpCache(): Unit = {
    if (cache.size > maxCacheSize) {
      val oldest = cache.head
      cache.remove(oldest._1)
    }
  }

  def geocodePhrase(query: String): Future[JsValue] = {
    cleanUpCache()
    cache.get(query) match {
      case Some(cachedResult) =>
        println(s"Cache hit for $query")
        Future.successful(cachedResult)
      case _ =>
        println(s"Cache miss for $query")
        val request = HttpRequest(
          uri = s"$baseUrl?q=$query&polygon_geojson&format=json",
          headers = List(headers.`User-Agent`("DeFlock/1.0"))
        )

        Http().singleRequest(request).flatMap { response =>
          response.status match {
            case StatusCodes.OK =>
              Unmarshal(response.entity).to[String].map { jsonString =>
                val json = jsonString.parseJson
                cache.put(query, json)
                json
              }
            case _ =>
              response.discardEntityBytes()
              Future.failed(new Exception(s"Failed to geocode phrase: ${response.status}"))
          }
        }
    }
  }
}
