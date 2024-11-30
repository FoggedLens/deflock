# Stage 1: Build the frontend
FROM docker.io/node:18 AS frontend-build
WORKDIR /app/frontend
COPY webapp/package*.json ./
RUN npm install
COPY webapp ./
RUN npm run build

# Stage 2: Build the Scala app
FROM docker.io/hseeberger/scala-sbt:8u222_1.3.5_2.13.1 AS scala-build
WORKDIR /app
COPY shotgun/project/ ./project
COPY shotgun/build.sbt ./build.sbt
COPY shotgun/ ./
COPY --from=frontend-build /app/frontend/dist/ ../webapp/dist/
RUN sbt assembly

# Stage 3: Run the Scala app
FROM docker.io/openjdk:11-jre-slim
WORKDIR /app
COPY --from=scala-build /app/target/scala-2.12/shotgun-assembly-0.1.0-SNAPSHOT.jar ./shotgun-assembly-0.1.0-SNAPSHOT.jar
COPY --from=frontend-build /app/frontend/dist/ ../webapp/dist/
CMD ["java", "-jar", "shotgun-assembly-0.1.0-SNAPSHOT.jar"]
