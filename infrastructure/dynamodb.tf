resource "aws_dynamodb_table" "leaderboard" {
  name         = "drift-leaderboard"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "difficulty"
  range_key    = "score"

  attribute {
    name = "difficulty"
    type = "S"
  }

  attribute {
    name = "score"
    type = "N"
  }

  attribute {
    name = "username"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  global_secondary_index {
    name            = "username-score-index"
    hash_key        = "username"
    range_key       = "score"
    projection_type = "ALL"
  }
}
