resource "aws_dynamodb_table" "operator_info" {
  name           = var.module_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "wikidataId"

  attribute {
    name = "wikidataId"
    type = "S"
  }
}
