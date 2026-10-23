import { useState } from 'react'
import Compagni from './Compagni.jsx'
import MasterAzioni from './MasterAzioni.jsx'
import Storico from './Storico.jsx'
import { MOSTRI } from '../data/monsters.js'
import { ordineIniziale, prossimoTurno } from '../lib/tavolo.js'

// Vista del Master: codice, scontro (Round e turni) e giocatori al tavolo
function Bottino({ tv }) {
  const [mostro, setMostro] = useState('')
  const [esclusi, setEsclusi] = useState({})
  const [msg, setMsg] = useState('')
  const m = MOSTRI.find((x) => x.id === mostro)
  const scelti = tv.giocatori.filter((g) => !esclusi[g.user_id])
  const distribuisci = async () => {
    try {
      for (const g of scelti) await tv.inviaAzione(g.user_id, 'bottino', { mostro: m.id })
      await tv.registraEvento(`Bottino di ${m.nome} a ${scelti.map((g) => g.nome || '?').join(', ')}`)
      setMsg('Distribuito ✓')
      setMostro('')
    } catch (e) {
      console.error(e)
      setMsg('Non riesco a inviare. Riprova.')
    }
  }
  return (
    <section className="card">
      <h2>Bottino di un mostro</h2>
      <p className="muted">Aureos e materiali arrivano da soli a chi scegli (con l'Anello d'Oro gli Aureos raddoppiano).</p>
      <select value={mostro} onChange={(e) => { setMostro(e.target.value); setMsg('') }}>
        <option value="">Scegli il mostro sconfitto…</option>
        {MOSTRI.map((x) => <option key={x.id} value={x.id}>{x.nome} (Grado {x.grado})</option>)}
      </select>
      {m && (
        <>
          <p>{m.aureos ? `${m.aureos} Aureos` : 'Nessun Aureos'}{m.drop.length > 0 && ` · ${m.drop.join(', ')}`}</p>
          <div className="filtri">
            {tv.giocatori.map((g) => (
              <label key={g.user_id} className="check">
                <input type="checkbox" checked={!esclusi[g.user_id]} onChange={(e) => setEsclusi({ ...esclusi, [g.user_id]: !e.target.checked })} /> {g.nome || '?'}
              </label>
            ))}
          </div>
        </>
      )}
      <div className="riga">
        <button className="primary" disabled={!m || !scelti.length} onClick={distribuisci}>Distribuisci a {scelti.length}</button>
        {msg && <small className="muted">{msg}</small>}
      </div>
    </section>
  )
}

export default function Master({ tv }) {
  const [copiato, setCopiato] = useState(false)
  const [aperto, setAperto] = useState(null)
  const t = tv.tavolo
  if (!tv.pronto || !t) return <p className="muted centrato">Carico il tavolo…</p>

  const copia = async () => {
    try { await navigator.clipboard.writeText(tv.codice); setCopiato(true); setTimeout(() => setCopiato(false), 1500) } catch { /* ignora */ }
  }
  const inizia = () => tv.aggiornaTavolo({ scontro: true, round: 1, turno: 0, ordine: ordineIniziale(tv.giocatori) })
  const fine = () => confirm('Terminare lo scontro?') && tv.aggiornaTavolo({ scontro: false, round: 1, turno: 0, ordine: [] })
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
              <button onClick={() => setAperto(aperto === g.user_id ? null : g.user_id)}>{aperto === g.user_id ? 'Chiudi azioni' : 'Azioni…'}</button>
              {aperto === g.user_id && <MasterAzioni g={g} tv={tv} />}
            </>
          )}
          onEspelli={(g) => confirm(`Rimuovere ${g.nome || 'questo giocatore'} dal tavolo? La sua scheda non viene toccata.`) && tv.espelli(g.user_id)}
        />
      </section>

      <Bottino tv={tv} />
      <Storico eventi={tv.eventi} onPulisci={tv.pulisciStorico} />
    </div>
  )
}
