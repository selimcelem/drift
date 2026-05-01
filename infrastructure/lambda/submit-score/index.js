const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const VALID_DIFFICULTIES = ["NORMAL", "HARD", "EXTREME", "IMPOSSIBLE"];
const TOP_TEN_TTL_SECONDS = 30 * 24 * 60 * 60;
const SHORT_TTL_SECONDS = 24 * 60 * 60;

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

  // Dev pilot exclusion — author's own playtests never touch the board. Done
  // before validation so a typo in the dev build can't accidentally land.
  if (typeof username === "string" && username.toLowerCase().trim() === "dev") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ skipped: "dev pilot" }),
    };
  }

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

  // TTL is decided at write time, then never revisited. Query the current
  // top 10 (one extra read per write — cheap, free-tier safe). If the new
  // score lands in the top 10 it gets 30 days; otherwise 1 day. We do NOT
  // rebalance existing items: scores knocked out of the top 10 keep their
  // old long TTL but are filtered out by get-leaderboard's Limit:10 query,
  // so they're invisible to players. Trade-off: small residue in DynamoDB
  // until original TTLs expire — accepted to avoid a cron Lambda.
  const topTen = await ddb.send(
    new QueryCommand({
      TableName: "drift-leaderboard",
      KeyConditionExpression: "difficulty = :d",
      ExpressionAttributeValues: { ":d": difficulty },
      ScanIndexForward: false,
      Limit: 10,
    })
  );
  const topTenItems = topTen.Items || [];
  const tenthScore =
    topTenItems.length >= 10 ? topTenItems[topTenItems.length - 1].score || 0 : 0;
  const inTopTen = score >= tenthScore;
  const now = Math.floor(Date.now() / 1000);
  const ttl = now + (inTopTen ? TOP_TEN_TTL_SECONDS : SHORT_TTL_SECONDS);

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
