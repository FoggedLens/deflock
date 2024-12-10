package services

import org.apache.pekko.http.scaladsl.server.{Directive1, Directives}
import pdi.jwt.{Jwt, JwtAlgorithm, JwtOptions}
import spray.json.JsValue
import spray.json.JsonParser
import com.auth0.jwk.{JwkProvider, JwkProviderBuilder}

import java.security.PublicKey
import java.security.interfaces.RSAPublicKey
import scala.util.{Failure, Success, Try}
import java.util.concurrent.TimeUnit
import org.slf4j.{Logger, LoggerFactory}

import java.util.Base64

object JwtAuthenticator extends Directives {
  val logger: Logger = LoggerFactory.getLogger(getClass)
  val domain = "https://deflock.us.auth0.com"
  val jwkProvider: JwkProvider = new JwkProviderBuilder(domain)
    .cached(10, 24, TimeUnit.HOURS) // Cache up to 10 keys for 24 hours
    .build()

  def getPublicKey(kid: String): Option[PublicKey] = {
    Try {
      val jwk = jwkProvider.get(kid)
      jwk.getPublicKey.asInstanceOf[RSAPublicKey]
    } match {
      case Success(publicKey) => Some(publicKey)
      case Failure(_)         => None
    }
  }

  def validateToken(token: String): Option[JsValue] = {
    val parts = token.split("\\.")
    if (parts.length != 3) {
      return None
    }

    val rawHeader = new String(Base64.getUrlDecoder.decode(parts(0)))
    val headerJson = JsonParser(rawHeader)
    val kid = headerJson.asJsObject.fields.get("kid").flatMap {
      case spray.json.JsString(k) => Some(k)
      case _ => None
    }

    kid.flatMap(getPublicKey) match {
      case Some(publicKey) =>
        Jwt.decode(token, publicKey, Seq(JwtAlgorithm.RS256), JwtOptions.DEFAULT) match {
          case Success(claim) =>
            Some(JsonParser(claim.content))
          case Failure(_)     =>
            None
        }
      case None =>
        None
    }
  }

  def authenticated: Directive1[JsValue] = {
    optionalHeaderValueByName("Authorization").flatMap {
      case Some(header) if header.startsWith("Bearer ") =>
        val token = header.substring("Bearer ".length)
        validateToken(token) match {
          case Some(claim) => provide(claim)
          case None        => complete((401, "Invalid token"))
        }
      case _ =>
        complete((401, "Missing or malformed Authorization header"))
    }
  }

  def hasPermissions(requiredPermissions: List[String]): Directive1[JsValue] = {
    authenticated.flatMap { claim =>
      val permissions = claim.asJsObject.fields.get("permissions").flatMap {
        case spray.json.JsArray(elements) => Some(elements.collect { case spray.json.JsString(permission) => permission })
        case _ => None
      }

      permissions match {
        case Some(userPermissions) if requiredPermissions.forall(userPermissions.contains) =>
          provide(claim)
        case _ =>
          complete((403, "Insufficient permissions"))
      }
    }
  }
}
