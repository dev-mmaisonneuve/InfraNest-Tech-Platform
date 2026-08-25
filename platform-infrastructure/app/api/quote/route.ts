import { NextRequest, NextResponse } from "next/server";

import { sendNotificationEmail } from "@/lib/email";
import { quoteSchema } from "@/lib/forms";
import { getSupabaseServerClient } from "@/lib/supabase";
import { isDuplicateSubmission, validationErrorResponse } from "@/lib/submissions";
import { verifyTurnstileToken } from "@/lib/turnstile";

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

  const parsed = quoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(validationErrorResponse(parsed.error.issues), { status: 400 });
  }

  // Verified before any database work so unverified traffic never reaches Supabase.
  const turnstile = await verifyTurnstileToken(parsed.data.turnstileToken);
  if (!turnstile.ok) {
    return NextResponse.json(
      { ok: false, message: "Spam protection could not be verified. Please refresh and try again." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseServerClient();

    if (await isDuplicateSubmission(supabase, "quote_requests", parsed.data.email)) {
      return NextResponse.json(
        { ok: false, message: "A recent quote request from this email is already being processed. Please wait a moment." },
        { status: 429 },
      );
    }

    const { error } = await supabase.from("quote_requests").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      company: parsed.data.company,
      service_interest: parsed.data.service_interest,
      project_summary: parsed.data.project_summary,
      timeline: parsed.data.timeline,
      budget_range: parsed.data.budget_range,
      source: "website-quote",
      status: "new",
      turnstile_verified: turnstile.verified,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Failed to store quote request", error);
    return NextResponse.json(
      { ok: false, message: "The quote request could not be sent right now. Please try again in a moment." },
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

  return NextResponse.json({
    ok: true,
    message: "Thanks. Your quote request has been submitted and InfraNest will reach out with a practical next step.",
  });
}
