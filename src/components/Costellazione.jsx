import { useId } from 'react'
import { COSTELLAZIONI } from '../data/costellazioni.js'

// Quante stelle si accendono: una almeno con il primo punto, tutte con 10
export const stelleAccese = (totale, punti) => (punti <= 0 ? 0 : Math.max(1, Math.round((totale * Math.min(punti, 10)) / 10)))

// Costellazione di un segno: più punti = più stelle accese; le abilità sbloccate la fanno brillare
export default function Costellazione({ id, punti, abilita = 0, mini = false }) {
  const uid = useId().replace(/:/g, '')
  const cos = COSTELLAZIONI[id]
  if (!cos) return null
  const accese = stelleAccese(cos.stelle.length, punti)
  const luce = Math.min(abilita, 6)
  return (
    <svg
      viewBox="0 0 100 100" className={`cost luce-${luce} ${punti >= 10 ? 'completa' : ''} ${mini ? 'mini' : ''}`}
      role="img" aria-label={`Costellazione: ${accese} ${accese === 1 ? 'stella accesa' : 'stelle accese'} su ${cos.stelle.length}`}
    >
      <defs>
        <radialGradient id={`alone-${uid}`}>
          <stop offset="0" stopColor="#ffe9a8" stopOpacity=".75" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* il disegno completo, appena accennato */}
      {cos.linee.map(([a, b], i) => (
        <line key={`f${i}`} x1={cos.stelle[a][0]} y1={cos.stelle[a][1]} x2={cos.stelle[b][0]} y2={cos.stelle[b][1]} className="cost-fioca" />
      ))}
      {/* le linee tra stelle accese */}
      {cos.linee.map(([a, b], i) => (a < accese && b < accese ? (
        <line key={`l${i}`} x1={cos.stelle[a][0]} y1={cos.stelle[a][1]} x2={cos.stelle[b][0]} y2={cos.stelle[b][1]} className="cost-linea" />
      ) : null))}
      {cos.stelle.map(([x, y], i) => {
        const on = i < accese
        return (
          <g key={i} className={`stella ${on ? 'on' : ''}`} style={{ '--ritardo': `${(i * 0.37) % 2.4}s`, transformOrigin: `${x}px ${y}px` }}>
            {on && <circle cx={x} cy={y} r={mini ? 8 : 9} fill={`url(#alone-${uid})`} />}
            <circle cx={x} cy={y} r={on ? (mini ? 3 : 2.6) : 1.6} className="stella-nucleo" />
          </g>
        )
      })}
    </svg>
  )
}
