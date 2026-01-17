variable "deflock_stats_bucket" {
  description = "S3 bucket for the ALPR counts JSON file"
  default = "cdn.deflock.me"
}

variable "deflock_cdn_bucket" {
  description = "S3 bucket for the CDN"
  default = "cdn.deflock.me"
}

variable "alarm_phone_number" {
  description = "Phone number to receive alarm notifications"
  # intentionally left blank since this file is checked into git
}

variable "directus_base_url" {
  description = "Base URL for Directus CMS"
  default     = "https://cms.deflock.me"
}

variable "directus_api_token" {
  description = "API token for Directus CMS"
  sensitive   = true
  # intentionally left blank since this file is checked into git
}
