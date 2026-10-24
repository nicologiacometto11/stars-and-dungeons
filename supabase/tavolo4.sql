-- Fase 2c del Tavolo: il Master può dare o togliere anche Sybil e punti Cura. Esegui dopo tavolo2.sql; si può rilanciare senza errori.
alter table public.azioni drop constraint if exists azioni_tipo_check;
alter table public.azioni add constraint azioni_tipo_check
  check (tipo in ('danno', 'cura', 'aureos', 'oggetto', 'rango', 'bottino', 'sybil', 'puntiCura', 'xp'));
