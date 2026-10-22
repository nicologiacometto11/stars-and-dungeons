import { useMemo, useState } from 'react'
import { ITEMS } from '../data/items.js'
import { MOSTRI } from '../data/monsters.js'
import { MATERIALI_AUREOS, slug } from '../data/craft.js'
import { conAggiunta, conLog, qtaIn } from '../lib/rules.js'
import ItemCard from './ItemCard.jsx'

// Aggiunge un oggetto alla scheda. I materiali "che danno Aureos" si convertono subito.
function ricevi(s, it, qta = 1) {
  if (it.aureosAlRicevimento) {
    const tot = it.aureosAlRicevimento * qta
    return conLog({ ...s, aureos: s.aureos + tot }, `Ricevuto ${it.nome}: +${tot} Aureos`)
  }
  return conLog(conAggiunta(s, it.id, qta), `Ricevuto ${qta > 1 ? qta + '× ' : ''}${it.nome}`)
}

function Bottino({ c, up }) {
  const [id, setId] = useState('')
  const m = MOSTRI.find((x) => x.id === id)
  const anelloOro = c.inventario.some((i) => i.id === slug("Anello d'Oro") && i.eq)

  const incassa = () => {
    if (!m) return
    up((s) => {
      let x = s
      if (m.aureos) {
        const au = m.aureos * (anelloOro ? 2 : 1)
        x = conLog({ ...x, aureos: x.aureos + au }, `Sconfitto ${m.nome}: +${au} Aureos${anelloOro ? ' (Anello d\'Oro)' : ''}`)
      } else x = conLog(x, `Sconfitto ${m.nome}`)
      for (const n of m.drop) {
        const it = ITEMS.find((i) => i.id === slug(n))
        if (it) x = ricevi(x, it)
      }
      return x
    })
    setId('')
  }

  return (
    <section className="card">
      <h2>Mostro sconfitto</h2>
      <p className="muted">Aureos e materiali del bottino. Con l'Anello d'Oro equipaggiato gli Aureos raddoppiano.</p>
      <select value={id} onChange={(e) => setId(e.target.value)}>
        <option value="">Scegli il mostro…</option>
        {MOSTRI.map((x) => (
          <option key={x.id} value={x.id}>{x.nome} (Grado {x.grado})</option>
        ))}
      </select>
      {m && (
        <p>
          {m.aureos ? `+${m.aureos * (anelloOro ? 2 : 1)} Aureos` : 'Nessun Aureos'}
          {m.drop.length > 0 && ` · ${m.drop.join(', ')}`}
        </p>
      )}
      <button className="primary" disabled={!m} onClick={incassa}>Incassa il bottino</button>
    </section>
  )
}

export default function Receive({ c, d, up }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('tutti')
  const [au, setAu] = useState('')

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return ITEMS.filter((i) => (cat === 'tutti' || i.cat === cat) && (!t || i.nome.toLowerCase().includes(t)))
  }, [q, cat])

  return (
    <div className="stack">
      <section className="card">
        <h2>Ricevi</h2>
        <p className="muted">Ricompense di missioni, Armi Speciali, Abilità uniche. Registra qui ciò che ti dà il Master.</p>
        <div className="riga">
          <input type="number" min="1" placeholder="Aureos ricevuti" value={au} onChange={(e) => setAu(e.target.value)} />
          <button
            className="primary"
            disabled={!(Number(au) > 0)}
            onClick={() => { up((s) => conLog({ ...s, aureos: s.aureos + Number(au) }, `Ricevuti ${au} Aureos`)); setAu('') }}
          >
            Aggiungi
          </button>
        </div>
      </section>

      <Bottino c={c} up={up} />

      <section className="card">
        <h2>Oggetti, armi e abilità</h2>
        <input placeholder="Cerca…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="filtri">
          {[['tutti', 'Tutto'], ['arma', 'Armi'], ['oggetto', 'Oggetti'], ['materiale', 'Materiali'], ['chiave', 'Chiave'], ['abilita', 'Abilità']].map(([k, n]) => (
            <button key={k} className={cat === k ? 'on' : ''} onClick={() => setCat(k)}>{n}</button>
          ))}
        </div>
      </section>

      {lista.slice(0, 80).map((it) => (
        <ItemCard key={it.id} it={it} c={c} d={d} qta={qtaIn(c, it.id)} compact>
          {it.aureosAlRicevimento && <small className="muted">Si converte subito in {it.aureosAlRicevimento} Aureos</small>}
          <button onClick={() => up((s) => ricevi(s, it))}>Ricevi</button>
        </ItemCard>
      ))}
      {lista.length > 80 && <p className="muted centrato">Mostrati 80 risultati su {lista.length}: affina la ricerca.</p>}
    </div>
  )
}
