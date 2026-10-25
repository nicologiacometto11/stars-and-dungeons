import { useState } from 'react'
import { MOSTRI, AMBIENTI, GRADI, SYBIL_COSTO } from '../data/monsters.js'
import { slug } from '../data/craft.js'
import { conLog } from '../lib/rules.js'
import AMBIENTI_IMG from '../data/ambienti.json'

const BASE = import.meta.env.BASE_URL
const img = (p) => `${BASE}${p}`

function Luoghi({ ambiente }) {
  const dati = AMBIENTI_IMG[slug(ambiente)]
  const [aperta, setAperta] = useState(null)
  if (!dati) return null
  return (
    <section className="card">
      <h2>{ambiente}</h2>
      {dati.mappa && (
        <a href={img(dati.mappa)} target="_blank" rel="noreferrer">
          <img className="mappa" src={img(dati.mappa)} alt={`Mappa ${ambiente}`} loading="lazy" />
        </a>
      )}
      <div className="luoghi">
        {dati.luoghi.map((l) => (
          <button key={l.file} className="luogo" onClick={() => setAperta(l)}>
            <img src={img(l.file)} alt={l.titolo} loading="lazy" />
          </button>
        ))}
      </div>
      {aperta && (
        <div className="lightbox" onClick={() => setAperta(null)}>
          <img src={img(aperta.file)} alt={aperta.titolo} />
          <span>{aperta.titolo}</span>
        </div>
      )}
    </section>
  )
}

export default function Bestiary({ c, d, up }) {
  const [amb, setAmb] = useState(AMBIENTI[0])
  const [grado, setGrado] = useState('tutti')
  const [vista, setVista] = useState('mostri')

  const lista = MOSTRI.filter((m) => m.ambiente === amb && (grado === 'tutti' || m.grado === grado))
  const speciali = MOSTRI.filter((m) => !AMBIENTI.includes(m.ambiente))
  const trovati = Object.keys(c.bestiario.scoperti).length

  const scopri = (m) =>
    up((s) => conLog({ ...s, bestiario: { ...s.bestiario, scoperti: { ...s.bestiario.scoperti, [m.id]: true } } }, `Scoperto nel Bestiario: ${m.nome}`))

  const nascondi = (m) =>
    up((s) => conLog({ ...s, bestiario: { ...s.bestiario, scoperti: Object.fromEntries(Object.entries(s.bestiario.scoperti).filter(([k]) => k !== m.id)) } }, `Nascosto nel Bestiario: ${m.nome}`))

  const rivela = (m) => {
    const costo = SYBIL_COSTO
    up((s) => {
      if (d.sybil - (s.usati.sybil || 0) < costo) return s
      return conLog(
        { ...s, usati: { ...s.usati, sybil: (s.usati.sybil || 0) + costo }, bestiario: { ...s.bestiario, rivelati: { ...s.bestiario.rivelati, [m.id]: true } } },
        `Studiato ${m.nome} (−${costo} Sybil)`,
      )
    })
  }

  const Card = ({ m }) => {
    const scoperto = !!c.bestiario.scoperti[m.id]
    const rivelato = scoperto && !!c.bestiario.rivelati[m.id]
    const costo = SYBIL_COSTO
    const primo = m.abilita.split('. ')[0]
    return (
      <div className={`mostro ${scoperto ? '' : 'ignoto'}`}>
        <div className="mostro-img">
          <img src={img(`images/monsters/${m.id}.webp`)} alt={scoperto ? m.nome : 'Creatura sconosciuta'} loading="lazy" />
        </div>
        <div className="mostro-info">
          <div className="riga spazio">
            <strong>{scoperto ? m.nome : '???'}</strong>
            <span className="tag">Grado {m.grado}</span>
          </div>
          {!scoperto && <button onClick={() => scopri(m)}>Segna come incontrato</button>}
          {scoperto && <button className="ghost nascondi" onClick={() => nascondi(m)}>Nascondi di nuovo</button>}
          {scoperto && !rivelato && !m.illeggibile && (
            <button className="primary" disabled={d.sybilAttuale < costo} onClick={() => rivela(m)}>
              {d.sybilAttuale < costo ? `Servono ${costo} Sybil` : `Paga ${costo} Sybil per studiarlo`}
            </button>
          )}
          {scoperto && m.illeggibile && <small className="muted">Illeggibile: nessun dato</small>}
          {rivelato && (
            <ul className="dati">
              {m.pv && <li><b>PV</b> {m.pv}</li>}
              {m.d && <li><b>Per colpirlo</b> {m.d}+ sul dado</li>}
              <li><b>Attacco</b> {primo}</li>
              {m.aureos != null && <li><b>Aureos</b> {m.aureos}</li>}
              {m.drop.length > 0 && <li><b>Bottino</b> {m.drop.join(', ')}</li>}
            </ul>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="riga spazio">
          <h2 style={{ margin: 0 }}>Bestiario</h2>
          <small className="muted">{trovati}/{MOSTRI.length} scoperti · Sybil {d.sybilAttuale}</small>
        </div>
        <div className="filtri">
          {AMBIENTI.map((a) => (
            <button key={a} className={vista === 'mostri' && amb === a ? 'on' : ''} onClick={() => { setAmb(a); setVista('mostri') }}>{a}</button>
          ))}
          <button className={vista === 'speciali' ? 'on' : ''} onClick={() => setVista('speciali')}>Boss e Missioni</button>
        </div>
        {vista === 'mostri' && (
          <div className="filtri">
            {['tutti', ...GRADI.filter((g) => MOSTRI.some((m) => m.ambiente === amb && m.grado === g))].map((g) => (
              <button key={g} className={grado === g ? 'on' : ''} onClick={() => setGrado(g)}>{g === 'tutti' ? 'Tutti i gradi' : g}</button>
            ))}
          </div>
        )}
      </section>

      {vista === 'mostri' && <Luoghi ambiente={amb} />}

      <div className="mostri">
        {(vista === 'mostri' ? lista : speciali).map((m) => <Card key={m.id} m={m} />)}
      </div>
    </div>
  )
}
