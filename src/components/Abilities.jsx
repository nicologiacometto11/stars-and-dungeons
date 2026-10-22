import { useState } from 'react'
import { abilitaScheda, conLog, costoLibero, costiPagabili } from '../lib/rules.js'

const NOME_RIS = { mente: 'Mente', corpo: 'Corpo' }

function NuovaAbilita({ onSalva, onAnnulla }) {
  const [nome, setNome] = useState('')
  const [testo, setTesto] = useState('')
  const [mente, setMente] = useState('')
  const [corpo, setCorpo] = useState('')
  return (
    <div className="pericolo-box nuova-ab">
      <label className="campo">Nome<input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome dell'abilità" autoFocus /></label>
      <label className="campo">Cosa fa<textarea rows="3" value={testo} onChange={(e) => setTesto(e.target.value)} placeholder="Scrivi qui cosa fa la tua abilità" /></label>
      <div className="griglia">
        <label className="campo">Costo Mente<input type="number" min="0" value={mente} onChange={(e) => setMente(e.target.value)} placeholder="0" /></label>
        <label className="campo">Costo Corpo<input type="number" min="0" value={corpo} onChange={(e) => setCorpo(e.target.value)} placeholder="0" /></label>
      </div>
      <div className="riga">
        <button className="primary" disabled={!nome.trim()} onClick={() => onSalva({ id: Date.now().toString(36), nome: nome.trim(), testo: testo.trim(), mente: Number(mente) || 0, corpo: Number(corpo) || 0 })}>Salva abilità</button>
        <button className="ghost" onClick={onAnnulla}>Annulla</button>
      </div>
    </div>
  )
}

export default function Abilities({ c, d, up }) {
  const [filtro, setFiltro] = useState('tutte')
  const [nuova, setNuova] = useState(false)
  const tutte = abilitaScheda(c)
  const libero = costoLibero(c)
  const lista = tutte.filter((a) => filtro === 'tutte' || a.tipo === filtro)
  const attuale = { mente: Math.min(c.mente ?? d.menteMax, d.menteMax), corpo: Math.min(c.corpo ?? d.corpoMax, d.corpoMax) }

  const paga = (a, costo) =>
    up((s) => {
      const max = costo.ris === 'mente' ? d.menteMax : d.corpoMax
      const ora = Math.min(s[costo.ris] ?? max, max)
      if (ora < costo.n) return s
      return conLog({ ...s, [costo.ris]: ora - costo.n }, `Usata ${a.nome} (−${costo.n} ${NOME_RIS[costo.ris]})`)
    })

  const nota = (key, testo) => up((s) => ({ ...s, noteAbilita: { ...s.noteAbilita, [key]: testo } }))
  const elimina = (a) => {
    if (confirm(`Eliminare l'abilità "${a.nome}"?`)) up((s) => ({ ...s, abilitaPers: s.abilitaPers.filter((x) => x.id !== a.persId) }))
  }

  const FILTRI = [['tutte', 'Tutte'], ['zodiaco', 'Zodiaco'], ['oggetto', 'Armi e oggetti'], ['unica', 'Uniche'], ['perenne', 'Perenni'], ['pers', 'Tue']]

  return (
    <section className="card">
      <div className="riga spazio">
        <h2 style={{ margin: 0, border: 0, padding: 0 }}>Abilità</h2>
        <small className="muted">{tutte.length} disponibili</small>
      </div>
      <div className="filtri">
        {FILTRI.map(([k, n]) => (
          <button key={k} className={filtro === k ? 'on' : ''} onClick={() => setFiltro(k)}>{n}</button>
        ))}
      </div>

      {libero && <p className="muted"><small>Forma dell'Equilibrio attiva: puoi pagare ogni costo in Mente o in Corpo, a tua scelta.</small></p>}

      {lista.length === 0 && (
        <p className="muted">Nessuna abilità qui. Compaiono quando sblocchi le soglie dello Zodiaco, equipaggi armi e oggetti, ottieni abilità uniche o forgi armi S. Puoi anche scriverne una tua.</p>
      )}

      <ul className="abilita ab-lista">
        {lista.map((a) => (
          <li key={a.key} className="sbloccata">
            <div className="riga spazio">
              <strong>{a.nome}</strong>
              <span className="tag">{a.fonte}</span>
            </div>
            {a.testo && <p>{a.testo}</p>}
            {(a.costi.length > 0 || a.costoTxt) && (
              <div className="riga ab-costi">
                {costiPagabili(a.costi, libero).map((k) => (
                  <button key={k.ris + k.n} disabled={attuale[k.ris] < k.n} onClick={() => paga(a, k)} title="Toglie il costo dalla riserva">
                    Usa −{k.n} {NOME_RIS[k.ris]}
                  </button>
                ))}
                {a.costoTxt && !a.costi.length && <small className="costo">Costo: {a.costoTxt}</small>}
              </div>
            )}
            <details className="ab-note">
              <summary>{c.noteAbilita[a.key] ? 'Appunti ✎' : 'Aggiungi appunti'}</summary>
              <textarea rows="2" value={c.noteAbilita[a.key] || ''} onChange={(e) => nota(a.key, e.target.value)} placeholder="Note tue su quest'abilità" />
            </details>
            {a.persId && <button className="ghost pericolo" onClick={() => elimina(a)}>Elimina</button>}
          </li>
        ))}
      </ul>

      {nuova ? (
        <NuovaAbilita
          onAnnulla={() => setNuova(false)}
          onSalva={(ab) => { up((s) => conLog({ ...s, abilitaPers: [...s.abilitaPers, ab] }, `Nuova abilità: ${ab.nome}`)); setNuova(false); setFiltro('pers') }}
        />
      ) : (
        <button onClick={() => setNuova(true)}>+ Scrivi una tua abilità</button>
      )}
    </section>
  )
}
