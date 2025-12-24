#!/bin/bash
# Directus backup script: zips database, extensions, uploads, uploads to S3 with timestamp, assumes AWS role

set -euo pipefail

# Load .env variables
ENV_PATH="$(dirname "$0")/.env"
if [ -f "$ENV_PATH" ]; then
  export $(grep -v '^#' "$ENV_PATH" | xargs)
else
  echo ".env file not found at $ENV_PATH"
  exit 1
fi

# CONFIGURATION
SESSION_NAME="directus-backup-session"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
ARCHIVE_NAME="directus-backup-${TIMESTAMP}.zip"
TMP_DIR="/tmp"
ARCHIVE_PATH="${TMP_DIR}/${ARCHIVE_NAME}"

# Create the zip archive
cd "$SOURCE_DIR"
zip -r "$ARCHIVE_PATH" database extensions uploads

# Upload to S3 with timestamped filename
aws s3 cp "$ARCHIVE_PATH" "s3://${BUCKET_NAME}/${ARCHIVE_NAME}"

# Clean up
rm -f "$ARCHIVE_PATH"

echo "Backup complete: ${ARCHIVE_NAME} uploaded to s3://${BUCKET_NAME}/"
