import { useState } from 'react'
import { ARMI_CRAFT_A, ARMI_CRAFT_S, GALAXIS, slug } from '../data/craft.js'
import { ITEMS_BY_ID } from '../data/items.js'
import { conAggiunta, conLog, conRimozione, qtaIn } from '../lib/rules.js'

const gradoDi = (id) => ITEMS_BY_ID[id]?.tier

export default function Craft({ c, up }) {
  const [vista, setVista] = useState('A')
  const [soloPronte, setSoloPronte] = useState(false)

  const ricette = vista === 'A' ? ARMI_CRAFT_A : ARMI_CRAFT_S

  const forgia = (r) =>
    up((s) => {
      if (!r.ing.every((n) => qtaIn(s, slug(n)) > 0)) return s
      let x = s
      for (const n of r.ing) x = conRimozione(x, slug(n))
      x = conAggiunta(x, slug(r.nome))
      if (r.perenne) {
        // abilità perenne: la tieni anche senza impugnare l'arma
        x = { ...x, abilita: [...(x.abilita || []), { da: r.nome, testo: r.perenne }] }
      }
      return conLog(x, `Forgiata ${r.nome}`)
    })

  const mostrate = ricette
    .map((r) => ({ r, pronta: r.ing.every((n) => qtaIn(c, slug(n)) > 0) }))
    .filter((x) => !soloPronte || x.pronta)

  return (
    <div className="stack">
      <section className="card">
        <h2>Craft</h2>
        <p className="muted">
          {vista === 'A'
            ? 'Armi di Grado A (10 Danni): 1 materiale E + 1 D + 1 C, tutti diversi.'
            : 'Armi di Grado S (12 Danni): 2 materiali B diversi. Danno anche un\'Abilità perenne che tieni anche senza impugnarle.'}
        </p>
        <div className="filtri">
          <button className={vista === 'A' ? 'on' : ''} onClick={() => setVista('A')}>Armi A</button>
          <button className={vista === 'S' ? 'on' : ''} onClick={() => setVista('S')}>Armi S</button>
          <span className="sep" />
          <label className="check">
            <input type="checkbox" checked={soloPronte} onChange={(e) => setSoloPronte(e.target.checked)} /> Solo quelle che posso forgiare
          </label>
        </div>
      </section>

      {mostrate.map(({ r, pronta }) => (
        <div key={r.nome} className={`item ${pronta ? 'pronta' : ''}`}>
          <div className="item-head">
            <strong>{r.nome}</strong>
            <span className="tag">{r.tipo}</span>
            <span className="tag">{vista === 'A' ? '10' : '12'} Danni</span>
            {qtaIn(c, slug(r.nome)) > 0 && <span className="tag qta">già in inventario</span>}
          </div>
          <ul className="ingredienti">
            {r.ing.map((n) => {
              const q = qtaIn(c, slug(n))
              return (
                <li key={n} className={q > 0 ? 'ok' : 'no'}>
                  {q > 0 ? '✓' : '✗'} {n} <small>({gradoDi(slug(n)) || '?'}){q > 1 ? ` ×${q}` : ''}</small>
                </li>
              )
            })}
          </ul>
          <p className="item-desc">{r.abilita}</p>
          {r.perenne && <p className="item-desc"><b>Abilità perenne:</b> {r.perenne}</p>}
          <div className="item-act">
            <button className="primary" disabled={!pronta} onClick={() => forgia(r)}>
              {pronta ? 'Forgia' : 'Mancano materiali'}
            </button>
          </div>
        </div>
      ))}
      {mostrate.length === 0 && <p className="muted centrato">Nessuna ricetta pronta: sconfiggi mostri per ottenere materiali.</p>}

      <section className="card">
        <h2>{GALAXIS.nome}</h2>
        <p className="muted">Non si forgia da qui: se riunisci {GALAXIS.ing.join(', ')} la assegna il Master.</p>
      </section>
    </div>
  )
}
