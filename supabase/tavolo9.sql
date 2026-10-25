-- "Incontrato" in comune: quando il Master mette in campo un mostro, o un giocatore lo segna come incontrato, lo vedono tutti.
-- Esegui dopo tavolo8.sql; si può rilanciare senza errori.
alter table public.studi_condivisi drop constraint if exists studi_condivisi_tipo_check;
alter table public.studi_condivisi add constraint studi_condivisi_tipo_check check (tipo in ('oggetto', 'mostro', 'incontrato'));
