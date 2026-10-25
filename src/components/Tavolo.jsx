import { useState } from 'react'
import Compagni from './Compagni.jsx'
import Storico from './Storico.jsx'
import MostriInCampo from './MostriInCampo.jsx'
import DanniArmi from './DanniArmi.jsx'

// Vista del giocatore: entra con il codice, poi vede i compagni, il Round e il turno
export default function Tavolo({ c, d, userId, tv }) {
  const [codice, setCodice] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  if (!tv.pronto) return <p className="muted centrato">Carico il tavolo…</p>

  if (!tv.membro && !tv.master) {
    const entra = async (e) => {
      e.preventDefault()
      setBusy(true)
      setMsg('')
      try {
        const ok = await tv.entra(codice, c.nome)
        if (!ok) setMsg('Codice sbagliato. Chiedilo al Master.')
      } catch (err) {
        console.error(err)
        setMsg('Non riesco a entrare. Controlla la connessione.')
      }
      setBusy(false)
    }
    return (
      <form className="card stack" onSubmit={entra}>
        <h2>Entra al tavolo</h2>
        <p className="muted">Scrivi il codice che ti dà il Master. Lo fai una volta sola: poi resti al tavolo e la tua scheda non viene mai toccata.</p>
        <input value={codice} onChange={(e) => setCodice(e.target.value.toUpperCase())} placeholder="CODICE" autoCapitalize="characters" autoComplete="off" maxLength={12} />
        {msg && <div className="msg">{msg}</div>}
        <button className="primary" disabled={busy || !codice.trim()}>Entra</button>
      </form>
    )
  }

  const t = tv.tavolo
  const inTurno = t?.scontro ? t.ordine[t.turno] : null
  const tocca = inTurno?.id === userId

  return (
    <div className="stack">
      <section className={`card ${tocca ? 'tocca-te' : ''}`}>
        <h2>Tavolo</h2>
        {t?.scontro ? (
          <>
            <div className="round-box">
              <span className="muted">Round</span>
              <strong className="round-n">{t.round}</strong>
            </div>
            <p className="turno-di">{tocca ? '⚔️ Tocca a te!' : `Turno di ${inTurno?.nome || '…'}`}</p>
            <MostriInCampo mostri={t.mostri} c={c} />
            <ol className="ordine">
              {t.ordine.map((o, i) => (
                <li key={o.tipo + o.id} className={i === t.turno ? 'on' : ''}>{o.nome}</li>
              ))}
            </ol>
          </>
        ) : (
          <p className="muted">Nessuno scontro in corso. Aspetta che il Master lo inizi.</p>
        )}
      </section>

      {t?.scontro && d && <DanniArmi c={c} d={d} titolo="Il tuo attacco" />}

      <section className="card">
        <h2>Compagni</h2>
        <Compagni giocatori={tv.giocatori} turnoId={inTurno?.id} io={userId} />
      </section>

      <Storico eventi={tv.eventi} />

      {tv.membro && (
        <button className="ghost pericolo" onClick={() => confirm('Uscire dal tavolo? La tua scheda resta com\'è, ma dovrai rimettere il codice per rientrare.') && tv.esci()}>
          Esci dal tavolo
        </button>
      )}
    </div>
  )
}
