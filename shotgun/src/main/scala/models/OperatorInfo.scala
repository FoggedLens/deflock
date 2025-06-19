package models
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import spray.json._

case class OperatorInfo(wikidataId: String, transparencyPortalUrl: String)

object OperatorInfoJsonProtocol extends DefaultJsonProtocol {
  implicit val operatorInfoFormat: RootJsonFormat[OperatorInfo] = jsonFormat2(OperatorInfo)

  def fromAttributeValueMap(map: Map[String, AttributeValue]): Option[OperatorInfo] = {
    for {
      wikidataId <- map.get("wikidataId").flatMap(attr => Option(attr.s()))
      transparencyPortalUrl <- map.get("transparencyPortalUrl").flatMap(attr => Option(attr.s()))
    } yield OperatorInfo(wikidataId, transparencyPortalUrl)
  }
}
