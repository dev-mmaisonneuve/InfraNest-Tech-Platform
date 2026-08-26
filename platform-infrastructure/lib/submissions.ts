import { QueryCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { formatZodErrors } from "@/lib/forms";
import type { FormApiResponse } from "@/lib/types";

const throttleWindowMs = 45_000;

/**
 * Rejects a repeat submission from the same email inside a short window.
 *
 * This reads the stored items instead of tracking state in memory. The site runs
 * on serverless instances that do not share memory, so a module-level cache only
 * caught duplicates that happened to land on the same warm instance. Querying the
 * table also means only submissions that were actually persisted count, so a
 * visitor who hits a server error can retry straight away.
 *
 * The tables are keyed on `email` (partition) and `created_at` (sort), so this is
 * a bounded range query against a single partition rather than a filtered scan.
 *
 * Two genuinely simultaneous requests can both pass this check. The conditional
 * write in each route is what stops that race from overwriting a stored lead;
 * Turnstile remains the anti-abuse layer.
 */
export async function isDuplicateSubmission(
  client: DynamoDBDocumentClient,
  tableName: string,
  email: string,
): Promise<boolean> {
  const since = new Date(Date.now() - throttleWindowMs).toISOString();

  try {
    const result = await client.send(
      new QueryCommand({
        TableName: tableName,
        // Both attributes go through ExpressionAttributeNames because DynamoDB's
        // reserved-word list is long and unversioned; aliasing is unconditionally safe.
        KeyConditionExpression: "#email = :email AND #created_at >= :since",
        ExpressionAttributeNames: {
          "#email": "email",
          "#created_at": "created_at",
        },
        ExpressionAttributeValues: {
          ":email": email,
          ":since": since,
        },
        Limit: 1,
        // Only the key is needed to answer "does one exist?", so there is no
        // reason to pull a whole lead across the wire.
        ProjectionExpression: "#email",
      }),
    );

    return (result.Items?.length ?? 0) > 0;
  } catch (error) {
    // Fail open: losing a real lead is worse than accepting a duplicate.
    console.error(`Duplicate-submission check failed for ${tableName}`, error);
    return false;
  }
}

export function validationErrorResponse(issues: Parameters<typeof formatZodErrors>[0]): FormApiResponse {
  return {
    ok: false,
    message: "Please review the highlighted fields and try again.",
    fieldErrors: formatZodErrors(issues),
  };
}
