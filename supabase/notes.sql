create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  color text not null default 'yellow' check (color in ('yellow', 'blue', 'green', 'pink', 'purple', 'coral')),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.notes add column if not exists color text not null default 'yellow';
alter table public.notes drop constraint if exists notes_color_check;
alter table public.notes add constraint notes_color_check
  check (color in ('yellow', 'blue', 'green', 'pink', 'purple', 'coral'));

alter table public.notes enable row level security;

drop policy if exists "Users can read their own notes" on public.notes;
drop policy if exists "Users can create their own notes" on public.notes;
drop policy if exists "Users can update their own notes" on public.notes;
drop policy if exists "Users can delete their own notes" on public.notes;

create policy "Users can read their own notes"
on public.notes for select
using (auth.uid() = user_id);

create policy "Users can create their own notes"
on public.notes for insert
with check (auth.uid() = user_id);

create policy "Users can update their own notes"
on public.notes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own notes"
on public.notes for delete
using (auth.uid() = user_id);
