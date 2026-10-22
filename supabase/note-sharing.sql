-- 1. Crear la tabla note_shares si no existe
create table if not exists public.note_shares (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  recipient_email text not null,
  permission text not null default 'view' check (permission in ('view', 'edit')),
  created_at timestamptz not null default now(),
  unique (note_id, recipient_email)
);

alter table public.note_shares enable row level security;

-- 2. Actualizar funciones auxiliares con CREATE OR REPLACE (sin necesidad de hacer DROP)
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

-- Consulta auth.users directamente
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

-- Obtiene el correo haciendo JOIN con auth.users
create or replace function public.get_note_owner_emails(target_note_ids uuid[])
returns table(note_id uuid, owner_email text)
language sql
security definer
set search_path = public, auth
as $$
  select notes.id, u.email::text
  from public.notes
  join auth.users u on u.id = notes.user_id
  where notes.id = any(target_note_ids)
    and (
      notes.user_id = auth.uid()
      or exists (
        select 1
        from public.note_shares
        where public.note_shares.note_id = notes.id
          and lower(public.note_shares.recipient_email) = lower(auth.jwt() ->> 'email')
      )
    );
$$;

revoke all on function public.get_note_owner_emails(uuid[]) from public;
grant execute on function public.get_note_owner_emails(uuid[]) to authenticated;

create or replace function public.get_note_owner_usernames(target_note_ids uuid[])
returns table(note_id uuid, owner_username text)
language sql
security definer
set search_path = public, auth
as $$
  select n.id, p.username
  from public.notes n
  join public.profiles p on p.id = n.user_id
  where n.id = any(target_note_ids)
    and exists (
      select 1
      from public.note_shares ns
      where ns.note_id = n.id
        and lower(ns.recipient_email) = lower(auth.jwt() ->> 'email')
    );
$$;

revoke all on function public.get_note_owner_usernames(uuid[]) from public;
grant execute on function public.get_note_owner_usernames(uuid[]) to authenticated;

create or replace function public.get_note_shares(target_note_ids uuid[])
returns table(note_id uuid, recipient_email text, recipient_username text, permission text)
language sql
security definer
set search_path = public, auth
as $$
  select ns.note_id, ns.recipient_email, p.username, ns.permission
  from public.note_shares ns
  join auth.users u on lower(u.email) = lower(ns.recipient_email)
  left join public.profiles p on p.id = u.id
  where ns.note_id = any(target_note_ids)
    and (
      exists (select 1 from public.notes n where n.id = ns.note_id and n.user_id = auth.uid())
      or lower(ns.recipient_email) = lower(auth.jwt() ->> 'email')
    );
$$;

revoke all on function public.get_note_shares(uuid[]) from public;
grant execute on function public.get_note_shares(uuid[]) to authenticated;

-- 3. Limpiar y recrear las políticas de seguridad (RLS) para note_shares y notes
drop policy if exists "Owners can view shares of their notes" on public.note_shares;
drop policy if exists "Owners can create shares for their notes" on public.note_shares;
drop policy if exists "Owners can update shares of their notes" on public.note_shares;
drop policy if exists "Owners can delete shares of their notes" on public.note_shares;
drop policy if exists "Recipients can view shares sent to them" on public.note_shares;
drop policy if exists "Recipients can revoke their own note access" on public.note_shares;
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
using (lower(public.note_shares.recipient_email) = lower(auth.jwt() ->> 'email'));

create policy "Recipients can revoke their own note access"
on public.note_shares for delete
using (lower(public.note_shares.recipient_email) = lower(auth.jwt() ->> 'email'));

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
