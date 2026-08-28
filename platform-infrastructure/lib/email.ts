import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { acknowledgment, company } from "@/data/site-content";
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
  await send({ to: env.notificationEmail, subject, html });
}

type SendParams = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

async function send({ to, subject, html, replyTo }: SendParams) {
  if (!env.notificationFrom) {
    throw new Error("NOTIFICATION_FROM is not configured.");
  }

  await getSesClient().send(
    new SendEmailCommand({
      FromEmailAddress: env.notificationFrom,
      Destination: { ToAddresses: [to] },
      ReplyToAddresses: replyTo ? [replyTo] : undefined,
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: { Html: { Data: html, Charset: "UTF-8" } },
        },
      },
    }),
  );
}

/**
 * Reduces a submitted name to a first name that is safe to render in an email.
 *
 * The name field accepts 120 characters of arbitrary text from an anonymous
 * visitor, and this is the only place any of it is echoed back — to an address
 * that same visitor chose. Escaping alone is not enough: an unescaped-looking
 * but syntactically valid "name" could still carry a phone number, a URL, or a
 * sentence of instructions into a stranger's inbox under the InfraNest domain.
 *
 * So this is an allowlist, not a filter. Only the first whitespace-separated
 * token is used, only letters and the marks that legitimately appear inside
 * names survive, and the result is capped. Anything else yields an empty string
 * and the caller falls back to an impersonal greeting.
 */
export function toSafeFirstName(name: string): string {
  const firstToken = name.trim().split(/\s+/)[0] ?? "";

  const letters = firstToken
    // Unicode letters and combining marks, plus the hyphen and apostrophe that
    // appear in names like Anne-Marie or O'Brien. Everything else is dropped.
    .replace(/[^\p{L}\p{M}'\u2019-]/gu, "")
    .slice(0, 40);

  // A token that was mostly punctuation leaves a stub that reads as noise.
  return letters.length >= 2 ? letters : "";
}

/**
 * Sends the visitor an immediate acknowledgment of their submission.
 *
 * The contact page promises a reply "within one business day"; without this the
 * visitor sees a success banner and then silence, with no way to tell whether
 * anything actually arrived.
 *
 * Two deliberate constraints, both about not becoming a spam relay. The forms
 * accept an arbitrary email address from an anonymous visitor, so this endpoint
 * can be pointed at a stranger:
 *
 *   - Nothing the visitor typed is echoed back, so the email cannot be used to
 *     deliver a message to a third party under this domain.
 *   - The body is fixed copy from `data/site-content.ts`, identical every time.
 *
 * Turnstile verification and the duplicate-submission throttle both run before
 * this is reached, which is what limits how often it can be triggered at all.
 */
export async function sendAcknowledgmentEmail(kind: "contact" | "quote", to: string, name?: string) {
  // The footer promises that replying reaches InfraNest directly, which is only
  // true when Reply-To points at the monitored inbox. Without NOTIFICATION_EMAIL
  // the send would still succeed — SES only requires the sender — but replies
  // would go to the unmonitored sending address, making the email a lie. Refuse
  // instead: the route treats this as best-effort, so the visitor's submission
  // is unaffected and the misconfiguration is logged rather than papered over.
  if (!env.notificationEmail) {
    throw new Error("Notification email is not configured; refusing to send an acknowledgment that promises replies reach us.");
  }

  const copy = acknowledgment[kind];
  const firstName = toSafeFirstName(name ?? "");
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi there,";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; line-height: 1.6;">
      <h1 style="font-size: 22px; margin-bottom: 16px;">${escapeHtml(copy.heading)}</h1>
      <p style="margin: 0 0 16px;">${greeting}</p>
      <p style="margin: 0 0 16px;">${escapeHtml(copy.body)}</p>
      <p style="margin: 0 0 16px; color: #334155;">${escapeHtml(acknowledgment.footer)}</p>
      <p style="margin: 0 0 24px;">${escapeHtml(acknowledgment.signOff)}<br>${escapeHtml(company.name)}</p>
      <hr style="border: none; border-top: 1px solid #dbe3ef; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; color: #334155;">
        ${escapeHtml(company.name)}<br>
        ${escapeHtml(company.serviceArea)}<br>
        <a href="mailto:${escapeHtml(company.email)}" style="color: #0b6bcb;">${escapeHtml(company.email)}</a>
        &nbsp;·&nbsp; ${escapeHtml(company.phone)}
      </p>
    </div>
  `;

  // Reply-To points at the monitored inbox rather than the no-reply sender, so a
  // visitor who simply hits reply reaches a person.
  await send({ to, subject: copy.subject, html, replyTo: env.notificationEmail });
}
