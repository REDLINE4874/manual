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
returns table(username text, email text)
language sql
security definer
set search_path = public
as $$
  select p.username, lower(u.email)::text
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id <> auth.uid()
    and u.email is not null
  order by lower(p.username);
$$;

revoke all on function public.list_note_users() from public;
grant execute on function public.list_note_users() to authenticated;