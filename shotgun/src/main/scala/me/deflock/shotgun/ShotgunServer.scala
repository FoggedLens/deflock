package me.deflock.shotgun

import org.apache.pekko
import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.event.Logging
import org.apache.pekko.http.cors.scaladsl.CorsDirectives.cors
import org.apache.pekko.http.cors.scaladsl.model.HttpOriginMatcher
import org.apache.pekko.http.cors.scaladsl.settings.CorsSettings
import org.apache.pekko.http.scaladsl.model.headers.{HttpOrigin, `Access-Control-Allow-Origin`}
import pekko.http.scaladsl.Http
import pekko.http.scaladsl.model._
import pekko.http.scaladsl.server.Directives.{path, _}
import org.apache.pekko.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
import org.apache.pekko.http.scaladsl.server.RejectionHandler

import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import scala.concurrent.ExecutionContextExecutor
import scala.io.StdIn

object ShotgunServer {

  def main(args: Array[String]): Unit = {

    implicit val system: ActorSystem = ActorSystem("my-system")
    implicit val executionContext: ExecutionContextExecutor = system.dispatcher
    val logging = Logging(system, getClass)

    val client = new services.OverpassClient()
    val nominatim = new services.NominatimClient()

    // CORS
    val allowedOrigins = List(
      "http://localhost:8080",
      "http://localhost:5173",
      "https://deflock.me",
      "https://www.deflock.me",
    ).map(HttpOrigin(_)) // TODO: make this a config setting
    val corsSettings = CorsSettings.default
      .withAllowedOrigins(HttpOriginMatcher(allowedOrigins: _*))
      .withExposedHeaders(List(`Access-Control-Allow-Origin`.name))

    val rejectionHandler = RejectionHandler.newBuilder()
      .handleNotFound {
        complete((StatusCodes.NotFound, "The requested resource could not be found."))
      }
      .handle {
        case corsRejection: org.apache.pekko.http.cors.scaladsl.CorsRejection =>
          complete((StatusCodes.Forbidden, "CORS rejection: Invalid origin"))
      }
      .result()

    val apiRoutes = pathPrefix("api") {
      concat (
        path("alpr") {
          get {
            parameters("minLat".as[Double], "minLng".as[Double], "maxLat".as[Double], "maxLng".as[Double]) { (minLat, minLng, maxLat, maxLng) =>
              val bBox = services.BoundingBox(minLat, minLng, maxLat, maxLng)
              onSuccess(client.getALPRs(bBox)) { json =>
                complete(json)
              }
            }
          }
        },
        path("geocode") {
          get {
            parameters("query".as[String]) { query =>
              val encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8.toString)
              onSuccess(nominatim.geocodePhrase(encodedQuery)) { json =>
                complete(json)
              }
            }
          }
        },
        path("oauth2" / "callback") {
          get {
            parameters(Symbol("code").?) { (code) =>
              complete(HttpEntity(ContentTypes.`text/html(UTF-8)`, "<h1>Say hello to Pekko HTTP</h1><p><b>Code: " + code.getOrElse("None") + "</b></p>"))
            }
          }
        },
        path("healthcheck") {
          get {
            complete(HttpResponse(StatusCodes.OK, entity = "Service is healthy"))
          }
        }
      )
    }

    val spaRoutes = pathEndOrSingleSlash {
      getFromFile("../webapp/dist/index.html")
    } ~ getFromDirectory("../webapp/dist") ~
      path(Remaining) { _ =>
        getFromFile("../webapp/dist/index.html")
      }

    val routes = handleRejections(rejectionHandler) {
      cors(corsSettings) {
        concat(apiRoutes, spaRoutes)
      }
    }

    val bindingFuture = Http().newServerAt("0.0.0.0", 8080).bind(routes)

    // Handle the binding future properly
    bindingFuture.foreach { binding =>
      println(s"Server online at http://localhost:${binding.localAddress.getPort}/")
      println("Press RETURN to stop...")
    }
    
    StdIn.readLine()

    bindingFuture
      .flatMap(_.unbind())
      .onComplete { _ =>
        println("Server shutting down...")
        system.terminate()
      }
  }
}
