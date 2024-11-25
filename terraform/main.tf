provider "aws" {
  region = "us-east-1"
}

module "alpr_counts" {
  module_name = "alpr_counts"
  source = "./modules/alpr_counts"
  deflock_stats_bucket = var.deflock_stats_bucket
  rate = "rate(60 minutes)"
}

module "alpr_clusters" {
  module_name = "alpr_clusters"
  source = "./modules/alpr_clusters"
  deflock_stats_bucket = var.deflock_stats_bucket
  rate = "rate(1 day)"
}
