import { useMemo, useState } from 'react'
import { SHOP_ITEMS } from '../data/items.js'
import { conAggiunta, conLog, qtaIn } from '../lib/rules.js'
import ItemCard from './ItemCard.jsx'

export default function Shop({ c, d, up }) {
  const [tipo, setTipo] = useState('tutti')
  const [tier, setTier] = useState('tutti')
  const [q, setQ] = useState('')

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return SHOP_ITEMS.filter(
      (i) =>
        (tipo === 'tutti' || i.cat === tipo) &&
        (tier === 'tutti' || i.tier === tier) &&
        (!t || i.nome.toLowerCase().includes(t) || (i.abilita || i.desc || '').toLowerCase().includes(t)),
    ).sort((a, b) => a.prezzo - b.prezzo || a.nome.localeCompare(b.nome))
  }, [tipo, tier, q])

  const compra = (it) =>
    up((s) => {
      if (s.aureos < it.prezzo) return s
      return conLog(conAggiunta({ ...s, aureos: s.aureos - it.prezzo }, it.id), `Acquistato ${it.nome} (−${it.prezzo} Aureos)`)
    })

  return (
    <div className="stack">
      <section className="card">
        <div className="riga spazio">
          <h2 style={{ margin: 0 }}>Negozio</h2>
          <strong className="oro">{c.aureos} Aureos</strong>
        </div>
        <input placeholder="Cerca per nome o effetto…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="filtri">
          {[['tutti', 'Tutto'], ['arma', 'Armi'], ['oggetto', 'Oggetti']].map(([k, n]) => (
            <button key={k} className={tipo === k ? 'on' : ''} onClick={() => setTipo(k)}>{n}</button>
          ))}
          <span className="sep" />
          {['tutti', 'C', 'B', 'A'].map((k) => (
            <button key={k} className={tier === k ? 'on' : ''} onClick={() => setTier(k)}>{k === 'tutti' ? 'Ogni grado' : `Grado ${k}`}</button>
          ))}
        </div>
      </section>

      {lista.map((it) => (
        <ItemCard key={it.id} it={it} c={c} d={d} qta={qtaIn(c, it.id)}>
          <span className="oro">{it.prezzo} Aureos</span>
          <button className="primary" disabled={c.aureos < it.prezzo} onClick={() => compra(it)}>
            {c.aureos < it.prezzo ? 'Aureos insufficienti' : 'Compra'}
          </button>
        </ItemCard>
      ))}
      {lista.length === 0 && <p className="muted centrato">Nessun risultato.</p>}
    </div>
  )
}
