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

/**
 * How long an address is spared a second acknowledgment email.
 *
 * Much longer than the 45-second submission throttle, and for a different
 * purpose. The throttle stops accidental double-submits; this stops the forms
 * being used to send repeated unsolicited mail to someone else's address.
 */
const acknowledgmentWindowMs = 24 * 60 * 60 * 1000;

/**
 * Whether this address has already been sent an acknowledgment recently.
 *
 * The submission throttle is not sufficient protection on its own: it is scoped
 * to 45 seconds and to a single table, so alternating between the contact and
 * quote forms bypasses it entirely, and a script can simply wait it out. Since
 * the acknowledgment goes to whatever address the visitor typed, that would let
 * the site be used to mail a stranger repeatedly.
 *
 * Both tables are checked, over a much longer window, so an address receives at
 * most one acknowledgment per day no matter which form is used or how often.
 *
 * Note this fails CLOSED, unlike `isDuplicateSubmission` which fails open. The
 * costs are asymmetric in opposite directions: there, refusing a real lead is
 * worse than storing a duplicate; here, skipping one acknowledgment is a minor
 * inconvenience while sending unsolicited mail risks the SES reputation that
 * internal lead notifications also depend on.
 */
export async function wasRecentlyAcknowledged(
  client: DynamoDBDocumentClient,
  tableNames: string[],
  email: string,
  currentCreatedAt: string,
): Promise<boolean> {
  const since = new Date(Date.now() - acknowledgmentWindowMs).toISOString();

  // DynamoDB's BETWEEN includes both bounds, and the route writes the current
  // row before this runs — so passing `currentCreatedAt` directly would always
  // match that row, always report an earlier acknowledgment, and silently stop
  // the email from ever being sent. A sort key can carry only one condition, so
  // the upper bound is made exclusive by stepping back a millisecond rather than
  // by combining `>= :since` with `< :before`.
  const before = new Date(Date.parse(currentCreatedAt) - 1).toISOString();

  if (before < since) {
    return false;
  }

  try {
    const results = await Promise.all(
      tableNames.map((tableName) =>
        client.send(
          new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "#email = :email AND #created_at BETWEEN :since AND :before",
            ExpressionAttributeNames: { "#email": "email", "#created_at": "created_at" },
            ExpressionAttributeValues: { ":email": email, ":since": since, ":before": before },
            Limit: 1,
            ProjectionExpression: "#email",
          }),
        ),
      ),
    );

    return results.some((result) => (result.Items?.length ?? 0) > 0);
  } catch (error) {
    console.error("Acknowledgment rate-limit check failed; skipping the acknowledgment", error);
    return true;
  }
}

export function validationErrorResponse(issues: Parameters<typeof formatZodErrors>[0]): FormApiResponse {
  return {
    ok: false,
    message: "Please review the highlighted fields and try again.",
    fieldErrors: formatZodErrors(issues),
  };
}
