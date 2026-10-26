import { createPortal } from 'react-dom'
import { OFIUCO_COSTELLAZIONE as O } from '../data/costellazioni.js'

// Quando tutti e 12 i segni hanno un punto, Ofiuco si rivela (una sola volta per personaggio)
export default function OfiucoRivelazione({ c, d, up }) {
  if (!d.ofiuco || c.ofiucoRivelato) return null
  const chiudi = () => up((s) => ({ ...s, ofiucoRivelato: true }))
  const k = O.w / 160
  return createPortal(
    <div className="ofiuco-rivela" role="dialog" aria-label="Ofiuco si rivela" onClick={chiudi}>
      <svg viewBox={`0 0 ${O.w} ${O.h}`} className="ofiuco-svg" aria-hidden="true">
        <defs>
          <radialGradient id="ofiuco-sfuma" cx="50%" cy="50%" r="62%"><stop offset=".55" stopColor="#fff" /><stop offset="1" stopColor="#000" /></radialGradient>
          <mask id="ofiuco-maschera" maskUnits="userSpaceOnUse" x="0" y="0" width={O.w} height={O.h}><rect x="0" y="0" width={O.w} height={O.h} fill="url(#ofiuco-sfuma)" /></mask>
        </defs>
        <image href={`${import.meta.env.BASE_URL}images/costellazioni/ofiuco.webp`} x="0" y="0" width={O.w} height={O.h} mask="url(#ofiuco-maschera)" className="ofiuco-arte" preserveAspectRatio="none" />
        {O.linee.map(([a, b], i) => (
          <line key={i} x1={O.stelle[a][0]} y1={O.stelle[a][1]} x2={O.stelle[b][0]} y2={O.stelle[b][1]} pathLength="1" className="ofiuco-linea" style={{ '--r': `${0.9 + i * 0.22}s`, strokeWidth: 1.4 * k }} />
        ))}
        {O.stelle.map(([x, y, r], i) => (
          <g key={i} className="ofiuco-stella" style={{ '--r': `${0.7 + i * 0.2}s`, transformOrigin: `${x}px ${y}px` }}>
            <circle cx={x} cy={y} r={r * 2.4} className="ofiuco-alone" />
            <circle cx={x} cy={y} r={r * 0.85} fill="#fff6d4" />
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
