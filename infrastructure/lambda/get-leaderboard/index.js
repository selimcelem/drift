const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

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

  const difficulty =
    event.queryStringParameters?.difficulty || "NORMAL";

  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: `difficulty must be one of: ${VALID_DIFFICULTIES.join(", ")}`,
      }),
    };
  }

  const result = await ddb.send(
    new QueryCommand({
      TableName: "drift-leaderboard",
      KeyConditionExpression: "difficulty = :d",
      ExpressionAttributeValues: { ":d": difficulty },
      ScanIndexForward: false,
      Limit: 10,
    })
  );

  const leaderboard = (result.Items || []).map((item, i) => ({
    rank: i + 1,
    username: item.username,
    score: item.score,
    difficulty: item.difficulty,
  }));

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ leaderboard }),
  };
};
