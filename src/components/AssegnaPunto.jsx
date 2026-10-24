import { useState } from 'react'
import { CATEGORIE, SEGNI_BY_ID } from '../data/zodiac.js'
import { assegnaPunto, puntiLiberi } from '../lib/rules.js'

const ELEM_NOME = { fuoco: 'Fuoco', terra: 'Terra', aria: 'Aria', acqua: 'Acqua' }

// Assegnazione guidata di un punto Rango: Caratteristica, poi uno dei suoi due Segni
export default function AssegnaPunto({ c, up }) {
  const [cat, setCat] = useState(null)
  const liberi = puntiLiberi(c)
  if (liberi <= 0) return null
  const scelta = CATEGORIE.find((k) => k.id === cat)

  const conferma = (segnoId) => {
    up((x) => assegnaPunto(x, segnoId))
    setCat(null)
  }

  return (
    <section className="card assegna">
      <div className="riga spazio">
        <h2 style={{ margin: 0, border: 0, padding: 0 }}>Assegna un punto</h2>
        <span className="tag qta">{liberi} da assegnare</span>
      </div>

      {!scelta ? (
        <>
          <p className="muted">1. Scegli la Caratteristica.</p>
          <div className="assegna-lista">
            {CATEGORIE.map((k) => {
              const tot = k.segni.reduce((a, s) => a + (c.segni[s] || 0), 0)
              return (
                <button key={k.id} onClick={() => setCat(k.id)}>
                  <strong>{k.nome}</strong>
                  <small>{tot} punt{tot === 1 ? 'o' : 'i'}</small>
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <p className="muted">2. Scegli il Segno per <b>{scelta.nome}</b>: <small>{scelta.effetto}</small></p>
          <div className="assegna-lista">
            {scelta.segni.map((id) => {
              const s = SEGNI_BY_ID[id]
              const pt = c.segni[id] || 0
              return (
                <button key={id} disabled={pt >= 10} onClick={() => conferma(id)}>
                  <strong>{s.nome}</strong>
                  <small>{ELEM_NOME[s.elemento]} · {pt}{pt >= 10 ? ' (massimo)' : ` → ${pt + 1}`}</small>
                </button>
              )
            })}
          </div>
          <button className="ghost" onClick={() => setCat(null)}>← Cambia Caratteristica</button>
        </>
      )}
    </section>
  )
}
