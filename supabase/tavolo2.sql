-- Fase 2 del Tavolo: azioni del Master e storico. Esegui DOPO tavolo.sql; si può rilanciare senza errori.
-- Il Master non modifica mai la scheda di un giocatore: manda un'azione, e l'app del giocatore la applica alla sua scheda.

create table if not exists public.azioni (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade, -- il giocatore a cui è rivolta
  tipo text not null check (tipo in ('danno', 'cura', 'aureos', 'oggetto', 'rango', 'bottino')),
  dati jsonb not null default '{}'::jsonb,
  stato text not null default 'attesa' check (stato in ('attesa', 'applicata', 'rifiutata')),
  created_at timestamptz not null default now()
);
create index if not exists azioni_user_stato on public.azioni (user_id, stato);

create table if not exists public.eventi (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade, -- chi lo ha scritto
  testo text not null check (char_length(testo) <= 300)
);

alter table public.azioni enable row level security;
alter table public.eventi enable row level security;

drop policy if exists "azioni: leggono master e destinatario" on public.azioni;
drop policy if exists "azioni: le manda il master" on public.azioni;
drop policy if exists "azioni: risponde il destinatario" on public.azioni;
drop policy if exists "azioni: le toglie il master" on public.azioni;
create policy "azioni: leggono master e destinatario" on public.azioni for select to authenticated using (public.is_master() or user_id = (select auth.uid()));
create policy "azioni: le manda il master" on public.azioni for insert to authenticated with check (public.is_master());
create policy "azioni: risponde il destinatario" on public.azioni for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "azioni: le toglie il master" on public.azioni for delete to authenticated using (public.is_master());

drop policy if exists "eventi: leggono master e membri" on public.eventi;
drop policy if exists "eventi: scrivono master e membri" on public.eventi;
drop policy if exists "eventi: li cancella il master" on public.eventi;
create policy "eventi: leggono master e membri" on public.eventi for select to authenticated using (public.is_master() or public.is_membro());
create policy "eventi: scrivono master e membri" on public.eventi for insert to authenticated with check (user_id = (select auth.uid()) and (public.is_master() or public.is_membro()));
create policy "eventi: li cancella il master" on public.eventi for delete to authenticated using (public.is_master());

grant select, insert, update, delete on public.azioni to authenticated;
grant select, insert, delete on public.eventi to authenticated;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'azioni') then
    alter publication supabase_realtime add table public.azioni;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'eventi') then
    alter publication supabase_realtime add table public.eventi;
  end if;
end $$;
