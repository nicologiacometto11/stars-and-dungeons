// Studio condiviso: ciò che un giocatore studia (oggetti, armi, mostri) lo vedono tutti.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase.js'

// Valore di partenza (modalità locale o prima del caricamento)
export const STUDI_VUOTI = { oggetti: new Set(), mostri: new Set(), incontrati: new Set(), condividi() {}, rimuovi() {} }

export function useStudi(userId) {
  const [lista, setLista] = useState([])
  const attivo = !!supabase && !!userId

  const carica = useCallback(async () => {
    if (!attivo) return
    const { data } = await supabase.from('studi_condivisi').select('tipo,id')
    setLista(data || [])
  }, [attivo])

  useEffect(() => {
    if (!attivo) return
    carica()
    const canale = supabase.channel('studi').on('postgres_changes', { event: '*', schema: 'public', table: 'studi_condivisi' }, carica).subscribe()
    const torna = () => document.visibilityState === 'visible' && carica()
    document.addEventListener('visibilitychange', torna)
    return () => {
      document.removeEventListener('visibilitychange', torna)
      supabase.removeChannel(canale)
    }
  }, [attivo, carica])

  const condividi = useCallback(
    async (tipo, id) => {
      if (!attivo) return
      setLista((l) => (l.some((x) => x.tipo === tipo && x.id === id) ? l : [...l, { tipo, id }]))
      const { error } = await supabase.from('studi_condivisi').insert({ tipo, id, user_id: userId })
      if (error && error.code !== '23505') console.error(error) // 23505 = già studiato da qualcun altro
    },
    [attivo, userId],
  )

  // solo il Master può togliere uno studio o un incontro condiviso (per tutti)
  const rimuovi = useCallback(
    async (tipo, id) => {
      if (!attivo) return
      setLista((l) => l.filter((x) => !(x.tipo === tipo && x.id === id)))
      const { error } = await supabase.from('studi_condivisi').delete().eq('tipo', tipo).eq('id', id)
      if (error) console.error(error)
      await carica()
    },
    [attivo, carica],
  )

  return useMemo(
    () => ({
      oggetti: new Set(lista.filter((x) => x.tipo === 'oggetto').map((x) => x.id)),
      mostri: new Set(lista.filter((x) => x.tipo === 'mostro').map((x) => x.id)),
      incontrati: new Set(lista.filter((x) => x.tipo === 'incontrato').map((x) => x.id)),
      condividi,
      rimuovi,
    }),
    [lista, condividi, rimuovi],
  )
}
