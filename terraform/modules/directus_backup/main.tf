
resource "aws_s3_bucket" "directus_backup" {
		bucket = var.bucket_name
}

resource "aws_s3_bucket_lifecycle_configuration" "directus_backup_lifecycle" {
	bucket = aws_s3_bucket.directus_backup.id

	rule {
		id     = "expire-old-backups"
		status = "Enabled"

		expiration {
			days = 15
		}

		noncurrent_version_expiration {
			noncurrent_days = 15
		}
	}
}

resource "aws_s3_bucket_versioning" "directus_backup_versioning" {
	bucket = aws_s3_bucket.directus_backup.id
	versioning_configuration {
		status = "Enabled"
	}
}

resource "aws_s3_bucket_server_side_encryption_configuration" "directus_backup_encryption" {
	bucket = aws_s3_bucket.directus_backup.id

	rule {
		apply_server_side_encryption_by_default {
			sse_algorithm     = "aws:kms"
			kms_master_key_id = aws_kms_key.s3_backup_key.arn
		}
	}
}

resource "aws_kms_key" "s3_backup_key" {
	description             = "KMS key for S3 backup bucket encryption"
	deletion_window_in_days = 10
	enable_key_rotation     = true
}

resource "aws_iam_role" "directus_backup_writer" {
	name = "directus-backup-writer"
	assume_role_policy = jsonencode({
		Version = "2012-10-17"
		Statement = [
			{
				Action = "sts:AssumeRole"
				Effect = "Allow"
				Principal = {
					Service = "ec2.amazonaws.com"
				}
			}
		]
	})
}

resource "aws_iam_policy" "directus_backup_write_policy" {
	name        = "directus-backup-write-policy"
	description = "Allow write access to S3 backup bucket"
	policy      = jsonencode({
		Version = "2012-10-17"
		Statement = [
			{
				Effect = "Allow"
				Action = [
					"s3:PutObject",
					"s3:PutObjectAcl",
					"s3:GetObject",
					"s3:ListBucket",
					"s3:DeleteObject"
				]
				Resource = [
					"${aws_s3_bucket.directus_backup.arn}/*",
					"${aws_s3_bucket.directus_backup.arn}"
				]
			},
			{
				Effect = "Allow"
				Action = [
					"kms:Encrypt",
					"kms:Decrypt",
					"kms:GenerateDataKey*",
					"kms:DescribeKey"
				]
				Resource = aws_kms_key.s3_backup_key.arn
			}
		]
	})
}

resource "aws_iam_role_policy_attachment" "attach_write_policy" {
	role       = aws_iam_role.directus_backup_writer.name
	policy_arn = aws_iam_policy.directus_backup_write_policy.arn
}

variable "bucket_name" {
	description = "The name of the S3 bucket for Directus backups."
	type        = string
}
