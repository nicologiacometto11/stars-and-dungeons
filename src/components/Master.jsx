import { useState } from 'react'
import Compagni from './Compagni.jsx'
import { ordineIniziale, prossimoTurno } from '../lib/tavolo.js'

// Vista del Master: codice, scontro (Round e turni) e giocatori al tavolo
export default function Master({ tv }) {
  const [copiato, setCopiato] = useState(false)
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
          onEspelli={(g) => confirm(`Rimuovere ${g.nome || 'questo giocatore'} dal tavolo? La sua scheda non viene toccata.`) && tv.espelli(g.user_id)}
        />
      </section>
    </div>
  )
}
