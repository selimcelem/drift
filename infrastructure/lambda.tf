data "archive_file" "submit_score" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/submit-score"
  output_path = "${path.module}/lambda/submit-score.zip"
}

data "archive_file" "get_leaderboard" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/get-leaderboard"
  output_path = "${path.module}/lambda/get-leaderboard.zip"
}

resource "aws_iam_role" "lambda_exec" {
  name = "drift-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "drift-lambda-dynamodb"
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
          "dynamodb:DeleteItem"
        ]
        Resource = [
          aws_dynamodb_table.leaderboard.arn,
          "${aws_dynamodb_table.leaderboard.arn}/index/*"
        ]
      }
    ]
  })
}

resource "aws_lambda_function" "submit_score" {
  function_name    = "drift-submit-score"
  filename         = data.archive_file.submit_score.output_path
  source_code_hash = data.archive_file.submit_score.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  role             = aws_iam_role.lambda_exec.arn
  timeout          = 10
}

resource "aws_lambda_function" "get_leaderboard" {
  function_name    = "drift-get-leaderboard"
  filename         = data.archive_file.get_leaderboard.output_path
  source_code_hash = data.archive_file.get_leaderboard.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  role             = aws_iam_role.lambda_exec.arn
  timeout          = 10
}
