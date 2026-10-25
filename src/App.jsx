import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase, modalitaOnline } from './lib/supabase.js'
import { caricaScheda, salvaScheda, eliminaScheda } from './lib/store.js'
import { derive, nuovaScheda } from './lib/rules.js'
import { useTavolo } from './lib/tavolo.js'
import { useStudi } from './lib/studi.js'
import Tavolo from './components/Tavolo.jsx'
import Master from './components/Master.jsx'
import RichiesteMaster from './components/RichiesteMaster.jsx'
import InstallBanner from './components/InstallBanner.jsx'
import Auth, { NuovaPassword } from './components/Auth.jsx'
import Sheet from './components/Sheet.jsx'
import Zodiac from './components/Zodiac.jsx'
import Shop from './components/Shop.jsx'
import Inventory from './components/Inventory.jsx'
import Bestiary from './components/Bestiary.jsx'
import Craft from './components/Craft.jsx'
import Receive from './components/Receive.jsx'

const TABS = [
  ['scheda', 'Scheda', '🧙'],
  ['zodiaco', 'Zodiaco', '✨'],
  ['negozio', 'Negozio', '🛒'],
  ['inventario', 'Inventario', '🎒'],
  ['bestiario', 'Bestiario', '📖'],
  ['craft', 'Craft', '⚒️'],
  ['ricevi', 'Ricevi', '🎁'],
]

export default function App() {
  const [session, setSession] = useState(modalitaOnline ? undefined : null)
  const [c, setC] = useState(null)
  const [caricato, setCaricato] = useState(false)
  const [errore, setErrore] = useState('')
  const [stato, setStato] = useState('idle')
  const [tab, setTab] = useState('scheda')
  const [recupero, setRecupero] = useState(false)
  const dirty = useRef(false)
  const userId = session?.user?.id

  // sessione Supabase
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((ev, s) => {
      if (ev === 'PASSWORD_RECOVERY') setRecupero(true)
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // caricamento scheda
  useEffect(() => {
    if (modalitaOnline && !userId) {
      setC(null)
      setCaricato(false)
      return
    }
    let vivo = true
    setCaricato(false)
    caricaScheda(userId)
      .then((s) => {
        if (!vivo) return
        setC(s)
        setCaricato(true)
      })
      .catch((e) => {
        console.error(e)
        if (vivo) setErrore('Non riesco a caricare la scheda. Controlla la connessione e ricarica la pagina.')
      })
    return () => {
      vivo = false
    }
  }, [userId])

  // salvataggio con debounce
  useEffect(() => {
    if (!c || !dirty.current) return
    setStato('salvando')
    const t = setTimeout(async () => {
      dirty.current = false
      try {
        await salvaScheda(userId, c)
        setStato('salvato')
      } catch (e) {
        console.error(e)
        dirty.current = true
        setStato('errore')
      }
    }, 700)
    return () => clearTimeout(t)
  }, [c, userId])

  // salva subito quando l'app va in background; al ritorno rilegge la scheda (es. modificata da un altro dispositivo)
  const cRef = useRef(null)
  cRef.current = c
  useEffect(() => {
    if (!modalitaOnline || !userId) return
    const onVis = async () => {
      if (document.visibilityState === 'hidden') {
        if (dirty.current && cRef.current) {
          dirty.current = false
          try { await salvaScheda(userId, cRef.current); setStato('salvato') } catch (e) { console.error(e); dirty.current = true; setStato('errore') }
        }
      } else if (!dirty.current) {
        try {
          const remota = await caricaScheda(userId)
          if (!dirty.current && remota && JSON.stringify(remota) !== JSON.stringify(cRef.current)) setC(remota)
        } catch (e) { console.error(e) }
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [userId])

  // elimina la scheda (la conferma è chiesta nella Scheda); poi si riparte dalla creazione
  const elimina = useCallback(async () => {
    try {
      await eliminaScheda(userId)
      dirty.current = false
      setStato('idle')
      setC(null)
      setTab('scheda')
    } catch (e) {
      console.error(e)
      alert('Non sono riuscito a eliminare il personaggio. Riprova.')
    }
  }, [userId])

  const up = useCallback((fn) => {
    dirty.current = true
    setC((prev) => fn(prev))
  }, [])

  const d = useMemo(() => (c ? derive(c) : null), [c])
  const tv = useTavolo(userId, c, d)
  const studi = useStudi(userId)

  if (session === undefined) return <div className="centro">Caricamento…</div>
  if (modalitaOnline && recupero && session) return <NuovaPassword onFatto={() => setRecupero(false)} />
  if (modalitaOnline && !session) return <Auth />
  if (errore) return <div className="centro errore">{errore}</div>
  if (!caricato) return <div className="centro">Caricamento scheda…</div>

  if (!c) return <Creazione onCrea={(nome) => { dirty.current = true; setC(nuovaScheda(nome)) }} />

  const statoTxt = { idle: '', salvando: 'Salvataggio…', salvato: 'Salvato', errore: 'Errore di salvataggio, riprovo alla prossima modifica' }[stato]

  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>Stars &amp; Dungeons</h1>
          <span className="sub">
            {c.nome || 'Senza nome'} · Rango {c.rango}
            {d.ofiuco && ' · ☉ Ofiuco'}
          </span>
        </div>
        <div className="top-dx">
          <span className={`stato stato-${stato}`}>{statoTxt}</span>
          {modalitaOnline && (
            <button className="ghost" onClick={() => supabase.auth.signOut()}>Esci</button>
          )}
        </div>
      </header>

      <InstallBanner />
      {tv.membro && <RichiesteMaster tv={tv} c={c} d={d} up={up} />}

      {!modalitaOnline && (
        <div className="avviso">Modalità locale: la scheda è salvata solo su questo browser. Configura Supabase per averla su ogni dispositivo.</div>
      )}

      <nav className={`tabs ${modalitaOnline ? 'molte' : ''}`}>
        {[...TABS, ...(modalitaOnline ? [['tavolo', 'Tavolo', '🎲']] : []), ...(tv.master ? [['master', 'Master', '👑']] : [])].map(([id, nome, ico]) => (
          <button key={id} aria-label={nome} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'on' : ''} onClick={() => { setTab(id); window.scrollTo({ top: 0 }) }}>
            <span className="ico" aria-hidden="true">{ico}</span>
            <span className="nome-tab">{nome}</span>
          </button>
        ))}
      </nav>

      <main>
        {tab === 'scheda' && <Sheet c={c} d={d} up={up} onElimina={elimina} tv={tv} />}
        {tab === 'zodiaco' && <Zodiac c={c} d={d} up={up} />}
        {tab === 'negozio' && <Shop c={c} d={d} up={up} studi={studi} />}
        {tab === 'inventario' && <Inventory c={c} d={d} up={up} />}
        {tab === 'bestiario' && <Bestiary c={c} d={d} up={up} studi={studi} />}
        {tab === 'craft' && <Craft c={c} d={d} up={up} />}
        {tab === 'ricevi' && <Receive c={c} d={d} up={up} />}
        {tab === 'tavolo' && <Tavolo c={c} d={d} userId={userId} tv={tv} />}
        {tab === 'master' && tv.master && <Master tv={tv} />}
      </main>
    </div>
  )
}

function Creazione({ onCrea }) {
  const [nome, setNome] = useState('')
  return (
    <div className="centro">
      <form
        className="card auth"
        onSubmit={(e) => {
          e.preventDefault()
          if (nome.trim()) onCrea(nome.trim())
        }}
      >
        <h1>Nuovo personaggio</h1>
        <p className="muted">Parti da Rango 1: i punti li assegni ai segni dello Zodiaco.</p>
        <input autoFocus placeholder="Nome del personaggio" value={nome} onChange={(e) => setNome(e.target.value)} />
        <button className="primary" disabled={!nome.trim()}>Crea scheda</button>
      </form>
    </div>
  )
}
