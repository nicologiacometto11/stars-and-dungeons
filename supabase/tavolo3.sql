-- Fase 2b del Tavolo: il Master può LEGGERE (mai modificare) le schede dei giocatori che sono al suo tavolo.
-- Esegui dopo tavolo2.sql; si può rilanciare senza errori.

drop policy if exists "il master legge le schede del tavolo" on public.characters;
create policy "il master legge le schede del tavolo" on public.characters
  for select to authenticated
  using (public.is_master() and user_id in (select user_id from public.giocatori_tavolo));
