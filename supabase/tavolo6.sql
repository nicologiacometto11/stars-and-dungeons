-- I mostri in campo diventano un elenco (quale mostro e quanti, es. 3× Midas) al posto del solo numero.
-- Esegui dopo tavolo5.sql; si può rilanciare senza errori. Azzera i mostri attualmente in campo.
do $$ begin
  if (select data_type from information_schema.columns where table_schema = 'public' and table_name = 'tavolo' and column_name = 'mostri') is distinct from 'jsonb' then
    alter table public.tavolo drop column if exists mostri;
    alter table public.tavolo add column mostri jsonb not null default '[]'::jsonb check (jsonb_typeof(mostri) = 'array');
  end if;
end $$;
