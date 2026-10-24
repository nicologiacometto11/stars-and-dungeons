-- Il Master indica quanti mostri ci sono in campo (solo il numero, leggero). Esegui dopo tavolo.sql; si può rilanciare senza errori.
-- (sostituito da tavolo6.sql: ora i mostri sono un elenco)
alter table public.tavolo add column if not exists mostri int not null default 0 check (mostri >= 0);
