// Elenco dei giocatori al tavolo con le loro riserve (usato dal Master e dai giocatori)
function Barra({ nome, v = 0, max = 0 }) {
  const pct = max > 0 ? Math.min(100, (v / max) * 100) : 0
  return (
    <div className="mini-barra">
      <div className="riserva-top"><small>{nome}</small><small>{v} / {max}</small></div>
      <div className="barra"><div style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export default function Compagni({ giocatori, turnoId, io, onEspelli, extra }) {
  if (!giocatori.length) return <p className="muted">Nessun giocatore al tavolo.</p>
  return (
    <div className="compagni">
      {giocatori.map((g) => {
        const s = g.stato || {}
        return (
          <div key={g.user_id} className={`compagno ${turnoId === g.user_id ? 'di-turno' : ''}`}>
            <div className="riga spazio">
              <strong>{g.nome || 'Senza nome'}{g.user_id === io && <small className="muted"> (tu)</small>}</strong>
              <span className="tag">Rango {s.rango ?? '–'}</span>
            </div>
            <Barra nome="Corpo" v={s.corpo} max={s.corpoMax} />
            <Barra nome="Mente" v={s.mente} max={s.menteMax} />
            <div className="riga compagno-num">
              <small>Armor F <b>{s.armorF ?? '–'}</b></small>
              <small>Armor M <b>{s.armorM ?? '–'}</b></small>
              <small>Fato <b>{s.fato ?? '–'}</b></small>
              <small>Sybil <b>{s.sybil ?? '–'}</b></small>
            </div>
            {extra && extra(g)}
            {onEspelli && <button className="ghost pericolo" onClick={() => onEspelli(g)}>Rimuovi dal tavolo</button>}
          </div>
        )
      })}
    </div>
  )
}
