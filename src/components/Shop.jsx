import { useMemo, useState } from 'react'
import { SHOP_ITEMS } from '../data/items.js'
import { conAggiunta, conLog, itemNoto, qtaIn, studiaOggetto, STUDIO_SYBIL } from '../lib/rules.js'
import ItemCard from './ItemCard.jsx'
import { STUDI_VUOTI } from '../lib/studi.js'

export default function Shop({ c, d, up, studi = STUDI_VUOTI }) {
  // un oggetto è noto se lo ha il giocatore, lo ha già studiato lui o l'ha studiato un altro giocatore
  const noto = (id) => itemNoto(c, id) || studi.oggetti.has(id)
  const [tipo, setTipo] = useState('tutti')
  const [tier, setTier] = useState('tutti')
  const [q, setQ] = useState('')

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return SHOP_ITEMS.filter(
      (i) =>
        (tipo === 'tutti' || (tipo === 'arma' ? i.cat === 'arma' : tipo === 'consumabile' ? i.cat === 'oggetto' && i.consumabile : i.slot === tipo)) &&
        (tier === 'tutti' || i.tier === tier) &&
        (!t || i.nome.toLowerCase().includes(t) || (noto(i.id) && (i.abilita || i.desc || '').toLowerCase().includes(t))),
    ).sort((a, b) => a.prezzo - b.prezzo || a.nome.localeCompare(b.nome))
  }, [tipo, tier, q, c, studi])

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
        <input placeholder="Cerca per nome…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="filtri">
          {[['tutti', 'Tutto'], ['arma', 'Armi'], ['anello', 'Anelli'], ['amuleto', 'Amuleti'], ['agg', 'Item agg'], ['consumabile', 'Consumabili']].map(([k, n]) => (
            <button key={k} className={tipo === k ? 'on' : ''} onClick={() => setTipo(k)}>{n}</button>
          ))}
          <span className="sep" />
          {['tutti', 'C', 'B', 'A'].map((k) => (
            <button key={k} className={tier === k ? 'on' : ''} onClick={() => setTier(k)}>{k === 'tutti' ? 'Ogni grado' : `Grado ${k}`}</button>
          ))}
        </div>
      </section>

      {lista.map((it) => (
        <ItemCard
          key={it.id} it={it} c={c} d={d} qta={qtaIn(c, it.id)}
          noto={noto(it.id)} puoiStudiare={d.sybilAttuale >= STUDIO_SYBIL} onStudia={() => { up((s) => studiaOggetto(s, d, it.id)); studi.condividi('oggetto', it.id) }}
        >
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
