import test from "node:test";
import assert from "node:assert/strict";

import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { isDuplicateSubmission, wasRecentlyAcknowledged } from "@/lib/submissions";

type SentCommand = { input: Record<string, unknown> };

/** Minimal stand-in for the document client: records the command, returns a canned result. */
function stubClient(result: unknown | (() => never)) {
  const sent: SentCommand[] = [];

  const client = {
    send(command: SentCommand) {
      sent.push(command);
      if (typeof result === "function") {
        return Promise.reject((result as () => never)());
      }
      return Promise.resolve(result);
    },
  } as unknown as DynamoDBDocumentClient;

  return { client, sent };
}

test("reports a duplicate when a recent item exists", async () => {
  const { client } = stubClient({ Items: [{ email: "casey@example.com" }] });

  assert.equal(await isDuplicateSubmission(client, "leads", "casey@example.com"), true);
});

test("allows the submission when no recent item exists", async () => {
  const { client } = stubClient({ Items: [] });

  assert.equal(await isDuplicateSubmission(client, "leads", "casey@example.com"), false);
});

test("allows the submission when DynamoDB returns no Items key at all", async () => {
  const { client } = stubClient({});

  assert.equal(await isDuplicateSubmission(client, "leads", "casey@example.com"), false);
});

test("fails open when the query throws", async () => {
  // Losing a real lead is worse than accepting a duplicate, so a broken check
  // must let the submission through rather than reject it.
  const { client } = stubClient(() => {
    throw new Error("DynamoDB unavailable");
  });

  assert.equal(await isDuplicateSubmission(client, "leads", "casey@example.com"), false);
});

test("queries the given table by email within the throttle window", async () => {
  const { client, sent } = stubClient({ Items: [] });
  const before = Date.now();

  await isDuplicateSubmission(client, "quote_requests", "casey@example.com");

  assert.equal(sent.length, 1);
  const input = sent[0].input;

  assert.equal(input.TableName, "quote_requests");
  assert.equal(input.Limit, 1);

  const values = input.ExpressionAttributeValues as Record<string, string>;
  assert.equal(values[":email"], "casey@example.com");

  // The window is 45s; assert the bound lands inside it rather than pinning an
  // exact timestamp, which would make the test clock-sensitive.
  const sinceMs = Date.parse(values[":since"]);
  assert.ok(sinceMs <= before - 45_000 + 1_000, "since should be at least ~45s in the past");
  assert.ok(sinceMs > before - 60_000, "since should not be more than a minute in the past");
});

test("aliases both key attributes so reserved words cannot break the query", async () => {
  const { client, sent } = stubClient({ Items: [] });

  await isDuplicateSubmission(client, "leads", "casey@example.com");

  const names = sent[0].input.ExpressionAttributeNames as Record<string, string>;
  assert.equal(names["#email"], "email");
  assert.equal(names["#created_at"], "created_at");
  assert.equal(sent[0].input.KeyConditionExpression, "#email = :email AND #created_at >= :since");
});

// ── wasRecentlyAcknowledged ───────────────────────────────────────────────────
// This guard stops the forms being used to mail a stranger repeatedly. Its
// failure mode is silent in both directions: too strict and no visitor ever
// gets an acknowledgment, too loose and the site becomes a spam relay.

const CURRENT = "2026-08-27T12:00:00.000Z";

test("does not treat the submission being processed as a prior acknowledgment", async () => {
  // The route writes the current row before this runs. DynamoDB's BETWEEN
  // includes both bounds, so an inclusive upper bound would match that row and
  // suppress every acknowledgment forever.
  const { client, sent } = stubClient({ Items: [] });

  const result = await wasRecentlyAcknowledged(client, ["leads"], "casey@example.com", CURRENT);

  assert.equal(result, false);
  const values = sent[0].input.ExpressionAttributeValues as Record<string, string>;
  assert.ok(
    values[":before"] < CURRENT,
    `upper bound ${values[":before"]} must be strictly before ${CURRENT}`,
  );
});

test("reports a prior acknowledgment when an earlier submission exists", async () => {
  const { client } = stubClient({ Items: [{ email: "casey@example.com" }] });

  assert.equal(await wasRecentlyAcknowledged(client, ["leads"], "casey@example.com", CURRENT), true);
});

test("checks every table, so alternating between the two forms cannot bypass it", async () => {
  const { client, sent } = stubClient({ Items: [] });

  await wasRecentlyAcknowledged(client, ["leads", "quote_requests"], "casey@example.com", CURRENT);

  assert.deepEqual(
    sent.map((s) => s.input.TableName),
    ["leads", "quote_requests"],
  );
});

test("fails closed when the query throws", async () => {
  // Opposite of isDuplicateSubmission on purpose: skipping one acknowledgment is
  // a minor inconvenience, while sending unsolicited mail risks the sending
  // reputation that internal lead notifications also depend on.
  const { client } = stubClient(() => {
    throw new Error("DynamoDB unavailable");
  });

  assert.equal(await wasRecentlyAcknowledged(client, ["leads"], "casey@example.com", CURRENT), true);
});

test("looks back 24 hours from now, far longer than the submission throttle", async () => {
  // The lower bound is relative to now rather than to the submission timestamp,
  // so it is asserted against now — comparing it to the fixture timestamp would
  // measure nothing.
  const { client, sent } = stubClient({ Items: [] });
  const before = Date.now();

  await wasRecentlyAcknowledged(client, ["leads"], "casey@example.com", CURRENT);

  const values = sent[0].input.ExpressionAttributeValues as Record<string, string>;
  const lookbackMs = before - Date.parse(values[":since"]);
  const dayMs = 24 * 60 * 60 * 1000;

  assert.ok(
    Math.abs(lookbackMs - dayMs) < 5_000,
    `looked back ${lookbackMs}ms, expected ~${dayMs}ms`,
  );
  // Materially longer than the 45s duplicate throttle, which is the point: that
  // window is short enough to simply wait out.
  assert.ok(lookbackMs > 45_000, "must be far longer than the submission throttle");
});
