provider "aws" {
  region = "us-east-1"
}

module "alpr_counts" {
  module_name          = "alpr_counts"
  source               = "./modules/alpr_counts"
  deflock_stats_bucket = var.deflock_stats_bucket
  rate                 = "rate(60 minutes)"
  sns_topic_arn        = aws_sns_topic.lambda_alarms.arn
}

module "alpr_clusters" {
  module_name          = "alpr_clusters"
  source               = "./modules/alpr_clusters"
  deflock_cdn_bucket   = var.deflock_cdn_bucket
  rate                 = "rate(1 hour)"
  sns_topic_arn        = aws_sns_topic.lambda_alarms.arn
}

resource "aws_sns_topic" "lambda_alarms" {
  name = "lambda_alarms_topic"
}

resource "aws_sns_topic_subscription" "sms_subscription" {
  topic_arn = aws_sns_topic.lambda_alarms.arn
  protocol  = "sms"
  endpoint  = var.alarm_phone_number
}
