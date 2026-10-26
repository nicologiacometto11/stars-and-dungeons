import { useState } from 'react'
import AssegnaPunto from './AssegnaPunto.jsx'
import Costellazione from './Costellazione.jsx'
import { SEGNI, SEGNI_BY_ID, OFIUCO, CATEGORIE } from '../data/zodiac.js'
import { ITEMS } from '../data/items.js'
import {
  abilitaSbloccate, effSegno, segniUsati, scelteBonus, prossimaSoglia, armiZodiacoDisponibili, armiElementoDisponibili,
  qtaIn, conAggiunta, conLog,
} from '../lib/rules.js'

const COLORE = { fuoco: '#ff7a45', terra: '#9ccc65', aria: '#7fd1ff', acqua: '#7c93ff' }
const ELEM_NOME = { fuoco: 'Fuoco', terra: 'Terra', aria: 'Aria', acqua: 'Acqua' }
const SCELTA_NOME = { fato: 'Fato', sybil: 'Sybil', armor: 'Armor' }
const BONUS_NOME = { corpoMax: 'Corpo MAX', menteMax: 'Mente MAX', armor: 'Armor', fato: 'Fato', sybil: 'Sybil', cura: 'Cura' }

function Ruota({ c, sel, onSel }) {
  const R = 150
  const r0 = 52
  const pol = (rad, ang) => [160 + rad * Math.cos(ang), 160 + rad * Math.sin(ang)]
  return (
    <svg viewBox="0 0 320 320" className="ruota" role="img" aria-label="Ruota dello Zodiaco">
      {SEGNI.map((s, i) => {
        const a0 = (i * 30 - 90) * (Math.PI / 180)
        const a1 = ((i + 1) * 30 - 90) * (Math.PI / 180)
        const am = (a0 + a1) / 2
        const pt = effSegno(c, s.id)
        const [x0, y0] = pol(R, a0), [x1, y1] = pol(R, a1), [x2, y2] = pol(r0, a1), [x3, y3] = pol(r0, a0)
        const [tx, ty] = pol((R + r0) / 2 + 6, am)
        return (
          <g key={s.id} onClick={() => onSel(s.id)} style={{ cursor: 'pointer' }}>
            <path
              d={`M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 0 0 ${x3},${y3} Z`}
              fill={COLORE[s.elemento]}
              fillOpacity={0.12 + Math.min(pt, 10) * 0.08}
              stroke={sel === s.id ? '#fff' : 'rgba(255,255,255,.25)'}
              strokeWidth={sel === s.id ? 2.5 : 1}
            />
            <text x={tx} y={ty - 4} textAnchor="middle" fontSize="9" fill="#fff">{s.nome}</text>
            <text x={tx} y={ty + 11} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{pt}</text>
          </g>
        )
      })}
      <circle cx="160" cy="160" r="46" fill="#0b0d1a" stroke="rgba(255,255,255,.2)" />
      <text x="160" y="157" textAnchor="middle" fontSize="10" fill="#aab">RANGO</text>
      <text x="160" y="178" textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff">{c.rango}</text>
    </svg>
  )
}

export default function Zodiac({ c, d, up }) {
  const [sel, setSel] = useState('ariete')
  const [correzione, setCorrezione] = useState(false)
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

      <section className="card">
        <Ruota c={c} sel={sel} onSel={setSel} />
        <div className="legenda">
          {Object.entries(COLORE).map(([e, col]) => (
            <span key={e}><i style={{ background: col }} />{ELEM_NOME[e]}</span>
          ))}
        </div>
        <p className={liberi > 0 ? 'avviso-int' : 'muted'}>
          {liberi > 0 ? `Punti da assegnare: ${liberi}` : 'Nessun punto da assegnare. Sale di Rango per averne altri.'}
        </p>
      </section>

      <section className="card cielo">
        <h2>Il tuo cielo</h2>
        <div className="cielo-grid">
          {SEGNI.map((sg) => (
            <button key={sg.id} className={`cielo-cella ${sel === sg.id ? 'on' : ''}`} onClick={() => setSel(sg.id)} aria-label={`${sg.nome}, ${effSegno(c, sg.id)} punti`}>
              <Costellazione id={sg.id} punti={effSegno(c, sg.id)} abilita={abilitaSbloccate(c, sg.id).length} mini />
              <small>{sg.nome}{effSegno(c, sg.id) > 0 && <b> · {effSegno(c, sg.id)}</b>}</small>
            </button>
          ))}
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

      <section className="card">
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
          <h2>Armi sbloccate dalla Ruota</h2>
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
                  onClick={() => up((x) => conLog(conAggiunta(x, it.id), `Ottenuta ${it.nome} dalla Ruota`))}
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
