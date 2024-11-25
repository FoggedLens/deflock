variable "module_name" {
  description = "Name of the module"
}

variable "output_filename" {
  description = "Filename for the ALPR clusters JSON file"
  default     = "alpr_clusters.json"
}

variable "deflock_stats_bucket" {
  description = "S3 bucket for the ALPR clusters JSON file"
}

variable "rate" {
  description = "Rate at which to run the Lambda function"
}
