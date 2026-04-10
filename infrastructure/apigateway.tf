resource "aws_apigatewayv2_api" "api" {
  name          = "drift-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins  = ["*"]
    allow_methods  = ["GET", "POST", "OPTIONS"]
    allow_headers  = ["content-type", "authorization"]
    expose_headers = []
    max_age        = 300
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

# Submit score integration
resource "aws_apigatewayv2_integration" "submit_score" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.submit_score.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "submit_score" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /score"
  target    = "integrations/${aws_apigatewayv2_integration.submit_score.id}"
}

resource "aws_lambda_permission" "submit_score" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.submit_score.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# Get leaderboard integration
resource "aws_apigatewayv2_integration" "get_leaderboard" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.get_leaderboard.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_leaderboard" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /leaderboard"
  target    = "integrations/${aws_apigatewayv2_integration.get_leaderboard.id}"
}

resource "aws_lambda_permission" "get_leaderboard" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_leaderboard.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}
