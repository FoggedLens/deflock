# ALPR Cache

Generates map tile cache files daily using OSM data. OSM's Overpass API is used to query for all ALPR locations, then results are segmented into geographic tiles. The tile data is stored as JSON files in an S3 bucket.

## Deploying
To build and deploy the Docker image, run `./deploy.sh`.
