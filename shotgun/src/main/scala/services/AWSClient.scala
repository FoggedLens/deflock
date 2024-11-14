package services

import software.amazon.awssdk.auth.credentials.{AwsBasicCredentials, StaticCredentialsProvider}
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.{GetObjectTaggingRequest, ListObjectsRequest, PutObjectRequest}
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest

import spray.json.DefaultJsonProtocol._
import spray.json.RootJsonFormat

import scala.collection.JavaConverters._
import java.net.URL
import java.time.Duration

case class ImageSubmission(bucketName: String, objectKey: String, author: String, publicUrl: String)
object ImageSubmissionJsonProtocol {
  implicit val imageSubmissionFormat: RootJsonFormat[ImageSubmission] = jsonFormat4(ImageSubmission)
}

case class DeleteObjectRequest(objectKey: String)
object DeleteObjectRequestJsonProtocol {
  implicit val deleteObjectRequestFormat: RootJsonFormat[DeleteObjectRequest] = jsonFormat1(DeleteObjectRequest)
}

class AWSClient(accessKeyId: String, secretAccessKey: String, region: String) {

  private val credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey)
  private val s3Client = S3Client.builder()
    .region(Region.of(region))
    .credentialsProvider(StaticCredentialsProvider.create(credentials))
    .build()

  private val s3Presigner = S3Presigner.builder()
    .region(Region.of(region))
    .credentialsProvider(StaticCredentialsProvider.create(credentials))
    .build()

  def putPresignedUrl(bucketName: String, objectKey: String, contentType: String, expirationMinutes: Long): URL = {
    val putObjectRequest = PutObjectRequest.builder()
      .bucket(bucketName)
      .key(objectKey)
      .contentType(contentType)
      .build()

    val presignRequest = PutObjectPresignRequest.builder()
      .signatureDuration(Duration.ofMinutes(expirationMinutes))
      .putObjectRequest(putObjectRequest)
      .build()

    s3Presigner.presignPutObject(presignRequest).url()
  }

  private val contentTypeToExtension: Map[String, String] = Map(
    "image/jpeg" -> "jpg",
    "image/png" -> "png",
    "image/gif" -> "gif",
    "image/svg+xml" -> "svg",
    "image/webp" -> "webp",
    "image/tiff" -> "tiff",
    "image/bmp" -> "bmp",
    "image/heic" -> "heic",
    "image/heif" -> "heif"
  )

  def getMultiplePutPresignedUrls(bucketName: String, count: Int, contentType: String, author: String, expirationMinutes: Long): Seq[String] = {
    if (!contentTypeToExtension.contains(contentType))
      throw new IllegalArgumentException(s"Unsupported content type: $contentType")

    val uuids = (1 to count).map(_ => author + "/" + java.util.UUID.randomUUID().toString + "." + contentTypeToExtension(contentType))
    uuids.take(5).map { objectKey =>
      putPresignedUrl(bucketName, objectKey, contentType, expirationMinutes).toString
    }
  }

  def getAllObjects(bucketName: String): Seq[ImageSubmission] = {
    val listObjectsResponse = s3Client.listObjects(
      ListObjectsRequest.builder().bucket(bucketName).build()
    ).contents()

    listObjectsResponse.asScala.map { obj =>
      val parts = obj.key().split("/")
      val author = parts.head
      val objectKey = parts.tail.mkString("/")
      ImageSubmission(bucketName, objectKey, author, s"https://$bucketName.s3.amazonaws.com/$author/$objectKey")
    }
  }

  def deleteObject(bucketName: String, objectKey: String): String = {
    s3Client.deleteObject(
      software.amazon.awssdk.services.s3.model.DeleteObjectRequest.builder()
        .bucket(bucketName)
        .key(objectKey)
        .build()
    )
    s"Deleted object $objectKey from bucket $bucketName"
  }
}
