const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const VALID_DIFFICULTIES = ["NORMAL", "HARD", "EXTREME"];

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

  // Validate score: positive integer under 10000
  if (
    typeof score !== "number" ||
    !Number.isInteger(score) ||
    score < 1 ||
    score >= 10000
  ) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: "score must be a positive integer under 10000",
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

  const ttl = Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60;

  await ddb.send(
    new PutCommand({
      TableName: "drift-leaderboard",
      Item: {
        difficulty,
        score,
        username,
        ttl,
        timestamp: new Date().toISOString(),
      },
    })
  );

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true }),
  };
};
