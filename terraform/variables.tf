variable "deflock_stats_bucket" {
  description = "S3 bucket for the ALPR counts JSON file"
  default = "deflock-clusters"
}

variable "deflock_cdn_bucket" {
  description = "S3 bucket for the CDN"
  default = "cdn.deflock.me"
}
