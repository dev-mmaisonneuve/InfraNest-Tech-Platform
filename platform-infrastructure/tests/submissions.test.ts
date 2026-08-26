import test from "node:test";
import assert from "node:assert/strict";

import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { isDuplicateSubmission } from "@/lib/submissions";

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
