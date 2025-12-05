# ALPR Clusters

Generates clusters (the blobs shown on the map when zoomed out far) daily using OSM data. OSM's Overpass API is used to query for all locations of ALPRs, then a clustering algorithm is used. The clustered data is stored in a JSON file in an S3 bucket.

## Deploying
To build and deploy the Docker image, run `./deploy.sh`.
