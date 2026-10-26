import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ITEMS_BY_ID, SLOT_NOME } from '../data/items.js'
import IMMAGINI from '../data/immagini-oggetti.json'
import { equipaggiato } from '../lib/rules.js'
import { metallo } from '../lib/ui.js'

const ICONA = { anello: '💍', amuleto: '📿', agg: '🛡️', mano: '🗡️' }
const TIER_CLASSE = { C: 't-c', B: 't-b', A: 't-a', S: 't-s', SS: 't-s', Zodiaco: 't-z', Speciale: 't-z' }
const img = (id) => `${import.meta.env.BASE_URL}images/oggetti/${id}.webp`

// Figura del personaggio: chiara e semplice, nei colori del metallo della sua carta
function Figura() {
  return (
    <svg viewBox="0 0 120 240" className="figura" aria-hidden="true">
      <defs>
        <linearGradient id="corpo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--m2)" stopOpacity=".55" />
          <stop offset="1" stopColor="var(--m3)" stopOpacity=".25" />
        </linearGradient>
      </defs>
      <g fill="url(#corpo)" stroke="var(--m1)" strokeWidth="1.6" strokeLinejoin="round">
        <circle cx="60" cy="30" r="18" />
        <path d="M44 56 Q60 62 76 56 L98 66 Q104 70 102 78 L96 130 L84 128 L82 96 L80 134 L84 214 L68 214 L60 150 L52 214 L36 214 L40 134 L38 96 L36 128 L24 130 L18 78 Q16 70 22 66 Z" />
      </g>
      <g fill="var(--m2)" opacity=".8">
        <path d="M60 78 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4z" />
      </g>
    </svg>
  )
}

function Slot({ id, etichetta, icona, oggetti = [], vuotoNota, onApri, doppio }) {
  const it = oggetti[0]
  return (
    <button
      type="button" className={`slot ${it ? `pieno ${TIER_CLASSE[it.tier] || ''}` : 'vuoto'} ${doppio ? 'doppio' : ''}`}
      onClick={() => onApri(id)} aria-label={it ? `${etichetta}: ${it.nome}` : `${etichetta}: vuoto`}
    >
      {it && IMMAGINI.includes(it.id) ? <img src={img(it.id)} alt="" loading="lazy" /> : <span className="slot-icona">{icona}</span>}
      <span className="slot-nome">{it ? it.nome : etichetta}</span>
      {oggetti.length > 1 && <span className="slot-piu">+{oggetti.length - 1}</span>}
      {!it && vuotoNota && <small>{vuotoNota}</small>}
    </button>
  )
}

// Equipaggiamento sulla sagoma: Amuleto, Item aggiuntivo, Anello e le armi nelle mani
export default function Sagoma({ c, onToggle }) {
  const [aperto, setAperto] = useState(null) // id dello slot aperto
  const eq = equipaggiato(c)
  const righe = c.inventario.map((r) => ({ ...r, it: ITEMS_BY_ID[r.id] })).filter((r) => r.it)

  const candidati = (slot) =>
    righe.filter((r) => !r.eq && (slot === 'mano' ? r.it.cat === 'arma' && r.it.mani : r.it.cat === 'oggetto' && r.it.slot === slot))

  const contenuto = {
    amuleto: eq.amuleto, agg: eq.agg, anello: eq.anello,
    destra: eq.dueMani ? [eq.dueMani] : eq.destra ? [eq.destra, ...eq.extraMani] : [],
    sinistra: eq.dueMani ? [eq.dueMani] : eq.sinistra ? [eq.sinistra] : [],
  }
  const slotDi = (id) => (id === 'destra' || id === 'sinistra' ? 'mano' : id)
  const titolo = { amuleto: 'Amuleto', agg: 'Item aggiuntivo', anello: 'Anello', destra: 'Mano destra', sinistra: 'Mano sinistra' }

  const chiudi = () => setAperto(null)
  const lista = aperto ? contenuto[aperto] : []
  const dettaglio = lista[0]

  return (
    <section className={`card sagoma ${metallo(c.rango)} carta`}>
      <h2>Equipaggiamento</h2>
      <div className="sagoma-griglia">
        <Slot id="amuleto" etichetta="Amuleto" icona={ICONA.amuleto} oggetti={eq.amuleto} onApri={setAperto} />
        <div className="figura-box"><Figura /></div>
        <Slot id="anello" etichetta="Anello" icona={ICONA.anello} oggetti={eq.anello} onApri={setAperto} />
        <Slot id="agg" etichetta="Item agg." icona={ICONA.agg} oggetti={eq.agg} onApri={setAperto} />
        <Slot id="sinistra" etichetta="Mano sinistra" icona={ICONA.mano} oggetti={contenuto.sinistra} vuotoNota={eq.dueMani ? '' : ''} onApri={setAperto} doppio={!!eq.dueMani} />
        <Slot id="destra" etichetta="Mano destra" icona={ICONA.mano} oggetti={contenuto.destra} onApri={setAperto} doppio={!!eq.dueMani} />
      </div>
      {eq.dueMani && <p className="muted sagoma-nota">⚔️ {eq.dueMani.nome} occupa entrambe le mani.</p>}
      {eq.senzaMani.length > 0 && <p className="muted sagoma-nota">Anche equipaggiate: {eq.senzaMani.map((a) => a.nome).join(', ')}.</p>}

      {aperto && createPortal(
        <div className="lightbox sagoma-modale" onClick={chiudi}>
          <div className="card sagoma-foglio" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={titolo[aperto]}>
            <div className="riga spazio">
              <strong>{titolo[aperto]}</strong>
              <button className="ghost" onClick={chiudi} aria-label="Chiudi">×</button>
            </div>
            {dettaglio ? (
              <>
                {IMMAGINI.includes(dettaglio.id) && <img className="sagoma-img" src={img(dettaglio.id)} alt={dettaglio.nome} />}
                <h3 className="sagoma-nome">{dettaglio.nome}</h3>
                <p className="muted">{dettaglio.slot ? SLOT_NOME[dettaglio.slot] : dettaglio.tipo} · Grado {dettaglio.tier}</p>
                <p>{dettaglio.abilita || dettaglio.desc}</p>
                <button className="primary" onClick={() => { onToggle(righe.find((r) => r.id === dettaglio.id)); chiudi() }}>Togli</button>
              </>
            ) : (
              <>
                {candidati(slotDi(aperto)).length === 0 ? (
                  <p className="muted">Non hai niente da mettere qui. {slotDi(aperto) === 'mano' ? 'Nessuna arma' : `Nessun ${SLOT_NOME[slotDi(aperto)]?.toLowerCase()}`} nell'inventario.</p>
                ) : (
                  <ul className="sagoma-lista">
                    {candidati(slotDi(aperto)).map((r) => (
                      <li key={r.id}>
                        <span>{r.it.nome} <small className="muted">· {r.it.tier}</small></span>
                        <button onClick={() => { onToggle(r); chiudi() }}>Equipaggia</button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </section>
  )
}
