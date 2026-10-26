import { createPortal } from 'react-dom'
import { OFIUCO_COSTELLAZIONE as O } from '../data/costellazioni.js'

// Quando tutti e 12 i segni hanno un punto, Ofiuco si rivela (una sola volta per personaggio)
export default function OfiucoRivelazione({ c, d, up }) {
  if (!d.ofiuco || c.ofiucoRivelato) return null
  const chiudi = () => up((s) => ({ ...s, ofiucoRivelato: true }))
  return createPortal(
    <div className="ofiuco-rivela" role="dialog" aria-label="Ofiuco si rivela" onClick={chiudi}>
      <svg viewBox="0 0 100 100" className="ofiuco-svg" aria-hidden="true">
        {O.linee.map(([a, b], i) => (
          <line key={i} x1={O.stelle[a][0]} y1={O.stelle[a][1]} x2={O.stelle[b][0]} y2={O.stelle[b][1]} pathLength="1" className="ofiuco-linea" style={{ '--r': `${0.9 + i * 0.22}s` }} />
        ))}
        {O.stelle.map(([x, y], i) => (
          <g key={i} className="ofiuco-stella" style={{ '--r': `${0.7 + i * 0.2}s`, transformOrigin: `${x}px ${y}px` }}>
            <circle cx={x} cy={y} r="7" className="ofiuco-alone" />
            <circle cx={x} cy={y} r="2.4" fill="#fff6d4" />
          </g>
        ))}
      </svg>
      <p className="ofiuco-sopra">La 13ª costellazione</p>
      <h2 className="ofiuco-titolo">☉ Ofiuco</h2>
      <p className="ofiuco-testo">Hai riunito tutte e dodici le costellazioni: le tue caratteristiche sono raddoppiate.</p>
      <button className="primary ofiuco-btn" onClick={chiudi}>Continua</button>
    </div>,
    document.body,
  )
}
