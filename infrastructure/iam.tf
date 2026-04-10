data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_role" "github_actions" {
  name = "drift-github-actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            "token.actions.githubusercontent.com:sub" = "repo:selimcelem/drift:ref:refs/heads/main"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "github_actions" {
  name = "drift-github-actions-policy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "dynamodb:*"
        Resource = "arn:aws:dynamodb:eu-west-1:${var.aws_account_id}:table/drift-*"
      },
      {
        Effect   = "Allow"
        Action   = "lambda:*"
        Resource = "arn:aws:lambda:eu-west-1:${var.aws_account_id}:function:drift-*"
      },
      {
        Effect   = "Allow"
        Action   = "apigateway:*"
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = "s3:*"
        Resource = [
          "arn:aws:s3:::drift-terraform-state-*",
          "arn:aws:s3:::drift-terraform-state-*/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = "iam:*"
        Resource = "arn:aws:iam::${var.aws_account_id}:role/drift-*"
      }
    ]
  })
}
