-- Una chiamata minima al database, usata dal controllo automatico settimanale per non far andare in pausa il progetto
-- (i progetti gratuiti si fermano dopo una settimana senza richieste). Esegui una volta; si può rilanciare senza errori.
create or replace function public.ping() returns int
language sql stable security definer set search_path = public as
$$ select 1 $$;

revoke all on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;
