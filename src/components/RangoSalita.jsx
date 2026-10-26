import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RANGO_MAX } from '../lib/rules.js'
import { metallo } from '../lib/ui.js'

const NOME_METALLO = { bronzo: 'di bronzo', argento: "d'argento", oro: "d'oro" }

// Piccola scena quando il Rango sale di uno (da "Sali di Rango" o dal Master):
// il rombo nuovo si accende e, se serve, la cornice cambia metallo.
export default function RangoSalita({ c }) {
  const prec = useRef(null)
  const [scena, setScena] = useState(null)
  const rango = c?.rango ?? null

  useEffect(() => {
    if (rango == null) { prec.current = null; return }
    const prima = prec.current
    prec.current = rango
    if (prima != null && rango === prima + 1) setScena({ da: prima, a: rango })
  }, [rango])

  useEffect(() => {
    if (!scena) return
    const t = setTimeout(() => setScena(null), scena.da && metallo(scena.da) !== metallo(scena.a) ? 5200 : 3600)
    return () => clearTimeout(t)
  }, [scena])

  if (!scena || typeof document === 'undefined') return null
  const { da, a } = scena
  const prima = metallo(da)
  const dopo = metallo(a)
  const cambia = prima !== dopo
  const pips = (
    <div className="pips rs-pips" aria-hidden="true">
      {Array.from({ length: RANGO_MAX }, (_, i) => <i key={i} className={`pip${i < da ? ' on' : ''}${i === da ? ' nuovo' : ''}`} />)}
    </div>
  )
  return createPortal(
    <div className="rs-velo" role="dialog" aria-label={`Sei salito al Rango ${a}`} onClick={() => setScena(null)}>
      <div className="rs-scena">
        <p className="rs-sopra">Rango {a}</p>
        <div className="rs-cornici">
          <div className={`carta rs-cornice ${prima}${cambia ? ' vecchia' : ''}`}>
            <span className="rs-num">{a}</span>
            {pips}
          </div>
          {cambia && (
            <div className={`carta rs-cornice nuova ${dopo}`}>
              <span className="rs-num">{a}</span>
              {pips}
            </div>
          )}
        </div>
        <h2 className="rs-titolo">Sei salito di Rango!</h2>
        {cambia && <p className="rs-testo">La tua cornice diventa {NOME_METALLO[dopo]}.</p>}
        <small className="muted">Tocca per continuare</small>
      </div>
    </div>,
    document.body,
  )
}
