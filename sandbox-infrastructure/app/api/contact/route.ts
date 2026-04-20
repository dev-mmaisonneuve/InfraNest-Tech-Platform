import { NextRequest, NextResponse } from "next/server";

import { sendNotificationEmail } from "@/lib/email";
import { contactSchema } from "@/lib/forms";
import { getSupabaseServerClient } from "@/lib/supabase";
import { isDuplicateSubmission, validationErrorResponse } from "@/lib/submissions";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(validationErrorResponse(parsed.error.issues), { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isDuplicateSubmission("contact", parsed.data.email, ip)) {
    return NextResponse.json(
      { ok: false, message: "A recent submission from this email is already being processed. Please wait a moment." },
      { status: 429 },
    );
  }

  const turnstileVerified = await verifyTurnstileToken(parsed.data.turnstileToken);
  if (!turnstileVerified) {
    return NextResponse.json(
      { ok: false, message: "Spam protection could not be verified. Please refresh and try again." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseServerClient();

    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      company: parsed.data.company,
      message: parsed.data.message,
      source: "website-contact",
      status: "new",
      turnstile_verified: turnstileVerified,
    });

    if (error) {
      throw error;
    }

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

    return NextResponse.json({ ok: true, message: "Thanks. Your message is in and InfraNest will follow up shortly." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "The message could not be sent right now. Please try again in a moment." },
      { status: 500 },
    );
  }
}
