"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import type { FormApiResponse } from "@/lib/types";
import { TurnstileWidget, type TurnstileHandle } from "@/components/turnstile-widget";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  turnstileToken: string;
};

const initialState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
  turnstileToken: "",
};

export function ContactForm() {
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
      const response = await fetch("/api/contact", {
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
        message: "The message could not be sent right now. Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
      // The submitted token is spent either way, so always ask for a new one.
      turnstileRef.current?.reset();
    }
  }

  return (
    <form className="form-shell form-panel" onSubmit={handleSubmit}>
      <div className="stack" style={{ padding: "1.35rem" }}>
        <div className="section-heading" style={{ marginBottom: 0 }}>
          <span className="eyebrow">General inquiry</span>
          <h2>Tell us what you need help with.</h2>
          <p>Use this form for general questions, support conversations, or early-stage discussions.</p>
        </div>

        <div className="form-grid">
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
          <Field
            label="Message"
            name="message"
            value={form.message}
            error={fieldErrors.message?.[0]}
            multiline
            full
            onChange={(value) => setForm((current) => ({ ...current, message: value }))}
          required
          />
        </div>

        <TurnstileWidget ref={turnstileRef} onToken={(token) => setForm((current) => ({ ...current, turnstileToken: token }))} />
        <p className="form-note">
          Spam protection is enforced automatically in production with Cloudflare Turnstile. See how we handle your
          information in our <Link href="/privacy">privacy policy</Link>.
        </p>

        {status ? (
          <div className={`form-status ${status.ok ? "success" : "error"}`} role="status">
            {status.message}
          </div>
        ) : null}

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send message"}
        </button>
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
