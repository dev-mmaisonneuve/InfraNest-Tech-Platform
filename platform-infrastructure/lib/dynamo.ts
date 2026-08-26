import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { env } from "@/lib/env";

let documentClient: DynamoDBDocumentClient | undefined;

/**
 * Returns the shared DynamoDB document client.
 *
 * Cached at module scope so warm Lambda invocations reuse the same client and
 * its connection pool rather than paying setup cost on every form post.
 *
 * Credentials come from the Amplify compute role via the default provider
 * chain. Nothing here reads an access key, and nothing should — a role that the
 * platform rotates is strictly better than a secret pasted into the console.
 */
export function getDynamoDocumentClient() {
  documentClient ??= DynamoDBDocumentClient.from(new DynamoDBClient({ region: env.awsRegion }), {
    marshallOptions: {
      // The optional form fields (phone, company, timeline, budget_range) arrive
      // as undefined when left blank. DynamoDB rejects undefined outright, so
      // without this every submission that skips an optional field would fail.
      removeUndefinedValues: true,
    },
  });

  return documentClient;
}
