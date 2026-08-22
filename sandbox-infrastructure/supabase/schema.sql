create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  source text not null default 'website-contact',
  status text not null default 'new',
  turnstile_verified boolean not null default false
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  company text,
  service_interest text[] not null default '{}',
  project_summary text not null,
  timeline text,
  budget_range text,
  source text not null default 'website-quote',
  status text not null default 'new',
  turnstile_verified boolean not null default false
);

-- Both tables sit in the `public` schema, so PostgREST would otherwise expose
-- every lead's name, email, phone, and message to anyone holding the project's
-- anon key. Enabling RLS with no policies denies all anon/authenticated access.
-- The API routes use the service role key, which bypasses RLS, so they are
-- unaffected. Add explicit policies here if a dashboard ever needs read access.
alter table public.leads enable row level security;
alter table public.quote_requests enable row level security;
