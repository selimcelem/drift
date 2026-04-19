resource "aws_dynamodb_table" "drift_analytics" {
  name         = "drift-analytics"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "sessionId"
  range_key    = "timestamp"

  attribute {
    name = "sessionId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  attribute {
    name = "pilotName"
    type = "S"
  }

  attribute {
    name = "difficulty"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  global_secondary_index {
    name            = "pilotName-timestamp-index"
    hash_key        = "pilotName"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "difficulty-timestamp-index"
    hash_key        = "difficulty"
    range_key       = "timestamp"
    projection_type = "ALL"
  }
}

data "archive_file" "drift_analytics" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/drift-analytics"
  output_path = "${path.module}/lambda/drift-analytics.zip"
}

resource "aws_iam_role_policy" "lambda_analytics" {
  name = "drift-lambda-analytics"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.drift_analytics.arn,
          "${aws_dynamodb_table.drift_analytics.arn}/index/*"
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "drift_analytics" {
  function_name    = "drift-analytics"
  filename         = data.archive_file.drift_analytics.output_path
  source_code_hash = data.archive_file.drift_analytics.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  role             = aws_iam_role.lambda_exec.arn
  timeout          = 10

  environment {
    variables = {
      ANALYTICS_PASSWORD = "drift2026"
      ANALYTICS_TABLE    = "drift-analytics"
    }
  }
}

resource "aws_apigatewayv2_integration" "drift_analytics" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.drift_analytics.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "drift_analytics_post" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /analytics"
  target    = "integrations/${aws_apigatewayv2_integration.drift_analytics.id}"
}

resource "aws_apigatewayv2_route" "drift_analytics_get" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /analytics"
  target    = "integrations/${aws_apigatewayv2_integration.drift_analytics.id}"
}

resource "aws_lambda_permission" "drift_analytics" {
  statement_id  = "AllowAPIGatewayInvokeAnalytics"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.drift_analytics.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}
