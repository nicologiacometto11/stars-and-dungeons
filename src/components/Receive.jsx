import { useMemo, useState } from 'react'
import { ITEMS } from '../data/items.js'
import { MOSTRI } from '../data/monsters.js'
import { applicaBottino, conversioniBottino, haAnelloOro, riceviOggetto, conLog, qtaIn, testoConversioni } from '../lib/rules.js'
import ItemCard from './ItemCard.jsx'

function Bottino({ c, up, onAvviso }) {
  const [id, setId] = useState('')
  const m = MOSTRI.find((x) => x.id === id)
  const anelloOro = haAnelloOro(c)

  const incassa = () => {
    if (!m) return
    up((s) => applicaBottino(s, m))
    const conv = conversioniBottino(m)
    if (conv.length) onAvviso(`${m.nome}: ${testoConversioni(conv)}`)
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
  const [avviso, setAvviso] = useState('')
  const mostraAvviso = (testo) => {
    setAvviso(testo)
    setTimeout(() => setAvviso(''), 9000)
  }

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

      {avviso && <div className="msg avviso-conv" role="status">💰 {avviso}</div>}

      <Bottino c={c} up={up} onAvviso={mostraAvviso} />

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
          <button onClick={() => { up((s) => riceviOggetto(s, it)); if (it.aureosAlRicevimento) mostraAvviso(`${it.nome} convertito in ${it.aureosAlRicevimento} Aureos`) }}>Ricevi</button>
        </ItemCard>
      ))}
      {lista.length > 80 && <p className="muted centrato">Mostrati 80 risultati su {lista.length}: affina la ricerca.</p>}
    </div>
  )
}
