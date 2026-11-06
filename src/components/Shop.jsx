import { useMemo, useState } from 'react'
import { SHOP_ITEMS } from '../data/items.js'
import { conAggiunta, conLog, itemNoto, qtaIn, studiaOggetto, STUDIO_SYBIL } from '../lib/rules.js'
import ItemCard, { CartaMini } from './ItemCard.jsx'
import Finestra from './Finestra.jsx'
import { STUDI_VUOTI } from '../lib/studi.js'

export default function Shop({ c, d, up, studi = STUDI_VUOTI }) {
  // un oggetto è noto se lo ha il giocatore, lo ha già studiato lui o l'ha studiato un altro giocatore
  const noto = (id) => itemNoto(c, id) || studi.oggetti.has(id)
  const [tipo, setTipo] = useState('tutti')
  const [tier, setTier] = useState('tutti')
  const [q, setQ] = useState('')
  const [apertoId, setApertoId] = useState(null)
  const aperto = SHOP_ITEMS.find((i) => i.id === apertoId)

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
        <div className="filtri scorre">
          {[['tutti', 'Tutto'], ['arma', 'Armi'], ['anello', 'Anelli'], ['amuleto', 'Amuleti'], ['agg', 'Item agg'], ['consumabile', 'Consumabili']].map(([k, n]) => (
            <button key={k} className={tipo === k ? 'on' : ''} onClick={() => setTipo(k)}>{n}</button>
          ))}
        </div>
        <div className="filtri scorre">
          {['tutti', 'C', 'B', 'A'].map((k) => (
            <button key={k} className={tier === k ? 'on' : ''} onClick={() => setTier(k)}>{k === 'tutti' ? 'Ogni grado' : `Grado ${k}`}</button>
          ))}
        </div>
      </section>

      {studi.errore && <div className="msg" role="alert">⚠️ Gli altri giocatori non vedono quello che studi: {studi.errore}. Fai uno screenshot e mandalo a chi gestisce l'app.</div>}

      <div className="griglia-carte">
        {lista.map((it) => (
          <CartaMini key={it.id} it={it} qta={qtaIn(c, it.id)} noto={noto(it.id)} onApri={() => setApertoId(it.id)}>
            <span className="oro">{it.prezzo} Aureos</span>
          </CartaMini>
        ))}
      </div>
      {lista.length === 0 && <p className="muted centrato">Nessun risultato.</p>}

      {aperto && (
        <Finestra titolo={aperto.nome} onChiudi={() => setApertoId(null)}>
          <ItemCard
            it={aperto} c={c} d={d} qta={qtaIn(c, aperto.id)}
            noto={noto(aperto.id)} puoiStudiare={d.sybilAttuale >= STUDIO_SYBIL} onStudia={() => { up((s) => studiaOggetto(s, d, aperto.id)); studi.condividi('oggetto', aperto.id) }}
          >
            <span className="oro">{aperto.prezzo} Aureos</span>
            <button className="primary" disabled={c.aureos < aperto.prezzo} onClick={() => compra(aperto)}>
              {c.aureos < aperto.prezzo ? 'Aureos insufficienti' : 'Compra'}
            </button>
          </ItemCard>
        </Finestra>
      )}
    </div>
  )
}
