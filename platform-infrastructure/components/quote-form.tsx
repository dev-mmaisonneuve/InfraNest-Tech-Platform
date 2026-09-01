"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const serviceIcons: Record<string, React.ReactNode> = {
  "IT operations & technology management": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1.2rem" height="1.2rem" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  "Cloud & platform engineering": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1.2rem" height="1.2rem" aria-hidden="true">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  ),
  "SaaS & workspace administration": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1.2rem" height="1.2rem" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  "Managed IT services & support": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1.2rem" height="1.2rem" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  "Workplace technology & collaboration": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1.2rem" height="1.2rem" aria-hidden="true">
      <path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
      <path d="M2 12a9 9 0 0 1 8 8" />
      <path d="M2 16a5 5 0 0 1 4 4" />
      <line x1="2" y1="20" x2="2.01" y2="20" />
    </svg>
  ),
  "Web presence & managed hosting": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1.2rem" height="1.2rem" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  "Security & access foundations": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1.2rem" height="1.2rem" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  "Flexible engagement models": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1.2rem" height="1.2rem" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
};

import { TurnstileWidget, type TurnstileHandle } from "@/components/turnstile-widget";
import { budgetRanges, quoteOptions, timelineOptions } from "@/data/site-content";
import type { FormApiResponse } from "@/lib/types";

type QuoteFormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service_interest: string[];
  project_summary: string;
  timeline: string;
  budget_range: string;
  turnstileToken: string;
};

const initialState: QuoteFormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service_interest: [],
  project_summary: "",
  timeline: "",
  budget_range: "",
  turnstileToken: "",
};

export function QuoteForm() {
  const [form, setForm] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<FormApiResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const turnstileRef = useRef<TurnstileHandle>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setStatus(null);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as FormApiResponse;
      setStatus(payload);

      if (payload.ok) {
        setForm(initialState);
        return;
      }

      setFieldErrors(payload.fieldErrors ?? {});
    } catch {
      setStatus({
        ok: false,
        message: "Something went wrong sending your request. Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
      // The submitted token is spent either way, so always ask for a new one.
      turnstileRef.current?.reset();
    }
  }

  function toggleService(service: string) {
    setForm((current) => {
      const isSelected = current.service_interest.includes(service);
      return {
        ...current,
        service_interest: isSelected
          ? current.service_interest.filter((item) => item !== service)
          : [...current.service_interest, service],
      };
    });
  }

  return (
    <form className="form-shell form-panel" onSubmit={handleSubmit}>
      <div className="stack" style={{ padding: "1.35rem", gap: "1rem" }}>
        <div className="section-heading" style={{ marginBottom: 0 }}>
          <span className="eyebrow">Quote request</span>
          <h2>What do you need help with?</h2>
          <p>Give InfraNest enough context to recommend the right starting point without overcomplicating the process.</p>
        </div>

        <div className="form-grid form-grid--quote">
          <Field
            label="Name"
            name="name"
            value={form.name}
            error={fieldErrors.name?.[0]}
            onChange={(value) => setForm((current) => ({ ...current, name: value }))}
          required
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            error={fieldErrors.email?.[0]}
            onChange={(value) => setForm((current) => ({ ...current, email: value }))}
          required
          />
          <Field
            label="Phone"
            name="phone"
            type="tel"
            value={form.phone}
            error={fieldErrors.phone?.[0]}
            onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
          />
          <Field
            label="Company"
            name="company"
            value={form.company}
            error={fieldErrors.company?.[0]}
            onChange={(value) => setForm((current) => ({ ...current, company: value }))}
          />

          <div className="field field-full" role="group" aria-labelledby="service-interest-label">
            <label id="service-interest-label">Service interest</label>
            <div className="checkbox-grid">
              {quoteOptions.map((option) => (
                <label className="checkbox-card" key={option.value}>
                  <input
                    type="checkbox"
                    checked={form.service_interest.includes(option.value)}
                    onChange={() => toggleService(option.value)}
                  />
                  <span className="checkbox-marker" aria-hidden="true">
                    <span className="checkbox-badge">{serviceIcons[option.value]}</span>
                    <span className="checkbox-check">✓</span>
                  </span>
                  <span className="checkbox-copy">{option.value}</span>
                </label>
              ))}
            </div>
            {fieldErrors.service_interest?.[0] ? <span className="error-text">{fieldErrors.service_interest[0]}</span> : null}
          </div>

          <Field
            label="Project summary"
            name="project_summary"
            value={form.project_summary}
            error={fieldErrors.project_summary?.[0]}
            multiline
            full
            onChange={(value) => setForm((current) => ({ ...current, project_summary: value }))}
          required
          />

          <div className="field">
            <label htmlFor="timeline">Timeline</label>
            <select
              id="timeline"
              name="timeline"
              value={form.timeline}
              onChange={(event) => setForm((current) => ({ ...current, timeline: event.target.value }))}
            >
              <option value="">Select a timeline</option>
              {timelineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldErrors.timeline?.[0] ? <span className="error-text">{fieldErrors.timeline[0]}</span> : null}
          </div>

          <div className="field">
            <label htmlFor="budget_range">Budget range</label>
            <select
              id="budget_range"
              name="budget_range"
              value={form.budget_range}
              onChange={(event) => setForm((current) => ({ ...current, budget_range: event.target.value }))}
            >
              <option value="">Select a range</option>
              {budgetRanges.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldErrors.budget_range?.[0] ? <span className="error-text">{fieldErrors.budget_range[0]}</span> : null}
          </div>
        </div>

        <TurnstileWidget ref={turnstileRef} onToken={(token) => setForm((current) => ({ ...current, turnstileToken: token }))} />
        <p className="form-note">
          This form is protected against spam and abuse. See how we handle your
          information in our <Link href="/privacy">privacy policy</Link>.
        </p>

        {status ? (
          <div className={`form-status ${status.ok ? "success" : "error"}`} role="status">
            {status.message}
          </div>
        ) : null}

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Request a quote"}
        </button>

        <p className="form-note" style={{ textAlign: "center", fontSize: "0.85rem" }}>
          No commitment required.
        </p>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  full?: boolean;
  error?: string;
  required?: boolean;
};

function Field({ label, name, value, onChange, type = "text", multiline = false, full = false, error, required = false }: FieldProps) {
  // Without these, a screen reader announces the label and the empty field but
  // never the reason it was rejected — the error text is visually adjacent but
  // programmatically unrelated to the input.
  const errorId = `${name}-error`;
  const describedBy = error ? errorId : undefined;
  const shared = {
    id: name,
    name,
    value,
    required,
    "aria-required": required || undefined,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy,
  };

  return (
    <div className={full ? "field field-full" : "field"}>
      <label htmlFor={name}>{label}</label>
      {multiline ? (
        <textarea {...shared} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input
          {...shared}
          type={type}
          inputMode={type === "tel" ? "tel" : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error ? (
        <span className="error-text" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
