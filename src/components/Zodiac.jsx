import { useRef, useState } from 'react'
import AssegnaPunto from './AssegnaPunto.jsx'
import Costellazione from './Costellazione.jsx'
import IconaElemento from './IconaElemento.jsx'
import { metallo } from '../lib/ui.js'
import { SEGNI, SEGNI_BY_ID, OFIUCO, CATEGORIE } from '../data/zodiac.js'
import { ITEMS } from '../data/items.js'
import {
  abilitaSbloccate, effSegno, segniUsati, scelteBonus, prossimaSoglia, armiZodiacoDisponibili, armiElementoDisponibili,
  qtaIn, conAggiunta, conLog, RANGO_MAX,
} from '../lib/rules.js'

const COLORE = { fuoco: '#ff7a45', terra: '#9ccc65', aria: '#7fd1ff', acqua: '#7c93ff' }
const ELEM_NOME = { fuoco: 'Fuoco', terra: 'Terra', aria: 'Aria', acqua: 'Acqua' }
const SCELTA_NOME = { fato: 'Fato', sybil: 'Sybil', armor: 'Armor' }
const BONUS_NOME = { corpoMax: 'Corpo MAX', menteMax: 'Mente MAX', armor: 'Armor', fato: 'Fato', sybil: 'Sybil', cura: 'Cura' }


export default function Zodiac({ c, d, up }) {
  const [sel, setSel] = useState('ariete')
  const [correzione, setCorrezione] = useState(false)
  const dettaglio = useRef(null)
  // scelto un segno, si scende alla sua scheda con le abilità
  const scegli = (id) => {
    setSel(id)
    setTimeout(() => dettaglio.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }
  const s = SEGNI_BY_ID[sel]
  const pt = c.segni[sel]
  const eff = effSegno(c, sel)
  const liberi = c.rango - segniUsati(c)
  const cat = CATEGORIE.find((k) => k.id === s.categoria)

  const modifica = (delta) =>
    up((x) => {
      const nuovo = Math.max(0, Math.min(10, x.segni[sel] + delta))
      if (nuovo === x.segni[sel]) return x
      return conLog({ ...x, segni: { ...x.segni, [sel]: nuovo } }, `${s.nome}: ${nuovo} punti`)
    })

  const armiZ = armiZodiacoDisponibili(c)
  const armiE = armiElementoDisponibili(c)
  const dispo = [
    ...ITEMS.filter((i) => i.origine === 'zodiaco' && armiZ.includes(i.segno)),
    ...ITEMS.filter((i) => i.origine === 'elemento' && armiE.includes(i.elemento)),
  ]

  return (
    <div className="stack">
      <AssegnaPunto c={c} up={up} />

      <section className={`card carta ${metallo(c.rango)} zod-testa`}>
        <div className="zod-rango">
          <small>RANGO</small>
          <strong>{c.rango}</strong>
          <span className="muted">/ {RANGO_MAX}</span>
        </div>
        <div className="zod-punti">
          <div className="pips" role="img" aria-label={`Rango ${c.rango} su ${RANGO_MAX}`}>
            {Array.from({ length: RANGO_MAX }, (_, i) => <i key={i} className={i < c.rango ? 'pip on' : 'pip'} />)}
          </div>
          <small className="muted">Punti assegnati {segniUsati(c)} su {c.rango}</small>
          <p className={liberi > 0 ? 'avviso-int' : 'muted'}>
            {liberi > 0 ? `Punti da assegnare: ${liberi}` : 'Nessun punto da assegnare. Sale di Rango per averne altri.'}
          </p>
        </div>
      </section>

      <section className="card cielo">
        <h2>Le costellazioni</h2>
        <div className="legenda">
          {Object.entries(COLORE).map(([e, col]) => (
            <span key={e} style={{ color: col }}><i className="legenda-icona"><IconaElemento elemento={e} /></i> {ELEM_NOME[e]}</span>
          ))}
        </div>
        <div className="cielo-grid">
          {SEGNI.map((sg) => {
            const pt = effSegno(c, sg.id)
            return (
              <button
                key={sg.id} className={`cielo-cella ${sel === sg.id ? 'on' : ''}`} style={{ '--el': COLORE[sg.elemento] }}
                onClick={() => scegli(sg.id)} aria-label={`${sg.nome}, ${pt} punti`}
              >
                <span className="segno-icona" title={ELEM_NOME[sg.elemento]}><IconaElemento elemento={sg.elemento} /></span>
                <span className="segno-livello"><small>LIV</small><b>{pt}</b></span>
                <Costellazione id={sg.id} punti={pt} abilita={abilitaSbloccate(c, sg.id).length} mini />
                <strong className="segno-nome">{sg.nome}</strong>
                <span className="segno-pips" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < Math.min(pt, 10) ? 'on' : ''} />)}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Ofiuco è segreto: compare solo quando il giocatore lo ha già sbloccato */}
      {d.ofiuco && (
        <section className="card ofiuco-box">
          <h2>☉ {OFIUCO.nome}</h2>
          <p>{OFIUCO.effetto}</p>
          <ul>{OFIUCO.abilita.map((a) => <li key={a}>{a}</li>)}</ul>
        </section>
      )}

      <section className="card" ref={dettaglio} style={{ scrollMarginTop: 12 }}>
        <div className="cost-grande"><Costellazione id={sel} punti={eff} abilita={abilitaSbloccate(c, sel).length} /></div>
        <div className="riga spazio">
          <div>
            <h2 style={{ margin: 0 }}>{s.nome} <small className="muted">· {ELEM_NOME[s.elemento]} · {cat.nome}</small></h2>
            <small className="muted">
              {pt} punt{pt === 1 ? 'o' : 'i'}{eff !== pt && ` (+${eff - pt} bonus)`}
            </small>
          </div>
          <div className="riga">
            <button disabled={!correzione || pt <= 0} onClick={() => modifica(-1)}>−</button>
            <strong className="pt">{pt}</strong>
            <button disabled={liberi <= 0 || pt >= 10} onClick={() => modifica(1)}>+</button>
          </div>
        </div>
        <label className="check">
          <input type="checkbox" checked={correzione} onChange={(e) => setCorrezione(e.target.checked)} />
          Modalità correzione (permette di togliere punti)
        </label>

        {eff === 0 && <p className="muted">Nessun punto in questo segno.</p>}
        <ul className="abilita">
          {s.abilita.filter((a) => eff >= a.soglia).map((a) => {
            const sbloccata = true
            return (
              <li key={a.soglia} className={sbloccata ? 'sbloccata' : 'bloccata'}>
                <div className="riga spazio">
                  <strong>{a.soglia} · {a.tipo === 'segno' ? a.nome : a.nome}</strong>
                  <span className="tag">{sbloccata ? 'sbloccata' : `servono ${a.soglia}`}</span>
                </div>
                {a.tipo === 'segno' ? (
                  <>
                    <p>
                      {Object.entries(a.bonus).map(([k, v]) => `+${v} ${BONUS_NOME[k]}`).join(', ')} e +1 a scelta:
                    </p>
                    <div className="riga">
                      {a.scelta.map((k) => (
                        <button
                          key={k}
                          className={scelteBonus(c, sel) === k ? 'on' : ''}
                          onClick={() => up((x) => ({ ...x, scelte: { ...x.scelte, [sel]: k } }))}
                        >
                          +1 {SCELTA_NOME[k]}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {a.costo && <small className="costo">Costo: {a.costo}</small>}
                    <p>{a.desc}</p>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {dispo.length > 0 && (
        <section className="card">
          <h2>Armi sbloccate dallo Zodiaco</h2>
          {dispo.map((it) => {
            const ha = qtaIn(c, it.id) > 0
            return (
              <div key={it.id} className="riga spazio riga-arma">
                <div>
                  <strong>{it.nome}</strong>
                  <small className="muted"> · {it.reqTxt}</small>
                </div>
                <button
                  disabled={ha}
                  onClick={() => up((x) => conLog(conAggiunta(x, it.id), `Ottenuta ${it.nome} dallo Zodiaco`))}
                >
                  {ha ? 'Già in inventario' : 'Ottieni'}
                </button>
              </div>
            )
          })}
        </section>
      )}
    </div>
  )
}
