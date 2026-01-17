# Directus Backup Script

This script automates backups for a Directus instance, zipping key directories and uploading the archive to an S3 bucket. It is designed to be run as a cron job for regular, automated backups.

## Features
- Zips the `database`, `extensions`, and `uploads` directories from your Directus instance
- Uploads the backup archive to an S3 bucket with a timestamped filename
- Assumes an AWS IAM role for secure S3 access
- Cleans up temporary files after upload

## Prerequisites
- Bash shell
- `zip` utility installed
- AWS CLI installed and configured
- An IAM user with permission to write to the bucket

## Setup
1. **Clone or copy the script to your server.**
2. **Create a `.env` file** in the same directory as the script with the following variables:
   ```env
   ROLE_ARN=arn:aws:iam::123456789012:role/directus-backup-writer
   BUCKET_NAME=your-s3-bucket-name
   SOURCE_DIR="/path/to/your/directus-instance"
   ```
3. **Install dependencies:**
   - On Ubuntu/Debian: `sudo apt-get install zip awscli jq`
   - On CentOS/RHEL: `sudo yum install zip awscli jq`
   - On Alpine: `sudo apk add zip aws-cli jq`
4. **Test the script manually:**
   ```bash
   ./directus-backup.sh
   ```
5. **Set up a cron job** to run the script automatically. For example, to run every day at 2am:
   ```cron
   0 2 * * * /path/to/directus-backup.sh >> /var/log/directus-backup.log 2>&1
   ```
