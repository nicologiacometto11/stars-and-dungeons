// Storico dello scontro: cosa è successo al tavolo (danni, abilità usate, ricompense)
export default function Storico({ eventi, onPulisci, richiudibile }) {
  if (richiudibile) {
    return (
      <details className="card">
        <summary>Storico ({eventi.length})</summary>
        <Elenco eventi={eventi} />
        {onPulisci && eventi.length > 0 && <button className="ghost" onClick={() => confirm('Cancellare tutto lo storico del tavolo?') && onPulisci()}>Svuota</button>}
      </details>
    )
  }
  return (
    <section className="card">
      <div className="riga spazio">
        <h2 style={{ margin: 0, border: 0, padding: 0 }}>Storico</h2>
        {onPulisci && eventi.length > 0 && (
          <button className="ghost" onClick={() => confirm('Cancellare tutto lo storico del tavolo?') && onPulisci()}>Svuota</button>
        )}
      </div>
      <Elenco eventi={eventi} />
    </section>
  )
}

function Elenco({ eventi }) {
  if (eventi.length === 0) return <p className="muted">Ancora niente.</p>
  return (
    <ul className="log">
      {eventi.map((e) => (
        <li key={e.id}>
          <small>{new Date(e.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</small> {e.testo}
        </li>
      ))}
    </ul>
  )
}
