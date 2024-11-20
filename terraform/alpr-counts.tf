locals {
  alpr_counts_filename = "alpr-counts.json"
}


provider "aws" {
  region = "us-east-1"
}

resource "aws_iam_role" "lambda_role" {
  name = "lambda_s3_write_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_s3_write_policy" {
  name        = "lambda_s3_write_policy"
  description = "Policy for Lambda to write to S3 bucket deflock-clusters"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:s3:::deflock-clusters/${local.alpr_counts_filename}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_s3_write_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_s3_write_policy.arn
}

resource "null_resource" "pip_install" {
  provisioner "local-exec" {
    command = <<EOT
      cd ${path.module}/../serverless/alpr-counts/src
      pip3 install -r requirements.txt -t .
    EOT
  }

  triggers = {
    # Re-run the provisioner if the file changes
    file_hash = "${filemd5("${path.module}/../serverless/alpr-counts/src/alpr_counts.py")}"
  }
}

data "archive_file" "python_lambda_package" {
  type        = "zip"
  source_dir  = "${path.module}/../serverless/alpr-counts/src"
  output_path = "${path.module}/../serverless/alpr-counts/lambda.zip"

  depends_on = [ null_resource.pip_install ]
}

resource "aws_lambda_function" "overpass_lambda" {
  filename         = data.archive_file.python_lambda_package.output_path
  function_name    = "alpr_counts"
  role             = aws_iam_role.lambda_role.arn
  handler          = "alpr_counts.lambda_handler"
  runtime          = "python3.9"
  source_code_hash = data.archive_file.python_lambda_package.output_base64sha256
  timeout = 30
}

resource "aws_cloudwatch_event_rule" "lambda_rule" {
  name        = "alpr_counts_rule"
  description = "Rule to trigger alpr_counts lambda"
  schedule_expression = "rate(60 minutes)"
}

resource "aws_cloudwatch_event_target" "lambda_target" {
  target_id = "alpr_counts_target"
  rule      = aws_cloudwatch_event_rule.lambda_rule.name
  arn       = aws_lambda_function.overpass_lambda.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_lambda" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.overpass_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.lambda_rule.arn
}
