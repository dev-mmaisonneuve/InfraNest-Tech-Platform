import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { env } from "@/lib/env";

let sesClient: SESv2Client | undefined;

function getSesClient() {
  sesClient ??= new SESv2Client({ region: env.awsRegion });
  return sesClient;
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

  // SES only accepts a sender on a verified identity, so there is no equivalent
  // of the old Resend shared-sender fallback to degrade to. Failing loudly here
  // is better than a send that SES refuses for reasons the caller cannot see.
  if (!env.notificationFrom) {
    throw new Error("NOTIFICATION_FROM is not configured.");
  }

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

  // Unlike Resend, which resolved with `{ data, error }` and so reported success
  // on an unchecked call, the AWS SDK rejects on a refused send. The throw
  // propagates to the route, which logs it without failing the visitor's request.
  await getSesClient().send(
    new SendEmailCommand({
      FromEmailAddress: env.notificationFrom,
      Destination: { ToAddresses: [env.notificationEmail] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: { Html: { Data: html, Charset: "UTF-8" } },
        },
      },
    }),
  );
}
