import { useId } from 'react'
import { COSTELLAZIONI } from '../data/costellazioni.js'

// Quante stelle si accendono: una almeno con il primo punto, tutte con 10
export const stelleAccese = (totale, punti) => (punti <= 0 ? 0 : Math.max(1, Math.round((totale * Math.min(punti, 10)) / 10)))

// Costellazione di un segno: dietro c'è il disegno originale, che "viene fuori" man mano che il segno prende punti.
// Più punti = più stelle accese; le abilità sbloccate la fanno brillare.
export default function Costellazione({ id, punti, abilita = 0, mini = false }) {
  const uid = useId().replace(/:/g, '')
  const cos = COSTELLAZIONI[id]
  if (!cos) return null
  const { w, h } = cos
  const accese = stelleAccese(cos.stelle.length, punti)
  const rivela = Math.min(Math.max(punti, 0), 10) / 10 // 0 = appena un'ombra, 1 = disegno intero
  const k = w / 160 // scala dei tratti
  const luce = Math.min(abilita, 6)
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet"
      className={`cost luce-${luce} ${punti >= 10 ? 'completa' : ''} ${mini ? 'mini' : ''}`}
      role="img" aria-label={`Costellazione: ${accese} ${accese === 1 ? 'stella accesa' : 'stelle accese'} su ${cos.stelle.length}`}
    >
      <defs>
        <radialGradient id={`alone-${uid}`}>
          <stop offset="0" stopColor="#ffe9a8" stopOpacity=".8" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`sfuma-${uid}`} cx="50%" cy="50%" r="62%">
          <stop offset=".55" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={`maschera-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <rect x="0" y="0" width={w} height={h} fill={`url(#sfuma-${uid})`} />
        </mask>
      </defs>
      <image
        href={`${import.meta.env.BASE_URL}images/costellazioni/${id}.webp`} x="0" y="0" width={w} height={h}
        mask={`url(#maschera-${uid})`} className="cost-arte" style={{ opacity: 0.05 + 0.95 * rivela }} preserveAspectRatio="none"
      />
      <g className="cost-luce">
      {/* il disegno completo delle linee, appena accennato */}
      {cos.linee.map(([a, b], i) => (
        <line key={`f${i}`} x1={cos.stelle[a][0]} y1={cos.stelle[a][1]} x2={cos.stelle[b][0]} y2={cos.stelle[b][1]} className="cost-fioca" style={{ strokeWidth: 0.7 * k, strokeDasharray: `${2 * k} ${3 * k}` }} />
      ))}
      {/* le linee tra stelle accese */}
      {cos.linee.map(([a, b], i) => (a < accese && b < accese ? (
        <line key={`l${i}`} x1={cos.stelle[a][0]} y1={cos.stelle[a][1]} x2={cos.stelle[b][0]} y2={cos.stelle[b][1]} className="cost-linea" style={{ strokeWidth: 1.5 * k }} />
      ) : null))}
      {cos.stelle.map(([x, y, r], i) => {
        const on = i < accese
        return (
          <g key={i} className={`stella ${on ? 'on' : ''}`} style={{ '--ritardo': `${(i * 0.37) % 2.4}s`, transformOrigin: `${x}px ${y}px` }}>
            {on && <circle cx={x} cy={y} r={r * 2.5} fill={`url(#alone-${uid})`} />}
            <circle cx={x} cy={y} r={on ? r * 0.85 : Math.max(1.1, r * 0.35)} className="stella-nucleo" />
          </g>
        )
      })}
      </g>
    </svg>
  )
}
