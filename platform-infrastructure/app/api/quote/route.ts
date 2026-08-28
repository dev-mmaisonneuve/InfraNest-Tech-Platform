import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { NextRequest, NextResponse } from "next/server";

import { getDynamoDocumentClient } from "@/lib/dynamo";
import { sendAcknowledgmentEmail, sendNotificationEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { quoteSchema } from "@/lib/forms";
import { claimAcknowledgmentSlot, isDuplicateSubmission, validationErrorResponse } from "@/lib/submissions";
import { verifyTurnstileToken } from "@/lib/turnstile";

const duplicateMessage =
  "We've already received a recent request from this address. Please wait a moment before sending another.";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Something went wrong sending your message. Please try again." },
      { status: 400 },
    );
  }

  const parsed = quoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(validationErrorResponse(parsed.error.issues), { status: 400 });
  }

  // Verified before any database work so unverified traffic never reaches DynamoDB.
  const turnstile = await verifyTurnstileToken(parsed.data.turnstileToken);
  if (!turnstile.ok) {
    return NextResponse.json(
      { ok: false, message: "We couldn't verify your submission. Please refresh the page and try again." },
      { status: 400 },
    );
  }

  try {
    const client = getDynamoDocumentClient();

    if (await isDuplicateSubmission(client, env.quoteRequestsTableName, parsed.data.email)) {
      return NextResponse.json({ ok: false, message: duplicateMessage }, { status: 429 });
    }

    await client.send(
      new PutCommand({
        TableName: env.quoteRequestsTableName,
        Item: {
          email: parsed.data.email,
          created_at: new Date().toISOString(),
          name: parsed.data.name,
          phone: parsed.data.phone,
          company: parsed.data.company,
          service_interest: parsed.data.service_interest,
          project_summary: parsed.data.project_summary,
          timeline: parsed.data.timeline,
          budget_range: parsed.data.budget_range,
          source: "website-quote",
          status: "new",
          turnstile_verified: turnstile.verified,
        },
        // The duplicate check above cannot catch two genuinely simultaneous
        // requests. Without this guard the second write would silently replace
        // the first, since both share a partition key and a same-millisecond
        // sort key — losing a real lead rather than merely duplicating one.
        ConditionExpression: "attribute_not_exists(email)",
      }),
    );
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return NextResponse.json({ ok: false, message: duplicateMessage }, { status: 429 });
    }

    console.error("Failed to store quote request", error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong sending your request. Please try again in a moment." },
      { status: 500 },
    );
  }

  // The request is persisted at this point. A notification failure is an internal
  // problem to fix, not a reason to tell the visitor their request was lost and
  // send them into a retry that duplicates the row.
  try {
    await sendNotificationEmail({
      subject: "New InfraNest quote request",
      heading: "New quote request",
      rows: [
        ["Name", parsed.data.name],
        ["Email", parsed.data.email],
        ["Phone", parsed.data.phone ?? "Not provided"],
        ["Company", parsed.data.company ?? "Not provided"],
        ["Services", parsed.data.service_interest.join(", ")],
        ["Timeline", parsed.data.timeline ?? "Not provided"],
        ["Budget", parsed.data.budget_range ?? "Not provided"],
        ["Project summary", parsed.data.project_summary],
      ],
    });
  } catch (error) {
    console.error("Stored quote request but failed to send notification email", error);
  }

  // Best-effort for the same reason as the notification above: the request is
  // already stored, so a failure here must not surface as an error that sends
  // the visitor into a retry.
  try {
    // Claimed atomically rather than inferred from the lead tables: concurrent
    // requests for one address would otherwise each fail to see the others and
    // all send, which is the email-bombing case this guard exists to prevent.
    if (await claimAcknowledgmentSlot(getDynamoDocumentClient(), env.acknowledgmentsTableName, parsed.data.email)) {
      await sendAcknowledgmentEmail("quote", parsed.data.email, parsed.data.name);
    } else {
      console.info("Skipping acknowledgment: address was acknowledged recently");
    }
  } catch (error) {
    console.error("Stored quote request but failed to send visitor acknowledgment", error);
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks — your request has been sent. We'll review it and be in touch soon.",
  });
}
