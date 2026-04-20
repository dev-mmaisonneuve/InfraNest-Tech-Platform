import { createHash } from "node:crypto";

import { formatZodErrors } from "@/lib/forms";
import type { FormApiResponse } from "@/lib/types";

const throttleWindowMs = 45_000;
const recentSubmissions = new Map<string, number>();

export function createSubmissionFingerprint(route: string, email: string, ip: string) {
  return createHash("sha256").update(`${route}:${email.toLowerCase()}:${ip}`).digest("hex");
}

export function isDuplicateSubmission(route: string, email: string, ip: string) {
  const now = Date.now();

  for (const [key, timestamp] of recentSubmissions) {
    if (now - timestamp > throttleWindowMs) {
      recentSubmissions.delete(key);
    }
  }

  const fingerprint = createSubmissionFingerprint(route, email, ip);
  const previous = recentSubmissions.get(fingerprint);

  if (previous && now - previous < throttleWindowMs) {
    return true;
  }

  recentSubmissions.set(fingerprint, now);
  return false;
}

export function validationErrorResponse(issues: Parameters<typeof formatZodErrors>[0]): FormApiResponse {
  return {
    ok: false,
    message: "Please review the highlighted fields and try again.",
    fieldErrors: formatZodErrors(issues),
  };
}
