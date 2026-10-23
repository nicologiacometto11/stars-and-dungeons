import { useState } from 'react'
import { ITEMS_BY_ID } from '../data/items.js'
import { slug } from '../data/craft.js'
import { RICETTE, conLog, qtaIn, tentaCraft } from '../lib/rules.js'

export default function Craft({ c, up }) {
  const [sel, setSel] = useState([])
  const [msg, setMsg] = useState('')

  const materiali = c.inventario.map((r) => ({ ...r, it: ITEMS_BY_ID[r.id] })).filter((r) => r.it?.cat === 'materiale')
  const conosciute = RICETTE.filter((r) => c.ricette.includes(r.nome))

  const scegli = (id) => {
    setMsg('')
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const tenta = (ids) => {
    const { esito, ricetta } = tentaCraft(c, ids)
    if (esito === 'ok') {
      up((s) => tentaCraft(s, ids).c)
      setMsg(`✨ Hai forgiato ${ricetta.nome}!`)
      setSel([])
    } else {
      up((s) => conLog(s, `Tentativo di craft fallito (${ids.map((id) => ITEMS_BY_ID[id]?.nome).join(', ')})`))
      setMsg('Non succede niente: quella combinazione non funziona. I materiali restano con te.')
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <h2>Craft</h2>
        <p className="muted">Scegli i materiali che vuoi unire e tenta la forgiatura. Se la combinazione è giusta ottieni l'arma e i materiali si consumano; se è sbagliata non perdi niente.</p>
        {materiali.length === 0 ? (
          <p className="muted">Non hai materiali di craft. Sconfiggi mostri per ottenerli.</p>
        ) : (
          <div className="mat-lista">
            {materiali.map((r) => (
              <label key={r.id} className={sel.includes(r.id) ? 'on' : ''}>
                <input type="checkbox" checked={sel.includes(r.id)} onChange={() => scegli(r.id)} />
                <span>{r.it.nome}{r.qta > 1 && ` ×${r.qta}`}</span>
                <span className="tag">{r.it.tier}</span>
              </label>
            ))}
          </div>
        )}
        <div className="riga">
          <button className="primary" disabled={sel.length < 2} onClick={() => tenta(sel)}>Tenta con {sel.length} material{sel.length === 1 ? 'e' : 'i'}</button>
          {sel.length > 0 && <button className="ghost" onClick={() => { setSel([]); setMsg('') }}>Svuota</button>}
        </div>
        {msg && <div className="msg" style={{ marginTop: 10 }}>{msg}</div>}
      </section>

      {conosciute.length > 0 && <h2 className="titolo-sez">Ricette scoperte</h2>}
      {conosciute.map((r) => {
        const pronta = r.ing.every((n) => qtaIn(c, slug(n)) > 0)
        return (
          <div key={r.nome} className={`item ${pronta ? 'pronta' : ''}`}>
            <div className="item-head">
              <strong>{r.nome}</strong>
              <span className="tag">{r.tipo}</span>
              {qtaIn(c, slug(r.nome)) > 0 && <span className="tag qta">già in inventario</span>}
            </div>
            <ul className="ingredienti">
              {r.ing.map((n) => {
                const q = qtaIn(c, slug(n))
                return <li key={n} className={q > 0 ? 'ok' : 'no'}>{q > 0 ? '✓' : '✗'} {n}{q > 1 ? ` ×${q}` : ''}</li>
              })}
            </ul>
            <p className="item-desc">{r.abilita}</p>
            {r.perenne && <p className="item-desc"><b>Abilità perenne:</b> {r.perenne}</p>}
            <div className="item-act">
              <button className="primary" disabled={!pronta} onClick={() => tenta(r.ing.map((n) => slug(n)))}>
                {pronta ? 'Forgia' : 'Mancano materiali'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
