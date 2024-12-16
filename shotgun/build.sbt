import Dependencies._

ThisBuild / scalaVersion     := "2.12.8"
ThisBuild / version          := "0.1.0-SNAPSHOT"
ThisBuild / organization     := "me.deflock"
ThisBuild / organizationName := "DeFlock"

lazy val root = (project in file("."))
  .settings(
    name := "shotgun",
    libraryDependencies += scalaTest % Test,
  )

val PekkoVersion = "1.0.3"
val PekkoHttpVersion = "1.0.1"
libraryDependencies ++= Seq(
  "ch.qos.logback" % "logback-classic" % "1.5.6",
  "org.slf4j" % "slf4j-api" % "2.0.12",
  "com.auth0" % "jwks-rsa" % "0.22.1",
  "com.github.jwt-scala" % "jwt-json-common_native0.4_2.12" % "10.0.1",
  "org.apache.pekko" %% "pekko-actor-typed" % PekkoVersion,
  "org.apache.pekko" %% "pekko-stream" % PekkoVersion,
  "org.apache.pekko" %% "pekko-http" % PekkoHttpVersion,
  "org.apache.pekko" %% "pekko-http-spray-json" % PekkoHttpVersion,
  "org.apache.pekko" %% "pekko-http-cors" % PekkoHttpVersion,
  "org.apache.pekko" %% "pekko-slf4j" % PekkoVersion,
)
