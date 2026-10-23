-- Fase 1 del Tavolo (partita condivisa). Esegui nel SQL Editor di Supabase; si può rilanciare senza errori.
-- Le schede (tabella characters) NON vengono toccate: il tavolo le collega soltanto.

-- ---- Master: un solo account, scelto a mano (vedi in fondo) ----
create table if not exists public.masters (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.masters enable row level security;
drop policy if exists "leggi se sei master" on public.masters;
create policy "leggi se sei master" on public.masters for select to authenticated using (user_id = (select auth.uid()));
grant select on public.masters to authenticated;

create or replace function public.is_master() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.masters where user_id = auth.uid()) $$;

-- ---- Tavolo: una sola riga con lo stato dello scontro ----
create table if not exists public.tavolo (
  id int primary key default 1 check (id = 1),
  scontro boolean not null default false,
  round int not null default 1,
  turno int not null default 0,
  ordine jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.tavolo (id) values (1) on conflict do nothing;

-- codice per entrare: lo legge solo il Master
create table if not exists public.tavolo_codice (
  id int primary key default 1 check (id = 1),
  codice text not null
);
insert into public.tavolo_codice (id, codice) values (1, upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8))) on conflict do nothing;

-- ---- Giocatori al tavolo: copia dei numeri che servono al Master ----
create table if not exists public.giocatori_tavolo (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  stato jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.is_membro() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.giocatori_tavolo where user_id = auth.uid()) $$;

alter table public.tavolo enable row level security;
alter table public.tavolo_codice enable row level security;
alter table public.giocatori_tavolo enable row level security;

drop policy if exists "tavolo: leggono master e membri" on public.tavolo;
drop policy if exists "tavolo: modifica il master" on public.tavolo;
create policy "tavolo: leggono master e membri" on public.tavolo for select to authenticated using (public.is_master() or public.is_membro());
create policy "tavolo: modifica il master" on public.tavolo for update to authenticated using (public.is_master()) with check (public.is_master());

drop policy if exists "codice: solo master" on public.tavolo_codice;
create policy "codice: solo master" on public.tavolo_codice for all to authenticated using (public.is_master()) with check (public.is_master());

drop policy if exists "giocatori: leggono master e membri" on public.giocatori_tavolo;
drop policy if exists "giocatori: aggiorni il tuo" on public.giocatori_tavolo;
drop policy if exists "giocatori: esci o espelli" on public.giocatori_tavolo;
create policy "giocatori: leggono master e membri" on public.giocatori_tavolo for select to authenticated using (public.is_master() or public.is_membro());
create policy "giocatori: aggiorni il tuo" on public.giocatori_tavolo for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "giocatori: esci o espelli" on public.giocatori_tavolo for delete to authenticated using (user_id = (select auth.uid()) or public.is_master());
-- niente policy di insert: si entra solo con il codice, tramite la funzione qui sotto

create or replace function public.entra_tavolo(codice_in text, nome_in text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if upper(trim(codice_in)) is distinct from (select codice from public.tavolo_codice where id = 1) then return false; end if;
  insert into public.giocatori_tavolo (user_id, nome) values (auth.uid(), coalesce(nome_in, ''))
  on conflict (user_id) do update set nome = excluded.nome;
  return true;
end $$;

grant select, update on public.tavolo to authenticated;
grant select, insert, update on public.tavolo_codice to authenticated;
grant select, update, delete on public.giocatori_tavolo to authenticated;
revoke all on function public.entra_tavolo(text, text) from public, anon;
grant execute on function public.entra_tavolo(text, text) to authenticated;

-- ---- Tempo reale ----
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'tavolo') then
    alter publication supabase_realtime add table public.tavolo;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'giocatori_tavolo') then
    alter publication supabase_realtime add table public.giocatori_tavolo;
  end if;
end $$;

-- ---- DA FARE UNA VOLTA: scegli il Master (dopo che si è registrato nell'app) ----
-- Sostituisci l'email e lancia questa riga da sola:
-- insert into public.masters (user_id) select id from auth.users where email = 'EMAIL-DEL-MASTER@gmail.com' on conflict do nothing;
