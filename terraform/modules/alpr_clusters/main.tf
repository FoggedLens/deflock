resource "aws_iam_role" "lambda_role" {
  name = "${var.module_name}_lambda_s3_write_role"

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
  name        = "${var.module_name}_lambda_s3_write_policy"
  description = "Policy for Lambda to write to S3 bucket ${var.deflock_stats_bucket}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:s3:::${var.deflock_stats_bucket}/${var.output_filename}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_s3_write_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_s3_write_policy.arn
}

resource "aws_lambda_function" "overpass_lambda" {
  function_name    = var.module_name
  role             = aws_iam_role.lambda_role.arn
  package_type     = "Image"
  image_uri        = "${aws_ecr_repository.lambda_repository.repository_url}:latest"
  timeout = 90
}

resource "aws_cloudwatch_event_rule" "lambda_rule" {
  name        = "${var.module_name}_rule"
  description = "Rule to trigger ${var.module_name} lambda"
  schedule_expression = var.rate
}

resource "aws_cloudwatch_event_target" "lambda_target" {
  target_id = "${var.module_name}_target"
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

resource "aws_ecr_repository" "lambda_repository" {
  name = "${var.module_name}-lambda"
}
