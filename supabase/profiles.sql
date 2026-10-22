-- La tabla public.profiles y los usuarios Auth ya deben existir.
-- Se espera que profiles tenga: id (uuid) y username (text).

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
using (auth.uid() = id);

create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

-- 1. Eliminamos las funciones primero para evitar conflictos de tipos de retorno
drop function if exists public.get_auth_email_by_username(text);
drop function if exists public.list_note_users();

-- 2. Volvemos a crear la función get_auth_email_by_username
create or replace function public.get_auth_email_by_username(target_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = lower(trim(target_username))
  limit 1;
$$;

revoke all on function public.get_auth_email_by_username(text) from public;
grant execute on function public.get_auth_email_by_username(text) to anon, authenticated;

-- 3. Volvemos a crear la función list_note_users
create or replace function public.list_note_users()
returns table(username text)
language sql
security definer
set search_path = public
as $$
  select p.username
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id <> auth.uid()
  order by lower(p.username);
$$;

revoke all on function public.list_note_users() from public;
grant execute on function public.list_note_users() to authenticated;

create or replace function public.share_note_with_username(
  target_note_id uuid,
  target_username text,
  target_permission text default 'view'
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  recipient_email text;
begin
  if target_permission not in ('view', 'edit') then
    raise exception 'Permiso no válido.';
  end if;
  if not exists (
    select 1 from public.notes
    where id = target_note_id and user_id = auth.uid()
  ) then
    raise exception 'No tienes permiso para compartir esta nota.';
  end if;
  select lower(u.email) into recipient_email
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = lower(trim(target_username))
    and p.id <> auth.uid()
  limit 1;
  if recipient_email is null then
    raise exception 'No encontramos ese usuario.';
  end if;
  insert into public.note_shares (note_id, recipient_email, permission)
  values (target_note_id, recipient_email, target_permission)
  on conflict (note_id, recipient_email)
  do update set permission = excluded.permission;
end;
$$;

revoke all on function public.share_note_with_username(uuid, text, text) from public;
grant execute on function public.share_note_with_username(uuid, text, text) to authenticated;
