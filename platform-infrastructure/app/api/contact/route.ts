import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { NextRequest, NextResponse } from "next/server";

import { getDynamoDocumentClient } from "@/lib/dynamo";
import { sendNotificationEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { contactSchema } from "@/lib/forms";
import { isDuplicateSubmission, validationErrorResponse } from "@/lib/submissions";
import { verifyTurnstileToken } from "@/lib/turnstile";

const duplicateMessage =
  "A recent submission from this email is already being processed. Please wait a moment.";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "The form submission could not be read. Please try again." },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(validationErrorResponse(parsed.error.issues), { status: 400 });
  }

  // Verified before any database work so unverified traffic never reaches DynamoDB.
  const turnstile = await verifyTurnstileToken(parsed.data.turnstileToken);
  if (!turnstile.ok) {
    return NextResponse.json(
      { ok: false, message: "Spam protection could not be verified. Please refresh and try again." },
      { status: 400 },
    );
  }

  try {
    const client = getDynamoDocumentClient();

    if (await isDuplicateSubmission(client, env.leadsTableName, parsed.data.email)) {
      return NextResponse.json({ ok: false, message: duplicateMessage }, { status: 429 });
    }

    await client.send(
      new PutCommand({
        TableName: env.leadsTableName,
        Item: {
          email: parsed.data.email,
          created_at: new Date().toISOString(),
          name: parsed.data.name,
          phone: parsed.data.phone,
          company: parsed.data.company,
          message: parsed.data.message,
          source: "website-contact",
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

    console.error("Failed to store contact submission", error);
    return NextResponse.json(
      { ok: false, message: "The message could not be sent right now. Please try again in a moment." },
      { status: 500 },
    );
  }

  // The lead is persisted at this point. A notification failure is an internal
  // problem to fix, not a reason to tell the visitor their message was lost and
  // send them into a retry that duplicates the row.
  try {
    await sendNotificationEmail({
      subject: "New InfraNest contact form submission",
      heading: "New contact form submission",
      rows: [
        ["Name", parsed.data.name],
        ["Email", parsed.data.email],
        ["Phone", parsed.data.phone ?? "Not provided"],
        ["Company", parsed.data.company ?? "Not provided"],
        ["Message", parsed.data.message],
      ],
    });
  } catch (error) {
    console.error("Stored contact lead but failed to send notification email", error);
  }

  return NextResponse.json({ ok: true, message: "Thanks. Your message is in and InfraNest will follow up shortly." });
}
