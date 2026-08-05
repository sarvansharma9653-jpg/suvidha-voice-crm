-- Suvidha Voice AI SaaS Platform Database Schema
-- Designed for Supabase / PostgreSQL with Row-Level Security (RLS)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Linked to Supabase Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  company_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);


-- 2. CREDENTIALS TABLE (Twilio/Plivo Configs)
create table public.credentials (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider text not null check (provider in ('twilio', 'plivo')),
  account_sid text not null,
  auth_token text not null, -- In production, encrypt this token
  phone_number text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Credentials
alter table public.credentials enable row level security;

create policy "Users can manage own credentials" on public.credentials
  for all using (auth.uid() = user_id);


-- 3. ASSISTANTS TABLE (Agent Voice & System Prompt Settings)
create table public.assistants (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  system_prompt text not null,
  first_message text not null,
  language text default 'hi' not null, -- 'hi' for Hinglish/Hindi, 'en' for English
  voice_provider text default '11labs' not null, -- '11labs', 'cartesia'
  voice_id text default 'sarah' not null,
  model text default 'gpt-4o-mini' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Assistants
alter table public.assistants enable row level security;

create policy "Users can manage own assistants" on public.assistants
  for all using (auth.uid() = user_id);


-- 4. CONTACTS TABLE (Outbound Call Lead List)
create table public.contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  phone text not null,
  email text,
  status text default 'New' check (status in ('New', 'Called', 'Interested', 'Not Interested', 'Follow-up Required')),
  last_called date,
  follow_up_date timestamp with time zone,
  follow_up_notes text,
  is_scheduled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Contacts
alter table public.contacts enable row level security;

create policy "Users can manage own contacts" on public.contacts
  for all using (auth.uid() = user_id);


-- 5. CALLS TABLE (Logs, Transcripts, and Analytics Reports)
create table public.calls (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete set null,
  contact_name text not null,
  phone_number text not null,
  duration integer default 0 not null, -- in seconds
  status text default 'Pending' not null, -- 'Completed', 'No Answer', 'Failed', 'Pending'
  sentiment text default '😐 Neutral' not null,
  transcript text,
  summary text,
  recording_url text,
  cost numeric(6,4) default 0.0000 not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Calls
alter table public.calls enable row level security;

create policy "Users can manage own calls" on public.calls
  for all using (auth.uid() = user_id);
