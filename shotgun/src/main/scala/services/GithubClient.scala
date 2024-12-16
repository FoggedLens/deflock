package services

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.javadsl.model.headers.{Authorization, HttpCredentials, UserAgent}
import org.apache.pekko.http.scaladsl.Http
import org.apache.pekko.http.scaladsl.model.{HttpMethods, HttpRequest, StatusCodes}
import org.apache.pekko.http.scaladsl.unmarshalling.Unmarshal
import spray.json.JsValue
import spray.json._
import org.apache.pekko.http.scaladsl.model.ContentTypes
import org.apache.pekko.http.scaladsl.model.HttpEntity
import org.slf4j.LoggerFactory

import scala.concurrent.{ExecutionContextExecutor, Future}

class GithubClient(implicit val system: ActorSystem, implicit val executionContext: ExecutionContextExecutor) {
  val logger = LoggerFactory.getLogger(getClass)
  val graphQLEndpoint = "https://api.github.com/graphql"
  private val githubApiToken = sys.env("GITHUB_TOKEN")

  def getSponsors(username: String): Future[JsArray] = {

  val query = s"""
    |query {
    |  user(login: "$username") {
    |    sponsorshipsAsMaintainer(first: 100) {
    |      nodes {
    |        sponsor {
    |          login
    |          name
    |          avatarUrl
    |        }
    |      }
    |    }
    |  }
    |}
    |""".stripMargin.replace("\n", " ").replace("\"", "\\\"")

    val jsonRequest = s"""{"query": "$query", "variables": ""}"""
    val jsonEntity = HttpEntity(ContentTypes.`application/json`, jsonRequest)
    val request = HttpRequest(
      headers = List(
        UserAgent.create("Shotgun"),
        Authorization.create(HttpCredentials.create("Bearer", githubApiToken))
      ),
      method = HttpMethods.POST,
      uri = graphQLEndpoint,
      entity = jsonEntity
    )

    Http().singleRequest(request).flatMap { response =>
      response.status match {
        case StatusCodes.OK =>
          Unmarshal(response.entity).to[String].map { jsonString =>
            jsonString.parseJson.asJsObject
              .fields("data").asJsObject
              .fields("user").asJsObject
              .fields("sponsorshipsAsMaintainer")
              .asJsObject.fields("nodes")
              .asInstanceOf[JsArray]
          }
        case _ =>
          response.discardEntityBytes()
          Future.failed(new Exception(s"Failed to get sponsors: ${response.status}"))
      }
    }
  }
}
