import { useEffect, useState } from 'react'
import { REGALO_ANNI, REGALO_ATTIVO, REGALO_MESSAGGIO, REGALO_TITOLO } from '../data/regalo.js'

const COLORI = ['#e6c274', '#fff0bd', '#b9a2ff', '#ff8aa8', '#7fd6a4', '#8fc2ff']

// Posizioni fisse (niente casualità, così il risultato è sempre uguale)
const CORIANDOLI = Array.from({ length: 64 }, (_, i) => ({
  x: (i * 37) % 100,
  dx: ((i * 53) % 60) - 30,
  r: (i * 71) % 360,
  ritardo: ((i * 29) % 90) / 100,
  durata: 2.8 + ((i * 17) % 20) / 10,
  colore: COLORI[i % COLORI.length],
  largo: 5 + (i % 4) * 2,
  tondo: i % 5 === 0,
}))
const SCINTILLE = Array.from({ length: 18 }, (_, i) => ({ a: i * 20 + ((i * 7) % 11), dist: 120 + ((i * 41) % 90), d: ((i * 13) % 20) / 100 }))
const ORBITA = Array.from({ length: 8 }, (_, i) => i * 45)
const STELLE = Array.from({ length: 30 }, (_, i) => ({ x: (i * 47) % 100, y: (i * 31) % 100, d: ((i * 13) % 30) / 10, s: 1 + (i % 3) }))

function Fiocco() {
  return (
    <svg className="reg-fiocco" viewBox="0 0 140 80" aria-hidden="true">
      <defs>
        <linearGradient id="reg-oro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff6d4" /><stop offset=".45" stopColor="#e6c274" /><stop offset="1" stopColor="#8a6418" /></linearGradient>
        <linearGradient id="reg-oro-scuro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9a24a" /><stop offset="1" stopColor="#7a5512" /></linearGradient>
      </defs>
      <path d="M70 54 L 44 78 L 52 64 L 40 66Z" fill="url(#reg-oro-scuro)" />
      <path d="M70 54 L 96 78 L 88 64 L 100 66Z" fill="url(#reg-oro-scuro)" />
      <path d="M70 52 C 46 8, 6 6, 10 34 C 13 56, 48 60, 70 52Z" fill="url(#reg-oro)" />
      <path d="M70 52 C 94 8, 134 6, 130 34 C 127 56, 92 60, 70 52Z" fill="url(#reg-oro)" />
      <path d="M70 50 C 54 22, 26 18, 24 34 C 23 46, 50 52, 70 50Z" fill="rgba(122,85,18,.35)" />
      <path d="M70 50 C 86 22, 114 18, 116 34 C 117 46, 90 52, 70 50Z" fill="rgba(122,85,18,.35)" />
      <ellipse cx="70" cy="51" rx="12" ry="10" fill="url(#reg-oro)" />
      <ellipse cx="66" cy="47" rx="4" ry="3" fill="rgba(255,255,255,.6)" />
    </svg>
  )
}

// Pacco regalo con biglietto di auguri: si tocca, il coperchio vola via e esce il biglietto
export default function Regalo() {
  const [aperto, setAperto] = useState(false)
  const [letto, setLetto] = useState(false)
  const [chiuso, setChiuso] = useState(false)

  useEffect(() => {
    if (!aperto) return
    const t = setTimeout(() => setLetto(true), 4600)
    return () => clearTimeout(t)
  }, [aperto])

  // nei test automatici non deve coprire l'app (si forza con ?regalo)
  const automatico = typeof navigator !== 'undefined' && navigator.webdriver && !(typeof location !== 'undefined' && /[?&]regalo/.test(location.search))
  if (!REGALO_ATTIVO || chiuso || automatico) return null

  return (
    <div className={`reg-velo${aperto ? ' apre' : ''}${letto ? ' letto' : ''}`} role="dialog" aria-modal="true" aria-label="Un regalo per Ludo">
      <div className="reg-stelle" aria-hidden="true">
        {STELLE.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />)}
      </div>
      <div className="reg-raggi" aria-hidden="true" />

      <div className="reg-scena">
        <div className="reg-intro" aria-hidden={aperto}>
          <p className="reg-sopra-titolo">✦ Una sorpresa ✦</p>
          <p className="reg-per">Per Ludo</p>
        </div>

        <div className="reg-pacco">
          <div className="reg-orbita" aria-hidden="true">
            {ORBITA.map((a) => <i key={a} style={{ '--a': `${a}deg` }}>✦</i>)}
          </div>
          <span className="reg-ombra" aria-hidden="true" />
          <button type="button" className="reg-box" onClick={() => setAperto(true)} disabled={aperto} aria-label="Apri il regalo">
            <span className="reg-luce" aria-hidden="true" />
            <span className="reg-corpo" aria-hidden="true">
              <i className="reg-nastro-v" />
              <i className="reg-nastro-o" />
              <i className="reg-riflesso" />
            </span>
            <span className="reg-coperchio" aria-hidden="true">
              <i className="reg-nastro-v" />
              <Fiocco />
            </span>
          </button>
          {aperto && (
            <div className="reg-scintille" aria-hidden="true">
              {SCINTILLE.map((s, i) => <i key={i} style={{ '--a': `${s.a}deg`, '--dist': `${s.dist}px`, animationDelay: `${0.2 + s.d}s` }} />)}
            </div>
          )}
        </div>

        <p className="reg-tocca" aria-hidden="true">Tocca il pacco per aprirlo</p>

        <article className="reg-biglietto" aria-hidden={!aperto}>
          <span className="reg-angolo a1" aria-hidden="true">✦</span>
          <span className="reg-angolo a2" aria-hidden="true">✦</span>
          <span className="reg-angolo a3" aria-hidden="true">✦</span>
          <span className="reg-angolo a4" aria-hidden="true">✦</span>
          <i className="reg-foglia" aria-hidden="true" />
          <p className="reg-anni" aria-hidden="true"><span>{REGALO_ANNI}</span></p>
          <h2 className="reg-titolo">{REGALO_TITOLO}</h2>
          <div className="reg-fregio" aria-hidden="true"><i /><b>✦</b><i /></div>
          <p className="reg-testo">{REGALO_MESSAGGIO}</p>
          <p className="reg-firma">Nico &amp; Gio</p>
          <span className="reg-sigillo" aria-hidden="true">✦</span>
        </article>
      </div>

      {aperto && (
        <div className="reg-coriandoli" aria-hidden="true">
          {CORIANDOLI.map((c, i) => (
            <i key={i} style={{ left: `${c.x}%`, '--dx': `${c.dx}vw`, '--r': `${c.r}deg`, background: c.colore, width: c.largo, height: c.tondo ? c.largo : c.largo * 1.7, borderRadius: c.tondo ? '50%' : 2, animationDelay: `${0.4 + c.ritardo}s`, animationDuration: `${c.durata}s` }} />
          ))}
        </div>
      )}

      <button type="button" className="reg-entra primary" onClick={() => setChiuso(true)} tabIndex={letto ? 0 : -1}>Entra nel gioco ✦</button>
    </div>
  )
}
