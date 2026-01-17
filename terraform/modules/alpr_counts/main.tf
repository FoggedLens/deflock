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

resource "null_resource" "pip_install" {
  provisioner "local-exec" {
    command = <<EOT
      cd ${path.root}/../serverless/${var.module_name}/src
      pip3.14 install -r requirements.txt -t .
    EOT
  }

  triggers = {
    # Re-run the provisioner if the file changes
    file_hash = "${filemd5("${path.root}/../serverless/${var.module_name}/src/${var.module_name}.py")}"
  }
}

data "archive_file" "python_lambda_package" {
  type        = "zip"
  source_dir  = "${path.root}/../serverless/${var.module_name}/src"
  output_path = "${path.root}/../serverless/${var.module_name}/lambda.zip"

  depends_on = [ null_resource.pip_install ]
}

resource "aws_lambda_function" "overpass_lambda" {
  filename         = data.archive_file.python_lambda_package.output_path
  function_name    = var.module_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "${var.module_name}.lambda_handler"
  runtime          = "python3.14"
  source_code_hash = data.archive_file.python_lambda_package.output_base64sha256
  timeout = 180
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

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${var.module_name}"
  retention_in_days = 14
}

resource "aws_iam_policy" "lambda_cloudwatch_logs_policy" {
  name        = "lambda_cloudwatch_logs_policy"
  description = "Policy for Lambda to write logs to CloudWatch"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${var.module_name}:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_cloudwatch_logs_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_cloudwatch_logs_policy.arn
}

# Alarms for Failure

resource "aws_cloudwatch_metric_alarm" "lambda_error_alarm" {
  alarm_name          = "${var.module_name}_execution_error"
  alarm_description   = "An error has occurred while executing the ${var.module_name} Lambda"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 86400 # 1 day
  statistic           = "Sum"
  threshold           = 0
  dimensions = {
    FunctionName = aws_lambda_function.overpass_lambda.function_name
  }

  alarm_actions = [var.sns_topic_arn]
}
