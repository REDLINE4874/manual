-- Ejecutar después de profiles.sql.
-- Todos los perfiles conservan el acceso normal al manual; role solo protege el panel.
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists blocked boolean not null default false;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin'));

drop function if exists public.list_admin_users();
drop function if exists public.set_user_role(uuid, text);

create or replace function public.list_admin_users()
returns table(id uuid, username text, role text, blocked boolean)
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then raise exception 'No autorizado.'; end if;
  return query select p.id, p.username, p.role, p.blocked from public.profiles p order by lower(p.username);
end;
$$;

create or replace function public.set_user_blocked(target_user_id uuid, target_blocked boolean)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then raise exception 'No autorizado.'; end if;
  if target_user_id = auth.uid() then raise exception 'No puedes bloquear tu propio usuario.'; end if;
  if exists (select 1 from public.profiles p where p.id = target_user_id and p.role = 'admin') then raise exception 'No puedes bloquear a otro administrador.'; end if;
  update public.profiles set blocked = target_blocked where id = target_user_id;
end;
$$;

create table if not exists public.card_settings (
  card_id text primary key,
  cat text not null default '',
  rate text not null default '',
  validity text not null default '',
  admin text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.card_settings enable row level security;
drop policy if exists "Authenticated users can read card settings" on public.card_settings;
create policy "Authenticated users can read card settings"
on public.card_settings for select to authenticated using (true);

drop function if exists public.get_card_settings();
create or replace function public.get_card_settings()
returns table(card_id text, cat text, rate text, validity text, admin text, updated_at timestamptz)
language sql security definer set search_path = public
as $$ select c.card_id, c.cat, c.rate, c.validity, c.admin, c.updated_at from public.card_settings c order by c.card_id; $$;

create or replace function public.set_card_settings(target_card_id text, target_cat text, target_rate text, target_validity text, target_admin text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and not p.blocked) then raise exception 'No autorizado.'; end if;
  insert into public.card_settings(card_id, cat, rate, validity, admin, updated_at)
  values (target_card_id, coalesce(target_cat, ''), coalesce(target_rate, ''), coalesce(target_validity, ''), coalesce(target_admin, ''), now())
  on conflict (card_id) do update set cat = excluded.cat, rate = excluded.rate, validity = excluded.validity, admin = excluded.admin, updated_at = now();
end;
$$;

revoke all on function public.list_admin_users() from public;
revoke all on function public.set_user_blocked(uuid, boolean) from public;
revoke all on function public.get_card_settings() from public;
revoke all on function public.set_card_settings(text, text, text, text, text) from public;
grant execute on function public.list_admin_users() to authenticated;
grant execute on function public.set_user_blocked(uuid, boolean) to authenticated;
grant execute on function public.get_card_settings() to authenticated;
grant execute on function public.set_card_settings(text, text, text, text, text) to authenticated;
notify pgrst, 'reload schema';
