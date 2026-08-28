import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { PutCommand, QueryCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

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
 * Claims the right to send this address an acknowledgment, returning false if
 * another request already holds it.
 *
 * This is a conditional write rather than a read-then-decide, because reading
 * the lead tables cannot answer the question safely. Concurrent submissions for
 * one address each write their own row and then look for an earlier one; with
 * requests arriving out of order, and DynamoDB queries being eventually
 * consistent by default, each can conclude it is the first and send. Pre-solved
 * Turnstile tokens fired in parallel turn that into an email-bombing vector,
 * which is exactly what this guard exists to prevent.
 *
 * A single conditional PutItem is atomic within a partition, so exactly one
 * concurrent request can win the slot no matter how many race for it.
 *
 * `expires_at` drives TTL, which is garbage collection only — DynamoDB may take
 * up to 48 hours to delete an expired item, so the window is enforced by the
 * `sent_at` comparison in the condition rather than by expiry.
 *
 * Fails CLOSED, deliberately unlike `isDuplicateSubmission` which fails open.
 * The costs are asymmetric in opposite directions: refusing a real lead is worse
 * than storing a duplicate, but skipping one acknowledgment is a minor
 * inconvenience next to sending unsolicited mail and damaging the sending
 * reputation that internal lead notifications also depend on.
 */
export async function claimAcknowledgmentSlot(
  client: DynamoDBDocumentClient,
  tableName: string,
  email: string,
): Promise<boolean> {
  const now = Date.now();
  const since = new Date(now - acknowledgmentWindowMs).toISOString();

  try {
    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          email,
          sent_at: new Date(now).toISOString(),
          // Two windows of slack so TTL never removes a row the condition still
          // needs to see.
          expires_at: Math.floor((now + acknowledgmentWindowMs * 2) / 1000),
        },
        ConditionExpression: "attribute_not_exists(email) OR #sent_at < :since",
        ExpressionAttributeNames: { "#sent_at": "sent_at" },
        ExpressionAttributeValues: { ":since": since },
      }),
    );

    return true;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return false;
    }

    console.error("Acknowledgment slot claim failed; skipping the acknowledgment", error);
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
