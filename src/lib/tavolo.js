// Tavolo condiviso: il Master e i giocatori vedono lo stesso scontro in tempo reale (Supabase Realtime).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabase.js'

// I numeri della scheda che il Master può vedere al tavolo
export function statoPubblico(c, d) {
  return {
    rango: c.rango,
    corpo: Math.min(c.corpo ?? d.corpoMax, d.corpoMax), corpoMax: d.corpoMax,
    mente: Math.min(c.mente ?? d.menteMax, d.menteMax), menteMax: d.menteMax,
    armorF: d.armorFisica, armorM: d.armorMagica,
    fato: d.fatoAttuale, fatoMax: d.fato,
    sybil: d.sybilAttuale, sybilMax: d.sybil,
  }
}

// Ordine dei turni: i giocatori presenti, in ordine alfabetico (il Master lo può cambiare)
export const ordineIniziale = (giocatori) => [...giocatori].sort((a, b) => a.nome.localeCompare(b.nome)).map((g) => ({ tipo: 'pg', id: g.user_id, nome: g.nome }))

// Passa al turno successivo; finito il giro, il Round aumenta
export function prossimoTurno(t) {
  const n = t.ordine.length
  if (!n) return { turno: 0, round: t.round }
  const turno = t.turno + 1
  return turno >= n ? { turno: 0, round: t.round + 1 } : { turno, round: t.round }
}

export function useTavolo(userId, c, d) {
  const [master, setMaster] = useState(false)
  const [membro, setMembro] = useState(false)
  const [tavolo, setTavolo] = useState(null)
  const [giocatori, setGiocatori] = useState([])
  const [codice, setCodice] = useState('')
  const [azioni, setAzioni] = useState([]) // richieste del Master in attesa per me
  const [eventi, setEventi] = useState([])
  const [pronto, setPronto] = useState(false)
  const attivo = !!supabase && !!userId

  const carica = useCallback(async () => {
    if (!attivo) return
    const [m, g] = await Promise.all([
      supabase.from('masters').select('user_id').eq('user_id', userId).maybeSingle(),
      supabase.from('giocatori_tavolo').select('*').order('nome'),
    ])
    const sonoMaster = !!m.data
    const sonoMembro = (g.data || []).some((x) => x.user_id === userId)
    setMaster(sonoMaster)
    setMembro(sonoMembro)
    setGiocatori(g.data || [])
    if (sonoMaster || sonoMembro) {
      const t = await supabase.from('tavolo').select('*').eq('id', 1).maybeSingle()
      setTavolo(t.data || null)
    } else setTavolo(null)
    if (sonoMaster) {
      const k = await supabase.from('tavolo_codice').select('codice').eq('id', 1).maybeSingle()
      setCodice(k.data?.codice || '')
    }
    if (sonoMaster || sonoMembro) {
      const [az, ev] = await Promise.all([
        supabase.from('azioni').select('*').eq('user_id', userId).eq('stato', 'attesa').order('created_at'),
        supabase.from('eventi').select('*').order('created_at', { ascending: false }).limit(40),
      ])
      setAzioni(az.data || [])
      setEventi(ev.data || [])
    } else {
      setAzioni([])
      setEventi([])
    }
    setPronto(true)
  }, [attivo, userId])

  useEffect(() => {
    carica().catch((e) => { console.error(e); setPronto(true) })
  }, [carica])

  // tempo reale: a ogni cambiamento al tavolo ricarico tutto (sono poche righe)
  useEffect(() => {
    if (!attivo || !(master || membro)) return
    const canale = supabase
      .channel('tavolo')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tavolo' }, () => carica())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'giocatori_tavolo' }, () => carica())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'azioni' }, () => carica())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventi' }, () => carica())
      .subscribe()
    const torna = () => document.visibilityState === 'visible' && carica()
    document.addEventListener('visibilitychange', torna)
    return () => {
      document.removeEventListener('visibilitychange', torna)
      supabase.removeChannel(canale)
    }
  }, [attivo, master, membro, carica])

  // pubblico i miei numeri quando cambiano (solo se sono al tavolo)
  const ultimo = useRef('')
  useEffect(() => {
    if (!attivo || !membro || !c || !d) return
    const stato = statoPubblico(c, d)
    const chiave = JSON.stringify([c.nome, stato])
    if (chiave === ultimo.current) return
    const t = setTimeout(async () => {
      const { error } = await supabase.from('giocatori_tavolo').update({ nome: c.nome, stato, updated_at: new Date().toISOString() }).eq('user_id', userId)
      if (!error) ultimo.current = chiave
    }, 800)
    return () => clearTimeout(t)
  }, [attivo, membro, c, d, userId])

  const entra = useCallback(async (cod, nome) => {
    const { data, error } = await supabase.rpc('entra_tavolo', { codice_in: cod, nome_in: nome })
    if (error) throw error
    if (data) { ultimo.current = ''; await carica() }
    return !!data
  }, [carica])

  const esci = useCallback(async () => {
    await supabase.from('giocatori_tavolo').delete().eq('user_id', userId)
    await carica()
  }, [carica, userId])

  const aggiornaTavolo = useCallback(async (campi) => {
    const { error } = await supabase.from('tavolo').update({ ...campi, updated_at: new Date().toISOString() }).eq('id', 1)
    if (error) throw error
    await carica()
  }, [carica])

  const espelli = useCallback(async (id) => {
    await supabase.from('giocatori_tavolo').delete().eq('user_id', id)
    await carica()
  }, [carica])

  const nuovoCodice = useCallback(async () => {
    const cod = Array.from(crypto.getRandomValues(new Uint8Array(4))).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    const { error } = await supabase.from('tavolo_codice').update({ codice: cod }).eq('id', 1)
    if (error) throw error
    setCodice(cod)
  }, [])

  const registraEvento = useCallback(async (testo) => {
    const { error } = await supabase.from('eventi').insert({ testo })
    if (error) console.error(error)
  }, [])

  // Il Master manda un'azione a un giocatore (e la scrive nello storico)
  const inviaAzione = useCallback(async (destinatario, tipo, dati, testo) => {
    const { error } = await supabase.from('azioni').insert({ user_id: destinatario, tipo, dati })
    if (error) throw error
    if (testo) await registraEvento(testo)
  }, [registraEvento])

  // Il giocatore "prenota" l'azione prima di applicarla, così non si applica due volte (es. da due dispositivi)
  const rispondiAzione = useCallback(async (id, stato) => {
    const { data, error } = await supabase.from('azioni').update({ stato }).eq('id', id).eq('stato', 'attesa').select('id')
    if (error) throw error
    await carica()
    return (data || []).length > 0
  }, [carica])

  const pulisciStorico = useCallback(async () => {
    await supabase.from('eventi').delete().gte('id', 0)
    await carica()
  }, [carica])

  return useMemo(
    () => ({ attivo, pronto, master, membro, tavolo, giocatori, codice, azioni, eventi, entra, esci, aggiornaTavolo, espelli, nuovoCodice, registraEvento, inviaAzione, rispondiAzione, pulisciStorico }),
    [attivo, pronto, master, membro, tavolo, giocatori, codice, azioni, eventi, entra, esci, aggiornaTavolo, espelli, nuovoCodice, registraEvento, inviaAzione, rispondiAzione, pulisciStorico],
  )
}
