import { z } from "zod";

import { quoteOptions } from "@/data/site-content";

/** Derived from the rendered checkboxes so the cap can never drift from the UI. */
const serviceValues = quoteOptions.map((option) => option.value);

const optionalText = z
  .string()
  .trim()
  .max(120, "Please keep this under 120 characters.")
  .optional()
  .transform((value) => value || undefined);

/**
 * Normalised on the way in so the duplicate-submission lookup, which compares
 * against the stored value, matches regardless of how the visitor typed it.
 */
const emailField = z.email("Enter a valid email address.").trim().toLowerCase();

const requiredText = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required.`)
    .max(max, `${field} must be ${max} characters or fewer.`);

export const contactSchema = z.object({
  name: requiredText("Name", 120),
  email: emailField,
  phone: optionalText,
  company: optionalText,
  message: requiredText("Message", 2000),
  turnstileToken: z.string().optional(),
});

export const quoteSchema = z.object({
  name: requiredText("Name", 120),
  email: emailField,
  phone: optionalText,
  company: optionalText,
  service_interest: z
    .array(z.string().trim().min(1))
    .min(1, "Select at least one service.")
    .max(serviceValues.length, `Select up to ${serviceValues.length} services.`)
    .refine((values) => values.every((value) => serviceValues.includes(value)), {
      message: "Select services from the listed options.",
    })
    .transform((values) => [...new Set(values)]),
  project_summary: requiredText("Project summary", 2500),
  timeline: optionalText,
  budget_range: optionalText,
  turnstileToken: z.string().optional(),
});

export const formatZodErrors = (issues: z.ZodIssue[]) => {
  return issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = String(issue.path[0] ?? "form");
    const next = acc[key] ?? [];
    next.push(issue.message);
    acc[key] = next;
    return acc;
  }, {});
};
