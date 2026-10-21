create table if not exists public.note_shares (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  recipient_email text not null,
  permission text not null default 'view' check (permission in ('view', 'edit')),
  created_at timestamptz not null default now(),
  unique (note_id, recipient_email)
);

alter table public.note_shares enable row level security;

drop policy if exists "Owners can view shares of their notes" on public.note_shares;
drop policy if exists "Owners can create shares for their notes" on public.note_shares;
drop policy if exists "Owners can update shares of their notes" on public.note_shares;
drop policy if exists "Owners can delete shares of their notes" on public.note_shares;
drop policy if exists "Recipients can view shares sent to them" on public.note_shares;
drop policy if exists "Users can read notes shared with them" on public.notes;
drop policy if exists "Users can edit notes shared with them" on public.notes;

create policy "Owners can view shares of their notes"
on public.note_shares for select
using (exists (
  select 1 from public.notes
  where public.notes.id = note_shares.note_id
    and public.notes.user_id = auth.uid()
));

create policy "Owners can create shares for their notes"
on public.note_shares for insert
with check (exists (
  select 1 from public.notes
  where public.notes.id = note_shares.note_id
    and public.notes.user_id = auth.uid()
));

create policy "Owners can update shares of their notes"
on public.note_shares for update
using (exists (
  select 1 from public.notes
  where public.notes.id = note_shares.note_id
    and public.notes.user_id = auth.uid()
))
with check (exists (
  select 1 from public.notes
  where public.notes.id = note_shares.note_id
    and public.notes.user_id = auth.uid()
));

create policy "Owners can delete shares of their notes"
on public.note_shares for delete
using (exists (
  select 1 from public.notes
  where public.notes.id = note_shares.note_id
    and public.notes.user_id = auth.uid()
));

create policy "Recipients can view shares sent to them"
on public.note_shares for select
using (lower(recipient_email) = lower(auth.jwt() ->> 'email'));

create policy "Users can read notes shared with them"
on public.notes for select
using (exists (
  select 1 from public.note_shares
  where public.note_shares.note_id = notes.id
    and lower(public.note_shares.recipient_email) = lower(auth.jwt() ->> 'email')
));

create policy "Users can edit notes shared with them"
on public.notes for update
using (exists (
  select 1 from public.note_shares
  where public.note_shares.note_id = notes.id
    and lower(public.note_shares.recipient_email) = lower(auth.jwt() ->> 'email')
    and public.note_shares.permission = 'edit'
))
with check (exists (
  select 1 from public.note_shares
  where public.note_shares.note_id = notes.id
    and lower(public.note_shares.recipient_email) = lower(auth.jwt() ->> 'email')
    and public.note_shares.permission = 'edit'
));
