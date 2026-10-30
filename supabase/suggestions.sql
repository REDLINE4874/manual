-- Ejecutar después de admin-panel.sql. Permite enviar sugerencias sin iniciar sesión;
-- solo un administrador activo puede leerlas.
create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  name text,
  message text not null check (char_length(trim(message)) between 5 and 2000),
  created_at timestamptz not null default now(),
  constraint suggestions_name_length check (name is null or char_length(name) <= 80)
);

alter table public.suggestions enable row level security;
drop policy if exists "Anyone can submit suggestions" on public.suggestions;
create policy "Anyone can submit suggestions"
on public.suggestions for insert to anon, authenticated
with check (
  char_length(trim(message)) between 5 and 2000
  and (name is null or char_length(name) <= 80)
);

drop policy if exists "Admins can read suggestions" on public.suggestions;
create policy "Admins can read suggestions"
on public.suggestions for select to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = auth.uid() and p.role = 'admin' and not p.blocked
));

revoke all on public.suggestions from public;
grant insert on public.suggestions to anon, authenticated;
grant select on public.suggestions to authenticated;
