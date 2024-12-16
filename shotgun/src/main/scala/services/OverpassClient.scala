package services

import org.apache.pekko
import org.apache.pekko.actor.ActorSystem
import pekko.http.scaladsl.Http
import pekko.http.scaladsl.model._
import pekko.http.scaladsl.unmarshalling.Unmarshal
import spray.json._
import scala.concurrent.{ExecutionContextExecutor, Future}

case class BoundingBox(minLat: Double, minLng: Double, maxLat: Double, maxLng: Double)

class OverpassClient(implicit val system: ActorSystem, implicit val executionContext: ExecutionContextExecutor) {
  val baseUrl = "https://overpass-api.de/api/interpreter"

  def getALPRs(bBox: BoundingBox): Future[JsValue] = {
    val query = s"""[out:json][bbox:${bBox.minLat},${bBox.minLng},${bBox.maxLat},${bBox.maxLng}];node["man_made"="surveillance"]["surveillance:type"="ALPR"];out body;>;out skel qt;"""
    val formData = FormData("data" -> query).toEntity
    val request = HttpRequest(
      method = HttpMethods.POST,
      uri = baseUrl,
      entity = formData
    )

    Http().singleRequest(request).flatMap { response =>
      response.status match {
        case StatusCodes.OK =>
          Unmarshal(response.entity).to[String].map { jsonString =>
            jsonString.parseJson
          }
        case _ =>
          response.discardEntityBytes()
          Future.failed(new Exception(s"Failed to get ALPRs: ${response.status}"))
      }
    }
  }

}
