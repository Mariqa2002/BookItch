-- Book Itch: initial schema
-- One row per reading user (auth.users), with every table scoped to its
-- owner via Row Level Security so the Supabase anon key can never be used
-- to read or write someone else's data.

create extension if not exists "pgcrypto";

-- Books -----------------------------------------------------------------
-- Chapters (and their notes) are stored as a single jsonb array on the
-- book row, mirroring the Chapter[] shape the app already works with in
-- memory (src/data/types.ts) rather than splitting them into more tables.

create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  author text not null,
  subtitle text,
  genre text not null check (genre in ('fiction', 'non-fiction')),
  status text not null check (status in ('reading', 'completed', 'want')),
  cover_url text,
  expectations text not null default '',
  favorite_quote text,
  started_at date,
  target_date date,
  finished_at date,
  chapters jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index books_user_id_idx on public.books (user_id);

alter table public.books enable row level security;

create policy "Users manage their own books"
  on public.books
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Today's checklist items ------------------------------------------------

create table public.today_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index today_items_user_id_idx on public.today_items (user_id);

alter table public.today_items enable row level security;

create policy "Users manage their own today items"
  on public.today_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Legacy per-year reading totals (pre-dates the app) ---------------------

create table public.legacy_year_totals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  year int not null,
  fiction int not null default 0,
  nonfiction int not null default 0,
  unique (user_id, year)
);

create index legacy_year_totals_user_id_idx on public.legacy_year_totals (user_id);

alter table public.legacy_year_totals enable row level security;

create policy "Users manage their own legacy year totals"
  on public.legacy_year_totals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Settings (one row per user) --------------------------------------------

create table public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  yearly_goal int not null default 12,
  default_status_for_new_books text not null default 'want'
    check (default_status_for_new_books in ('reading', 'completed', 'want')),
  daily_reminder boolean not null default true,
  reminder_time text not null default '20:00',
  weekly_summary boolean not null default false,
  goal_milestones boolean not null default true,
  handwritten_touches boolean not null default true
);

alter table public.settings enable row level security;

create policy "Users manage their own settings"
  on public.settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
