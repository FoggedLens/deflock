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
import services.DeleteObjectRequest
import services.DeleteObjectRequestJsonProtocol._
import services.JwtAuthenticator.{authenticated, hasPermissions}
import spray.json.DefaultJsonProtocol._
import services.ImageSubmissionJsonProtocol._

import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import scala.concurrent.ExecutionContextExecutor
import scala.io.StdIn
import org.slf4j.LoggerFactory

object ShotgunServer {

  def main(args: Array[String]): Unit = {

    val logger = LoggerFactory.getLogger(getClass)

    implicit val system: ActorSystem = ActorSystem("my-system")
    implicit val executionContext: ExecutionContextExecutor = system.dispatcher
    val logging = Logging(system, getClass)

    val client = new services.OverpassClient()
    val nominatim = new services.NominatimClient()
    val awsClient = new services.AWSClient(
      accessKeyId = sys.env("AWS_ACCESS_KEY_ID"),
      secretAccessKey = sys.env("AWS_SECRET_ACCESS_KEY"),
      region = "us-east-1"
    )

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
        path("presigned-urls") {
          hasPermissions(List("photo:upload")) { claim =>
            get {
              parameters("count".as[Int], "contentType".as[String], "author".as[String]) { (imageCount, contentType, author) =>
                if (imageCount > 5)
                  complete(StatusCodes.BadRequest, "Cannot request more than 5 presigned URLs at a time")
                else {
                  val urls = awsClient.getMultiplePutPresignedUrls("deflock-photo-uploads", imageCount, contentType, author, 5)
                  complete(urls)
                }
              }
            }
          }
        },
        path("user-submissions") {
          hasPermissions(List("photo:view")) { claim =>
            get {
              val submissions = awsClient.getAllObjects("deflock-photo-uploads")
              complete(submissions)
            }
          }
        },
        path("delete-object") {
          hasPermissions(List("photo:delete")) { claim =>
            post {
              entity(as[DeleteObjectRequest]) { request =>
                val res = awsClient.deleteObject("deflock-photo-uploads", request.objectKey)
                complete(res)
              }
            }
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
