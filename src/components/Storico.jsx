// Storico dello scontro: cosa è successo al tavolo (danni, abilità usate, ricompense)
export default function Storico({ eventi, onPulisci }) {
  return (
    <section className="card">
      <div className="riga spazio">
        <h2 style={{ margin: 0, border: 0, padding: 0 }}>Storico</h2>
        {onPulisci && eventi.length > 0 && (
          <button className="ghost" onClick={() => confirm('Cancellare tutto lo storico del tavolo?') && onPulisci()}>Svuota</button>
        )}
      </div>
      {eventi.length === 0 ? (
        <p className="muted">Ancora niente.</p>
      ) : (
        <ul className="log">
          {eventi.map((e) => (
            <li key={e.id}>
              <small>{new Date(e.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</small> {e.testo}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
