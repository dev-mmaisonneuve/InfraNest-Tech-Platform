import test from "node:test";
import assert from "node:assert/strict";

import { quoteOptions } from "@/data/site-content";
import { contactSchema, quoteSchema } from "@/lib/forms";
import { createSubmissionFingerprint } from "@/lib/submissions";

const baseQuote = {
  name: "Casey Founder",
  email: "casey@example.com",
  project_summary: "We need structure around support and SaaS ownership.",
};

test("contact schema accepts a valid submission", () => {
  const result = contactSchema.safeParse({
    name: "Casey Founder",
    email: "casey@example.com",
    phone: "617-555-0199",
    company: "InfraNest",
    message: "We need help cleaning up cloud access and user onboarding.",
  });

  assert.equal(result.success, true);
});

test("quote schema requires at least one service", () => {
  const result = quoteSchema.safeParse({
    name: "Casey Founder",
    email: "casey@example.com",
    service_interest: [],
    project_summary: "We need structure around support and SaaS ownership.",
  });

  assert.equal(result.success, false);
});

test("quote schema accepts every service the form renders", () => {
  const result = quoteSchema.safeParse({
    ...baseQuote,
    service_interest: quoteOptions.map((option) => option.value),
  });

  assert.equal(result.success, true);
});

test("quote schema rejects services that are not offered", () => {
  const result = quoteSchema.safeParse({
    ...baseQuote,
    service_interest: ["Underwater basket weaving"],
  });

  assert.equal(result.success, false);
});

test("quote schema removes duplicate service selections", () => {
  const service = quoteOptions[0].value;
  const result = quoteSchema.safeParse({
    ...baseQuote,
    service_interest: [service, service],
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.success && result.data.service_interest, [service]);
});

test("submission fingerprints are stable", () => {
  const a = createSubmissionFingerprint("quote", "casey@example.com", "127.0.0.1");
  const b = createSubmissionFingerprint("quote", "casey@example.com", "127.0.0.1");

  assert.equal(a, b);
});
