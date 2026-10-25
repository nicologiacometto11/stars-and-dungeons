-- Studio condiviso: quando un giocatore studia un oggetto, un'arma o un mostro, lo vedono tutti i giocatori.
-- Esegui dopo tavolo7.sql; si può rilanciare senza errori.
create table if not exists public.studi_condivisi (
  tipo text not null check (tipo in ('oggetto', 'mostro')),
  id text not null check (char_length(id) between 1 and 80),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade, -- chi lo ha studiato
  created_at timestamptz not null default now(),
  primary key (tipo, id)
);

alter table public.studi_condivisi enable row level security;

drop policy if exists "studi: li leggono tutti" on public.studi_condivisi;
drop policy if exists "studi: li aggiunge chi li studia" on public.studi_condivisi;
drop policy if exists "studi: li toglie il master" on public.studi_condivisi;
create policy "studi: li leggono tutti" on public.studi_condivisi for select to authenticated using (true);
create policy "studi: li aggiunge chi li studia" on public.studi_condivisi for insert to authenticated with check (user_id = (select auth.uid()));
create policy "studi: li toglie il master" on public.studi_condivisi for delete to authenticated using (public.is_master());

grant select, insert, delete on public.studi_condivisi to authenticated;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'studi_condivisi') then
    alter publication supabase_realtime add table public.studi_condivisi;
  end if;
end $$;
