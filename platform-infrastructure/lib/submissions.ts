import type { SupabaseClient } from "@supabase/supabase-js";

import { formatZodErrors } from "@/lib/forms";
import type { FormApiResponse } from "@/lib/types";

const throttleWindowMs = 45_000;

type SubmissionTable = "leads" | "quote_requests";

/**
 * Rejects a repeat submission from the same email inside a short window.
 *
 * This reads the stored rows instead of tracking state in memory. The site runs
 * on serverless instances that do not share memory, so a module-level cache only
 * caught duplicates that happened to land on the same warm instance. Querying the
 * table also means only submissions that were actually persisted count, so a
 * visitor who hits a server error can retry straight away.
 *
 * Two genuinely simultaneous requests can both pass this check. The cost of that
 * race is one duplicate row, which is well worth avoiding the schema change an
 * atomic reservation would require. Turnstile remains the anti-abuse layer.
 */
export async function isDuplicateSubmission(
  supabase: SupabaseClient,
  table: SubmissionTable,
  email: string,
): Promise<boolean> {
  const since = new Date(Date.now() - throttleWindowMs).toISOString();

  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("email", email)
    .gte("created_at", since)
    .limit(1);

  if (error) {
    // Fail open: losing a real lead is worse than accepting a duplicate.
    console.error(`Duplicate-submission check failed for ${table}`, error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

export function validationErrorResponse(issues: Parameters<typeof formatZodErrors>[0]): FormApiResponse {
  return {
    ok: false,
    message: "Please review the highlighted fields and try again.",
    fieldErrors: formatZodErrors(issues),
  };
}
