resource "aws_iam_role" "lambda_role" {
  name = "blog_scraper_lambda_role"

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

resource "aws_iam_policy" "lambda_basic_execution_policy" {
  name        = "blog_scraper_lambda_basic_execution_policy"
  description = "Basic execution policy for blog scraper Lambda function"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_basic_execution_policy.arn
}

# Install dependencies using uv (since it's a uv project)
resource "null_resource" "uv_install" {
  provisioner "local-exec" {
    command = <<EOT
      cd ${path.root}/../serverless/${var.module_name}
      # Create build directory (ignored by git)
      rm -rf .build
      mkdir -p .build
      
      # Install dependencies using uv into build directory
      uv pip install --system --target .build -r pyproject.toml
      
      # Copy the main.py file to the build directory
      cp main.py .build/
    EOT
  }

  triggers = {
    # Re-run if pyproject.toml or main.py changes
    pyproject_hash = filemd5("${path.root}/../serverless/${var.module_name}/pyproject.toml")
    main_py_hash   = filemd5("${path.root}/../serverless/${var.module_name}/main.py")
  }
}

data "archive_file" "python_lambda_package" {
  type        = "zip"
  source_dir  = "${path.root}/../serverless/${var.module_name}/.build"
  output_path = "${path.root}/../serverless/${var.module_name}/lambda.zip"

  depends_on = [null_resource.uv_install]
}

resource "aws_lambda_function" "blog_scraper_lambda" {
  filename         = data.archive_file.python_lambda_package.output_path
  function_name    = var.module_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "main.lambda_handler"
  runtime          = "python3.14"
  source_code_hash = data.archive_file.python_lambda_package.output_base64sha256
  timeout          = 300

  environment {
    variables = {
      DIRECTUS_BASE_URL  = var.directus_base_url
      DIRECTUS_API_TOKEN = var.directus_api_token
    }
  }
}

resource "aws_cloudwatch_event_rule" "lambda_rule" {
  name                = "${var.module_name}_rule"
  description         = "Rule to trigger ${var.module_name} lambda every 30 minutes"
  schedule_expression = var.rate
}

resource "aws_cloudwatch_event_target" "lambda_target" {
  target_id = "${var.module_name}_target"
  rule      = aws_cloudwatch_event_rule.lambda_rule.name
  arn       = aws_lambda_function.blog_scraper_lambda.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_lambda" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.blog_scraper_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.lambda_rule.arn
}

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${var.module_name}"
  retention_in_days = 14
}

# CloudWatch alarm for Lambda errors
resource "aws_cloudwatch_metric_alarm" "lambda_error_alarm" {
  alarm_name          = "${var.module_name}_error_alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "This metric monitors lambda errors for ${var.module_name}"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    FunctionName = aws_lambda_function.blog_scraper_lambda.function_name
  }
}