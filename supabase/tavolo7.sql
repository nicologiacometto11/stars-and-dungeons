-- Il Master può dare o togliere XP (3 XP = un Rango). Esegui dopo tavolo4.sql; si può rilanciare senza errori.
alter table public.azioni drop constraint if exists azioni_tipo_check;
alter table public.azioni add constraint azioni_tipo_check
  check (tipo in ('danno', 'cura', 'aureos', 'oggetto', 'rango', 'bottino', 'sybil', 'puntiCura', 'xp'));
