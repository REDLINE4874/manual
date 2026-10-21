create table if not exists public.note_shares (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  recipient_email text not null,
  permission text not null default 'view' check (permission in ('view', 'edit')),
  created_at timestamptz not null default now(),
  unique (note_id, recipient_email)
);

alter table public.note_shares enable row level security;

create or replace function public.user_owns_note(target_note_id uuid)
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.notes
    where public.notes.id = target_note_id
      and public.notes.user_id = auth.uid()
  );
$$;

revoke all on function public.user_owns_note(uuid) from public;
grant execute on function public.user_owns_note(uuid) to authenticated;

create or replace function public.user_exists_by_email(target_email text)
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users
    where lower(auth.users.email) = lower(trim(target_email))
  );
$$;

revoke all on function public.user_exists_by_email(text) from public;
grant execute on function public.user_exists_by_email(text) to authenticated;

create or replace function public.list_note_users()
returns table(email text)
language sql
security definer
set search_path = public, auth
as $$
  select lower(auth.users.email)::text
  from auth.users
  where auth.users.email is not null
    and auth.users.id <> auth.uid()
  order by lower(auth.users.email);
$$;

revoke all on function public.list_note_users() from public;
grant execute on function public.list_note_users() to authenticated;

drop policy if exists "Owners can view shares of their notes" on public.note_shares;
drop policy if exists "Owners can create shares for their notes" on public.note_shares;
drop policy if exists "Owners can update shares of their notes" on public.note_shares;
drop policy if exists "Owners can delete shares of their notes" on public.note_shares;
drop policy if exists "Recipients can view shares sent to them" on public.note_shares;
drop policy if exists "Users can read notes shared with them" on public.notes;
drop policy if exists "Users can edit notes shared with them" on public.notes;

create policy "Owners can view shares of their notes"
on public.note_shares for select
using (public.user_owns_note(note_id));

create policy "Owners can create shares for their notes"
on public.note_shares for insert
with check (public.user_owns_note(note_id));

create policy "Owners can update shares of their notes"
on public.note_shares for update
using (public.user_owns_note(note_id))
with check (public.user_owns_note(note_id));

create policy "Owners can delete shares of their notes"
on public.note_shares for delete
using (public.user_owns_note(note_id));

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
