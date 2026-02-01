# ALPR Counts

Counts total ALPRs reported in the OSM database, hourly. OSM's Overpass API is used to query for counts of all ALPRs and ALPRs in the United States. The counts are stored in a JSON file in an S3 bucket.

## Deploying
This Lambda uses a zip file, so from the `/terraform` directory, you can run `terraform apply -target=module.alpr_counts` after making changes, and it should detect the changes, rebuild the zip, and update the Lambda's function code.
