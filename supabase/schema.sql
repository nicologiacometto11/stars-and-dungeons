-- Esegui questo script nel SQL Editor di Supabase (si può rilanciare senza errori).
-- Una scheda personaggio per ogni account, visibile e modificabile solo dal proprietario.

create table if not exists public.characters (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.characters enable row level security;

-- Permessi espliciti (servono se "Automatically expose new tables" è disattivato). L'accesso resta limitato alle policy qui sotto.
grant select, insert, update, delete on public.characters to authenticated;

drop policy if exists "leggi la tua scheda" on public.characters;
drop policy if exists "crea la tua scheda" on public.characters;
drop policy if exists "modifica la tua scheda" on public.characters;
drop policy if exists "elimina la tua scheda" on public.characters;

create policy "leggi la tua scheda" on public.characters
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "crea la tua scheda" on public.characters
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "modifica la tua scheda" on public.characters
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "elimina la tua scheda" on public.characters
  for delete to authenticated using ((select auth.uid()) = user_id);
