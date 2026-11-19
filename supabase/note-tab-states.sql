create table if not exists public.note_tab_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note_ids uuid[] not null default '{}',
  active_note_id uuid,
  constraint note_tab_states_active_note_in_tabs
    check (active_note_id is null or active_note_id = any(note_ids))
);

alter table public.note_tab_states enable row level security;

drop policy if exists "Users can read their own note tab state" on public.note_tab_states;
drop policy if exists "Users can create their own note tab state" on public.note_tab_states;
drop policy if exists "Users can update their own note tab state" on public.note_tab_states;

create policy "Users can read their own note tab state"
on public.note_tab_states for select
using (auth.uid() = user_id);

create policy "Users can create their own note tab state"
on public.note_tab_states for insert
with check (auth.uid() = user_id);

create policy "Users can update their own note tab state"
on public.note_tab_states for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on public.note_tab_states to authenticated;
