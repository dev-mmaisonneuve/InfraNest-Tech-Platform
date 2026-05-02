import { Resend } from "resend";

import { company } from "@/data/site-content";
import { env } from "@/lib/env";

function getResendClient() {
  if (!env.resendApiKey) {
    throw new Error("Resend is not configured.");
  }

  return new Resend(env.resendApiKey);
}

type EmailParams = {
  subject: string;
  heading: string;
  rows: Array<[string, string]>;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendNotificationEmail({ subject, heading, rows }: EmailParams) {
  if (!env.notificationEmail) {
    throw new Error("Notification email is not configured.");
  }

  const resend = getResendClient();
  const safeHeading = escapeHtml(heading);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #0f172a;">
      <h1 style="font-size: 24px; margin-bottom: 20px;">${safeHeading}</h1>
      <table style="width: 100%; border-collapse: collapse;">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="padding: 10px 12px; border: 1px solid #dbe3ef; background: #f8fbff; width: 180px; font-weight: 700;">${escapeHtml(label)}</td>
                <td style="padding: 10px 12px; border: 1px solid #dbe3ef;">${escapeHtml(value)}</td>
              </tr>
            `,
          )
          .join("")}
      </table>
    </div>
  `;

  await resend.emails.send({
    from: `${company.shortName} Website <onboarding@resend.dev>`,
    to: env.notificationEmail,
    subject,
    html,
  });
}
