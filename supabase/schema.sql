-- Foundry Dashboard schema.
-- Run this once in the Supabase SQL editor of a fresh project, then copy the
-- project URL and anon key into your environment (see .env.example).
--
-- This is an internal tool with no auth: the policies below intentionally
-- grant the anon key full access. Lock this down before exposing publicly.

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  contact text,
  website text,
  preview_url text,
  pitch_url text,
  notes text not null default '',
  potential_domains jsonb not null default '[]',
  built boolean not null default false,
  in_talks boolean not null default false,
  talking_points jsonb not null default '[]',
  sold boolean not null default false,
  archived boolean not null default false,
  final_domain text,
  final_url text,
  sale_price numeric,
  monthly_fee numeric,
  created_at timestamptz not null default now()
);

-- Safe to re-run on an existing project.
alter table companies add column if not exists pitch_url text;
alter table companies add column if not exists in_talks boolean not null default false;
alter table companies add column if not exists talking_points jsonb not null default '[]';

-- App-wide settings (e.g. the Gemini API key for AI autofill).
create table if not exists settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;

create policy "anon full access" on settings
  for all to anon using (true) with check (true);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_at timestamptz not null default now()
);

alter table companies enable row level security;
alter table files enable row level security;

create policy "anon full access" on companies
  for all to anon using (true) with check (true);

create policy "anon full access" on files
  for all to anon using (true) with check (true);

-- Public storage bucket for uploaded websites, logos, and documents.
insert into storage.buckets (id, name, public)
values ('company-files', 'company-files', true)
on conflict (id) do nothing;

create policy "anon read company-files" on storage.objects
  for select to anon using (bucket_id = 'company-files');

create policy "anon insert company-files" on storage.objects
  for insert to anon with check (bucket_id = 'company-files');

create policy "anon update company-files" on storage.objects
  for update to anon using (bucket_id = 'company-files');

create policy "anon delete company-files" on storage.objects
  for delete to anon using (bucket_id = 'company-files');
