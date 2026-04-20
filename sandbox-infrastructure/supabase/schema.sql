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
