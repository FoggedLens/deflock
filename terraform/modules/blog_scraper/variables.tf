variable "module_name" {
  description = "Name of the module"
  type        = string
  default     = "blog_scraper"
}

variable "rate" {
  description = "Rate expression for CloudWatch Events rule"
  type        = string
  default     = "rate(30 minutes)"
}

variable "sns_topic_arn" {
  description = "SNS topic ARN for Lambda alarms"
  type        = string
}

variable "directus_base_url" {
  description = "Base URL for Directus CMS"
  type        = string
  default     = "https://cms.deflock.me"
}

variable "directus_api_token" {
  description = "API token for Directus CMS"
  type        = string
  sensitive   = true
}