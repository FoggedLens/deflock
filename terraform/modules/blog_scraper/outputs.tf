output "lambda_function_arn" {
  description = "ARN of the blog scraper Lambda function"
  value       = aws_lambda_function.blog_scraper_lambda.arn
}

output "lambda_function_name" {
  description = "Name of the blog scraper Lambda function"
  value       = aws_lambda_function.blog_scraper_lambda.function_name
}

output "cloudwatch_event_rule_arn" {
  description = "ARN of the CloudWatch Event Rule"
  value       = aws_cloudwatch_event_rule.lambda_rule.arn
}