import { metallo } from '../lib/ui.js'

// Elenco dei giocatori al tavolo con le loro riserve (usato dal Master e dai giocatori)
function Barra({ nome, tipo, v = 0, max = 0 }) {
  const pct = max > 0 ? Math.min(100, (v / max) * 100) : 0
  return (
    <div className={`mini-barra ${tipo}${pct <= 25 ? ' bassa' : ''}`}>
      <div className="riserva-top"><small>{nome}</small><small><b>{v}</b> / {max}</small></div>
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
        const turno = turnoId === g.user_id
        return (
          <div key={g.user_id} className={`compagno ${metallo(s.rango || 1)} ${turno ? 'di-turno' : ''}`}>
            <div className="compagno-testa">
              <span className="compagno-iniziale" aria-hidden="true">{(g.nome || '?').trim().charAt(0).toUpperCase()}</span>
              <div className="compagno-nome">
                <strong>{g.nome || 'Senza nome'}{g.user_id === io && <small className="muted"> (tu)</small>}</strong>
                <small className="muted">Rango {s.rango ?? '–'}</small>
              </div>
              {turno && <span className="compagno-turno">✦ In turno</span>}
            </div>
            <Barra nome="Corpo" tipo="corpo" v={s.corpo} max={s.corpoMax} />
            <Barra nome="Mente" tipo="mente" v={s.mente} max={s.menteMax} />
            <div className="compagno-num">
              <span>Armor F <b>{s.armorF ?? '–'}</b></span>
              <span>Armor M <b>{s.armorM ?? '–'}</b></span>
              <span>Fato <b>{s.fato ?? '–'}</b></span>
              <span>Sybil <b>{s.sybil ?? '–'}</b></span>
            </div>
            {extra && extra(g)}
            {onEspelli && <button className="ghost compagno-rimuovi" onClick={() => onEspelli(g)}>Rimuovi dal tavolo</button>}
          </div>
        )
      })}
    </div>
  )
}
