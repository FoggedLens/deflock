variable "deflock_stats_bucket" {
  description = "S3 bucket for the ALPR counts JSON file"
  default = "deflock-clusters"
}

variable "deflock_cdn_bucket" {
  description = "S3 bucket for the CDN"
  default = "cdn.deflock.me"
}

variable "alarm_phone_number" {
  description = "Phone number to receive alarm notifications"
  # intentionally left blank since this file is checked into git
}
