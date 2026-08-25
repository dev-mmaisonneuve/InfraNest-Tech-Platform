export type ServiceInterest = string;

export type ContactSubmission = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  turnstileToken?: string;
};

export type QuoteRequestSubmission = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service_interest: ServiceInterest[];
  project_summary: string;
  timeline?: string;
  budget_range?: string;
  turnstileToken?: string;
};

export type FormApiResponse =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
