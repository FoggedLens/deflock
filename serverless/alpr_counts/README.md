# ALPR Counts

Counts total ALPRs reported in the OSM database, hourly. OSM's Overpass API is used to query for counts of all ALPRs and ALPRs in the United States. The counts are stored in a JSON file in an S3 bucket.

## Deploying
This Lambda runs as a container image. Code changes to `serverless/alpr_counts/**` deploy automatically via GitHub Actions (`.github/workflows/alpr-counts-deploy.yml`) on push to `master` — it builds the image, pushes it to ECR, and updates the Lambda's function code.

To deploy manually (e.g. for local testing), run `./deploy.sh` with AWS credentials configured.

Infrastructure changes (IAM, ECR repo, EventBridge schedule, alarms) still go through Terraform: from the `/terraform` directory, run `terraform apply -target=module.alpr_counts`.
