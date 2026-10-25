import { useState } from 'react'
import Compagni from './Compagni.jsx'
import MasterAzioni from './MasterAzioni.jsx'
import SchedaMaster from './SchedaMaster.jsx'
import Storico from './Storico.jsx'
import { MOSTRI, MOSTRI_BY_ID } from '../data/monsters.js'
import { ITEMS_BY_ID } from '../data/items.js'
import { slug } from '../data/craft.js'
import { ordineIniziale, prossimoTurno } from '../lib/tavolo.js'

// Vista del Master: codice, scontro (Round e turni) e giocatori al tavolo
const TIPO_DANNO = { fisico: 'fisici', magico: 'magici', puro: 'puri' }
function descriviAzione(a) {
  if (a.tipo === 'danno') return `${a.dati.n} danni ${TIPO_DANNO[a.dati.tipo]}`
  if (a.tipo === 'aureos') return `${a.dati.n > 0 ? '+' : ''}${a.dati.n} Aureos`
  if (a.tipo === 'xp') return `${a.dati.n > 0 ? '+' : ''}${a.dati.n} XP`
  if (a.tipo === 'sybil') return `${a.dati.n > 0 ? '+' : ''}${a.dati.n} Sybil`
  if (a.tipo === 'puntiCura') return `${a.dati.n > 0 ? '+' : ''}${a.dati.n} punti Cura`
  if (a.tipo === 'cura') return `cura ${a.dati.n} ${a.dati.riserva === 'corpo' ? 'Corpo' : 'Mente'}`
  if (a.tipo === 'rango') return 'Rango +1'
  if (a.tipo === 'bottino') return 'bottino'
  return 'oggetto'
}

function Bottino({ tv }) {
  const [mostro, setMostro] = useState('')
  const [esclusi, setEsclusi] = useState({})
  const [oggetti, setOggetti] = useState({}) // nome materiale -> id del giocatore che lo riceve
  const [msg, setMsg] = useState('')
  const m = MOSTRI.find((x) => x.id === mostro)
  const scelti = tv.giocatori.filter((g) => !esclusi[g.user_id])
  const distribuisci = async () => {
    try {
      // gli Aureos vanno a tutti i giocatori scelti, ogni oggetto solo a chi lo riceve
      if (m.aureos) for (const g of scelti) await tv.inviaAzione(g.user_id, 'bottino', { mostro: m.id, soloAureos: true })
      const assegnati = []
      for (const nome of m.drop) {
        const chi = tv.giocatori.find((g) => g.user_id === oggetti[nome])
        const it = ITEMS_BY_ID[slug(nome)]
        if (chi && it) {
          await tv.inviaAzione(chi.user_id, 'oggetto', { id: it.id, qta: 1 })
          assegnati.push(`${nome} → ${chi.nome || '?'}`)
        }
      }
      await tv.registraEvento(`Bottino di ${m.nome}: ${m.aureos ? `${m.aureos} Aureos a ${scelti.map((g) => g.nome || '?').join(', ')}` : 'nessun Aureos'}${assegnati.length ? `; ${assegnati.join(', ')}` : ''}`)
      setMsg('Distribuito ✓')
      setMostro('')
      setOggetti({})
    } catch (e) {
      console.error(e)
      setMsg('Non riesco a inviare. Riprova.')
    }
  }
  return (
    <section className="card">
      <h2>Bottino di un mostro</h2>
      <p className="muted">Gli Aureos vanno a tutti quelli che spunti (con l'Anello d'Oro raddoppiano). Ogni oggetto lo assegni a un giocatore solo.</p>
      <select value={mostro} onChange={(e) => { setMostro(e.target.value); setOggetti({}); setMsg('') }}>
        <option value="">Scegli il mostro sconfitto…</option>
        {MOSTRI.map((x) => <option key={x.id} value={x.id}>{x.nome} (Grado {x.grado})</option>)}
      </select>
      {m && (
        <>
          <p>{m.aureos ? `${m.aureos} Aureos a tutti, spunta chi li riceve:` : 'Nessun Aureos.'}</p>
          <div className="filtri">
            {tv.giocatori.map((g) => (
              <label key={g.user_id} className="check">
                <input type="checkbox" checked={!esclusi[g.user_id]} onChange={(e) => setEsclusi({ ...esclusi, [g.user_id]: !e.target.checked })} /> {g.nome || '?'}
              </label>
            ))}
          </div>
          {m.drop.map((nome) => (
            <div key={nome} className="bottino-voce">
              <span>{nome}{ITEMS_BY_ID[slug(nome)]?.aureosAlRicevimento && <small className="muted"> · diventa {ITEMS_BY_ID[slug(nome)].aureosAlRicevimento} Aureos</small>}</span>
              <select value={oggetti[nome] || ''} onChange={(e) => setOggetti({ ...oggetti, [nome]: e.target.value })}>
                <option value="">Assegna a…</option>
                {tv.giocatori.map((g) => <option key={g.user_id} value={g.user_id}>{g.nome || '?'}</option>)}
              </select>
            </div>
          ))}
        </>
      )}
      <div className="riga">
        <button className="primary" disabled={!m || !tv.giocatori.length} onClick={distribuisci}>Distribuisci</button>
        {msg && <small className="muted">{msg}</small>}
      </div>
    </section>
  )
}

export default function Master({ tv, studi }) {
  const [copiato, setCopiato] = useState(false)
  const [aperto, setAperto] = useState(null)
  const [scheda, setScheda] = useState(null)
  const t = tv.tavolo
  if (!tv.pronto || !t) return <p className="muted centrato">Carico il tavolo…</p>

  const copia = async () => {
    try { await navigator.clipboard.writeText(tv.codice); setCopiato(true); setTimeout(() => setCopiato(false), 1500) } catch { /* ignora */ }
  }
  const inizia = () => tv.aggiornaTavolo({ scontro: true, round: 1, turno: 0, mostri: [], ordine: ordineIniziale(tv.giocatori) })
  const fine = () => confirm('Terminare lo scontro?') && tv.aggiornaTavolo({ scontro: false, round: 1, turno: 0, mostri: [], ordine: [] })
  const mostriCampo = Array.isArray(t.mostri) ? t.mostri : []
  // aggiunge o toglie un mostro di quel tipo; a 0 il tipo sparisce dall'elenco
  const cambiaMostri = (id, delta) => {
    const trovato = mostriCampo.find((x) => x.id === id)
    const resto = mostriCampo.filter((x) => x.id !== id)
    const qta = Math.max(0, (trovato?.qta || 0) + delta)
    if (delta > 0) studi?.condividi('incontrato', id) // i giocatori lo vedono come incontrato nel Bestiario
    tv.aggiornaTavolo({ mostri: qta > 0 ? [...resto, { id, qta }].sort((a, b) => a.id.localeCompare(b.id)) : resto })
  }
  const avanti = () => tv.aggiornaTavolo(prossimoTurno(t))
  const sposta = (i, dir) => {
    const ordine = [...t.ordine]
    const j = i + dir
    if (j < 0 || j >= ordine.length) return
    ;[ordine[i], ordine[j]] = [ordine[j], ordine[i]]
    // il turno segue lo stesso personaggio
    const turno = t.turno === i ? j : t.turno === j ? i : t.turno
    tv.aggiornaTavolo({ ordine, turno })
  }
  const inTurno = t.scontro ? t.ordine[t.turno] : null

  return (
    <div className="stack">
      <section className="card">
        <h2>Codice del tavolo</h2>
        <p className="muted">I giocatori lo scrivono una volta sola nella tab Tavolo.</p>
        <div className="riga">
          <strong className="codice-tavolo">{tv.codice || '…'}</strong>
          <button onClick={copia}>{copiato ? 'Copiato ✓' : 'Copia'}</button>
          <button className="ghost" onClick={() => confirm('Creare un nuovo codice? Chi è già al tavolo resta dentro.') && tv.nuovoCodice()}>Nuovo codice</button>
        </div>
      </section>

      <section className="card">
        <h2>Scontro</h2>
        {t.scontro ? (
          <>
            <div className="round-box">
              <span className="muted">Round</span>
              <strong className="round-n">{t.round}</strong>
            </div>
            <p className="turno-di">Turno di {inTurno?.nome || '…'}</p>
            <div className="mostri-editor">
              <strong>🐉 Mostri in campo</strong>
              {mostriCampo.map((x) => (
                <div key={x.id} className="riga mostri-riga">
                  <img src={`${import.meta.env.BASE_URL}images/monsters/${x.id}.webp`} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
                  <span>{MOSTRI_BY_ID[x.id]?.nome || x.id}</span>
                  <button onClick={() => cambiaMostri(x.id, -1)} aria-label="Uno in meno">−</button>
                  <strong>{x.qta}×</strong>
                  <button onClick={() => cambiaMostri(x.id, 1)} aria-label="Uno in più">+</button>
                </div>
              ))}
              <select value="" onChange={(e) => e.target.value && cambiaMostri(e.target.value, 1)}>
                <option value="">+ Aggiungi un mostro…</option>
                {MOSTRI.map((x) => <option key={x.id} value={x.id}>{x.nome} (Grado {x.grado})</option>)}
              </select>
            </div>
            <ol className="ordine ordine-master">
              {t.ordine.map((o, i) => (
                <li key={o.tipo + o.id} className={i === t.turno ? 'on' : ''}>
                  <span>{o.nome}</span>
                  <span className="riga">
                    <button className="ghost" onClick={() => sposta(i, -1)} disabled={i === 0} aria-label="Su">↑</button>
                    <button className="ghost" onClick={() => sposta(i, 1)} disabled={i === t.ordine.length - 1} aria-label="Giù">↓</button>
                  </span>
                </li>
              ))}
            </ol>
            <div className="riga">
              <button className="primary" onClick={avanti}>Prossimo turno ▶</button>
              <button className="ghost pericolo" onClick={fine}>Fine scontro</button>
            </div>
          </>
        ) : (
          <>
            <p className="muted">Nessuno scontro in corso. I giocatori presenti entrano nell'ordine dei turni.</p>
            <button className="primary" disabled={!tv.giocatori.length} onClick={inizia}>Inizia scontro</button>
          </>
        )}
      </section>

      <section className="card">
        <h2>Giocatori ({tv.giocatori.length})</h2>
        <Compagni
          giocatori={tv.giocatori}
          turnoId={inTurno?.id}
          extra={(g) => (
            <>
              {tv.inAttesa.filter((a) => a.user_id === g.user_id).map((a) => (
                <div key={a.id} className="in-attesa">
                  <small>⏳ In attesa di conferma: {descriviAzione(a)}</small>
                  <button className="ghost" onClick={() => tv.annullaAzione(a.id)}>Annulla</button>
                </div>
              ))}
              <div className="riga">
                <button onClick={() => setScheda(scheda === g.user_id ? null : g.user_id)}>{scheda === g.user_id ? 'Chiudi scheda' : 'Vedi scheda'}</button>
                <button onClick={() => setAperto(aperto === g.user_id ? null : g.user_id)}>{aperto === g.user_id ? 'Chiudi azioni' : 'Azioni…'}</button>
              </div>
              {scheda === g.user_id && <SchedaMaster userId={g.user_id} />}
              {aperto === g.user_id && <MasterAzioni g={g} tv={tv} />}
            </>
          )}
          onEspelli={(g) => confirm(`Rimuovere ${g.nome || 'questo giocatore'} dal tavolo? La sua scheda non viene toccata.`) && tv.espelli(g.user_id)}
        />
      </section>

      <section className="card">
        <h2>Ripartire da zero</h2>
        <p className="muted">Azzera per tutti i giocatori i mostri incontrati e gli studi (statistiche dei mostri, effetti di armi e oggetti). Le schede non vengono toccate: per far ripartire un giocatore, usa "Elimina personaggio" nella sua Scheda.</p>
        <button className="ghost pericolo" onClick={() => confirm('Azzerare il Bestiario e tutti gli studi per TUTTI i giocatori?') && confirm('Sei sicuro? Non si può annullare.') && studi?.rimuoviTutto(['incontrato', 'mostro', 'oggetto'])}>
          Azzera Bestiario e studi di tutti…
        </button>
      </section>

      <Bottino tv={tv} />
      <Storico eventi={tv.eventi} onPulisci={tv.pulisciStorico} />
    </div>
  )
}
