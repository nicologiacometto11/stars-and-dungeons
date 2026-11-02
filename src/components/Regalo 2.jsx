import { useEffect, useMemo, useState } from 'react'
import { REGALO_ATTIVO, REGALO_MESSAGGIO, REGALO_TITOLO } from '../data/regalo.js'

const COLORI = ['#e6c274', '#fff0bd', '#b9a2ff', '#ff8aa8', '#7fd6a4', '#8fc2ff']

// Coriandoli: posizioni fisse (niente casualità, così il risultato è sempre uguale)
const CORIANDOLI = Array.from({ length: 54 }, (_, i) => ({
  x: ((i * 37) % 100),
  dx: ((i * 53) % 60) - 30,
  r: (i * 71) % 360,
  ritardo: ((i * 29) % 70) / 100,
  durata: 2.6 + ((i * 17) % 18) / 10,
  colore: COLORI[i % COLORI.length],
  largo: 6 + (i % 4) * 2,
}))

// Pacco regalo con biglietto di auguri: si tocca, il coperchio vola via e esce il biglietto
export default function Regalo() {
  const [aperto, setAperto] = useState(false)
  const [letto, setLetto] = useState(false)
  const [chiuso, setChiuso] = useState(false)

  useEffect(() => {
    if (!aperto) return
    const t = setTimeout(() => setLetto(true), 3600)
    return () => clearTimeout(t)
  }, [aperto])

  const stelle = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ x: (i * 47) % 100, y: (i * 31) % 100, d: ((i * 13) % 30) / 10, s: 2 + (i % 3) })), [])

  // nei test automatici non deve coprire l'app (si forza con ?regalo)
  const automatico = typeof navigator !== 'undefined' && navigator.webdriver && !(typeof location !== 'undefined' && /[?&]regalo/.test(location.search))
  if (!REGALO_ATTIVO || chiuso || automatico) return null

  return (
    <div className={`reg-velo${aperto ? ' apre' : ''}${letto ? ' letto' : ''}`} role="dialog" aria-modal="true" aria-label="Un regalo per Ludo">
      <div className="reg-stelle" aria-hidden="true">
        {stelle.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />)}
      </div>

      <div className="reg-scena">
        {!aperto && <p className="reg-hint">È arrivato un regalo per te</p>}

        <button type="button" className="reg-box" onClick={() => setAperto(true)} disabled={aperto} aria-label="Apri il regalo">
          <span className="reg-luce" aria-hidden="true" />
          <span className="reg-corpo" aria-hidden="true"><i className="reg-nastro-v" /></span>
          <span className="reg-coperchio" aria-hidden="true">
            <i className="reg-nastro-v" />
            <svg className="reg-fiocco" viewBox="0 0 120 70" aria-hidden="true">
              <defs>
                <linearGradient id="reg-oro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff0bd" /><stop offset=".55" stopColor="#e6c274" /><stop offset="1" stopColor="#9c7524" /></linearGradient>
              </defs>
              <path d="M60 46 C 38 6, 4 4, 8 30 C 11 50, 44 54, 60 46Z" fill="url(#reg-oro)" />
              <path d="M60 46 C 82 6, 116 4, 112 30 C 109 50, 76 54, 60 46Z" fill="url(#reg-oro)" />
              <path d="M60 46 L 36 68 M60 46 L 84 68" stroke="url(#reg-oro)" strokeWidth="9" strokeLinecap="round" />
              <circle cx="60" cy="44" r="10" fill="url(#reg-oro)" />
            </svg>
          </span>
        </button>

        <article className="reg-biglietto" aria-hidden={!aperto}>
          <p className="reg-sopra">✦ Per Ludo ✦</p>
          <h2 className="reg-titolo">{REGALO_TITOLO}</h2>
          <p className="reg-testo">{REGALO_MESSAGGIO}</p>
          <span className="reg-sigillo" aria-hidden="true">✦</span>
        </article>
      </div>

      {aperto && (
        <div className="reg-coriandoli" aria-hidden="true">
          {CORIANDOLI.map((c, i) => (
            <i key={i} style={{ left: `${c.x}%`, '--dx': `${c.dx}vw`, '--r': `${c.r}deg`, background: c.colore, width: c.largo, height: c.largo * 1.6, animationDelay: `${0.35 + c.ritardo}s`, animationDuration: `${c.durata}s` }} />
          ))}
        </div>
      )}

      <button type="button" className="reg-entra primary" onClick={() => setChiuso(true)} tabIndex={letto ? 0 : -1}>Entra nel gioco ✦</button>
    </div>
  )
}
