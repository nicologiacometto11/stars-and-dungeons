import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ITEMS_BY_ID, SLOT_NOME } from '../data/items.js'
import IMMAGINI from '../data/immagini-oggetti.json'
import { dannoArma, equipaggiato, testoDanno, verificaReq } from '../lib/rules.js'
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

const ORDINE_GRADO = { SS: 0, S: 1, A: 2, B: 3, C: 4 }

// Scheda di un oggetto o di un'arma dentro il foglio: immagine, grado, effetto, danni, requisiti
function Candidato({ it, c, d, azione, etichetta, primario }) {
  const [esteso, setEsteso] = useState(false)
  const testo = it.abilita || it.desc || ''
  const soddisfatto = it.req ? verificaReq(it.req, c, d) : true
  const g = it.cat === 'arma' && d ? dannoArma(it, d) : null
  return (
    <li className={`cand ${TIER_CLASSE[it.tier] || ''} ${soddisfatto ? '' : 'bloccato'}`}>
      <div className="cand-img">
        {IMMAGINI.includes(it.id) ? <img src={img(it.id)} alt="" loading="lazy" /> : <span>{ICONA[it.slot || 'mano']}</span>}
      </div>
      <div className="cand-info">
        <div className="cand-testa">
          <strong>{it.nome}</strong>
          <span className="tag">{it.tier}</span>
        </div>
        <div className="cand-meta">
          {it.slot && <span>{SLOT_NOME[it.slot]}</span>}
          {it.mani && <span>{it.mani === 2 ? 'Due mani' : 'Una mano'}</span>}
          {g && <span className="oro">{testoDanno(g)}</span>}
        </div>
        {testo && (
          <button type="button" className={`cand-testo ${esteso ? 'aperto' : ''}`} onClick={() => setEsteso(!esteso)} aria-expanded={esteso}>
            {testo}
          </button>
        )}
        {it.reqTxt && <small className={`req ${soddisfatto ? 'ok' : 'no'}`}>Requisiti: {it.reqTxt} {soddisfatto ? '✓' : '✗'}</small>}
      </div>
      <button className={`cand-btn ${primario ? 'primary' : ''}`} disabled={!soddisfatto} onClick={azione}>
        {soddisfatto ? etichetta : 'Requisiti mancanti'}
      </button>
    </li>
  )
}

// Equipaggiamento sulla sagoma: Amuleto, Item aggiuntivo, Anello e le armi nelle mani
export default function Sagoma({ c, d, onToggle }) {
  const [aperto, setAperto] = useState(null) // id dello slot aperto
  const eq = equipaggiato(c)
  const righe = c.inventario.map((r) => ({ ...r, it: ITEMS_BY_ID[r.id] })).filter((r) => r.it)

  const candidati = (slot) =>
    righe
      .filter((r) => !r.eq && (slot === 'mano' ? r.it.cat === 'arma' && r.it.mani : r.it.cat === 'oggetto' && r.it.slot === slot))
      .sort((a, b) => (ORDINE_GRADO[a.it.tier] ?? 9) - (ORDINE_GRADO[b.it.tier] ?? 9) || a.it.nome.localeCompare(b.it.nome))

  const contenuto = {
    amuleto: eq.amuleto, agg: eq.agg, anello: eq.anello,
    destra: eq.dueMani ? [eq.dueMani] : eq.destra ? [eq.destra, ...eq.extraMani] : [],
    sinistra: eq.dueMani ? [eq.dueMani] : eq.sinistra ? [eq.sinistra] : [],
  }
  const slotDi = (id) => (id === 'destra' || id === 'sinistra' ? 'mano' : id)
  const titolo = { amuleto: 'Amuleto', agg: 'Item aggiuntivo', anello: 'Anello', destra: 'Mano destra', sinistra: 'Mano sinistra' }
  const icona = { amuleto: ICONA.amuleto, agg: ICONA.agg, anello: ICONA.anello, destra: ICONA.mano, sinistra: ICONA.mano }

  const chiudi = () => setAperto(null)
  const lista = aperto ? contenuto[aperto] : []
  const dettaglio = lista[0]
  const scelta = aperto && !dettaglio ? candidati(slotDi(aperto)) : []
  const eseguiToggle = (r) => { if (onToggle(r) !== false) chiudi() }

  return (
    <section className={`card sagoma ${metallo(c.rango)} carta`}>
      <h2>Equipaggiamento</h2>
      <div className="sagoma-griglia">
        <Slot id="amuleto" etichetta="Amuleto" icona={ICONA.amuleto} oggetti={eq.amuleto} onApri={setAperto} />
        <div className="figura-box"><Figura /></div>
        <Slot id="anello" etichetta="Anello" icona={ICONA.anello} oggetti={eq.anello} onApri={setAperto} />
        <Slot id="agg" etichetta="Item agg." icona={ICONA.agg} oggetti={eq.agg} onApri={setAperto} />
        <Slot id="sinistra" etichetta="Mano sinistra" icona={ICONA.mano} oggetti={contenuto.sinistra} onApri={setAperto} doppio={!!eq.dueMani} />
        <Slot id="destra" etichetta="Mano destra" icona={ICONA.mano} oggetti={contenuto.destra} onApri={setAperto} doppio={!!eq.dueMani} />
      </div>
      {eq.dueMani && <p className="muted sagoma-nota">⚔️ {eq.dueMani.nome} occupa entrambe le mani.</p>}
      {eq.senzaMani.length > 0 && <p className="muted sagoma-nota">Anche equipaggiate: {eq.senzaMani.map((a) => a.nome).join(', ')}.</p>}

      {aperto && createPortal(
        <div className="foglio-sfondo" onClick={chiudi}>
          <div className="foglio" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={titolo[aperto]}>
            <div className="foglio-maniglia" aria-hidden="true" />
            <div className="foglio-testa">
              <span className="foglio-icona" aria-hidden="true">{icona[aperto]}</span>
              <div>
                <h3>{titolo[aperto]}</h3>
                <small className="muted">{dettaglio ? 'Equipaggiato ora' : scelta.length ? `${scelta.length} ${scelta.length === 1 ? 'disponibile' : 'disponibili'} nel tuo inventario` : 'Niente da mettere qui'}</small>
              </div>
              <button className="ghost foglio-x" onClick={chiudi} aria-label="Chiudi">×</button>
            </div>

            {dettaglio ? (
              <ul className="cand-lista">
                <Candidato it={dettaglio} c={c} d={d} etichetta="Togli" azione={() => eseguiToggle(righe.find((r) => r.id === dettaglio.id))} primario />
              </ul>
            ) : scelta.length === 0 ? (
              <div className="foglio-vuoto">
                <span aria-hidden="true">{icona[aperto]}</span>
                <p>{slotDi(aperto) === 'mano' ? 'Non hai armi nell\'inventario.' : `Non hai nessun ${SLOT_NOME[slotDi(aperto)].toLowerCase()} nell'inventario.`}</p>
                <small className="muted">Li trovi nel Negozio, oppure te li dà il Master.</small>
              </div>
            ) : (
              <ul className="cand-lista">
                {scelta.map((r) => <Candidato key={r.id} it={r.it} c={c} d={d} etichetta="Equipaggia" azione={() => eseguiToggle(r)} primario />)}
              </ul>
            )}
          </div>
        </div>,
        document.body,
      )}
    </section>
  )
}
