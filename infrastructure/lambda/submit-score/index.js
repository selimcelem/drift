const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const VALID_DIFFICULTIES = ["NORMAL", "HARD", "EXTREME"];
const SHORT_TTL_SECONDS = 7 * 24 * 60 * 60;
const LONG_TTL_SECONDS = 30 * 24 * 60 * 60;

exports.handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const { username, score, difficulty } = body;

  // Validate username: string, 1-20 chars, alphanumeric
  if (
    typeof username !== "string" ||
    username.length < 1 ||
    username.length > 20 ||
    !/^[a-zA-Z0-9]+$/.test(username)
  ) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: "username must be 1-20 alphanumeric characters",
      }),
    };
  }

  // Validate score: positive integer under 999999
  if (
    typeof score !== "number" ||
    !Number.isInteger(score) ||
    score < 1 ||
    score >= 999999
  ) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: "score must be a positive integer under 999999",
      }),
    };
  }

  // Validate difficulty
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: `difficulty must be one of: ${VALID_DIFFICULTIES.join(", ")}`,
      }),
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const shortTtl = now + SHORT_TTL_SECONDS;
  const longTtl = now + LONG_TTL_SECONDS;

  await ddb.send(
    new PutCommand({
      TableName: "drift-leaderboard",
      Item: {
        difficulty,
        score,
        username,
        ttl: shortTtl,
        timestamp: new Date().toISOString(),
      },
    })
  );

  // Query all scores for this difficulty, descending, and reassign TTLs:
  // top 10 get the long TTL, everything else gets the short TTL. Nothing is
  // ever deleted — scores outside the top 10 expire naturally.
  const all = await ddb.send(
    new QueryCommand({
      TableName: "drift-leaderboard",
      KeyConditionExpression: "difficulty = :d",
      ExpressionAttributeValues: { ":d": difficulty },
      ScanIndexForward: false,
    })
  );
  const items = all.Items || [];
  await Promise.all(
    items.map((item, index) =>
      ddb.send(
        new UpdateCommand({
          TableName: "drift-leaderboard",
          Key: { difficulty: item.difficulty, score: item.score },
          UpdateExpression: "SET #ttl = :ttl",
          ExpressionAttributeNames: { "#ttl": "ttl" },
          ExpressionAttributeValues: {
            ":ttl": index < 10 ? longTtl : shortTtl,
          },
        })
      )
    )
  );

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true }),
  };
};
