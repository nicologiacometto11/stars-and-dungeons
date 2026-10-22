import { useRef } from 'react'
import { CATEGORIE } from '../data/zodiac.js'
import { RANGO_MAX, segniUsati, conLog, normalizza } from '../lib/rules.js'
import { esportaJSON } from '../lib/store.js'

function Riserva({ nome, valore, max, onChange, onRipristina }) {
  const pct = max > 0 ? Math.min(100, (valore / max) * 100) : 0
  return (
    <div className="riserva">
      <div className="riserva-top">
        <strong>{nome}</strong>
        <span>{valore} / {max}</span>
      </div>
      <div className="barra"><div style={{ width: `${pct}%` }} /></div>
      <div className="riga">
        <button onClick={() => onChange(Math.max(0, valore - 5))}>−5</button>
        <button onClick={() => onChange(Math.max(0, valore - 1))}>−1</button>
        <button onClick={() => onChange(Math.min(max, valore + 1))}>+1</button>
        <button onClick={() => onChange(Math.min(max, valore + 5))}>+5</button>
        <button className="ghost" onClick={onRipristina}>Ripristina</button>
      </div>
    </div>
  )
}

function Contatore({ nome, valore, max, onMeno, onPiu, nota }) {
  return (
    <div className="stat">
      <span className="stat-n">{nome}</span>
      <div className="riga">
        <button onClick={onMeno} disabled={valore <= 0}>−</button>
        <strong>{valore}</strong>
        <button onClick={onPiu} disabled={valore >= max}>+</button>
      </div>
      <small>{nota || `max ${max}`}</small>
    </div>
  )
}

export default function Sheet({ c, d, up }) {
  const fileRef = useRef(null)
  const usati = segniUsati(c)
  const liberi = c.rango - usati
  const corpo = Math.min(c.corpo ?? d.corpoMax, d.corpoMax)
  const mente = Math.min(c.mente ?? d.menteMax, d.menteMax)

  function importa(e) {
    const f = e.target.files?.[0]
    if (!f) return
    f.text().then((t) => {
      try {
        const s = normalizza(JSON.parse(t))
        if (confirm(`Sostituire la scheda attuale con "${s.nome}"?`)) up(() => s)
      } catch {
        alert('File non valido.')
      }
    })
    e.target.value = ''
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="riga spazio">
          <input className="nome" value={c.nome} onChange={(e) => up((s) => ({ ...s, nome: e.target.value }))} />
          <div className="rango">
            <small>RANGO</small>
            <div className="riga">
              <strong>{c.rango}</strong>
              <button
                disabled={c.rango >= RANGO_MAX}
                onClick={() => up((s) => conLog({ ...s, rango: s.rango + 1 }, `Rango ${s.rango + 1}`))}
              >+</button>
            </div>
            <small>{c.rango}/{RANGO_MAX} (non si può ridurre)</small>
          </div>
        </div>
        <p className={liberi > 0 ? 'avviso-int' : 'muted'}>
          {liberi > 0 ? `Hai ${liberi} punt${liberi === 1 ? 'o' : 'i'} da assegnare nello Zodiaco.` : 'Tutti i punti Rango sono assegnati.'}
        </p>
        {d.ofiuco && <p className="ofiuco">☉ Hai trovato Ofiuco: tutte le tue caratteristiche sono raddoppiate.</p>}
      </section>

      <section className="card">
        <h2>Riserve</h2>
        <Riserva nome="Corpo" valore={corpo} max={d.corpoMax} onChange={(v) => up((s) => ({ ...s, corpo: v }))} onRipristina={() => up((s) => ({ ...s, corpo: null }))} />
        <Riserva nome="Mente" valore={mente} max={d.menteMax} onChange={(v) => up((s) => ({ ...s, mente: v }))} onRipristina={() => up((s) => ({ ...s, mente: null }))} />
        <div className="griglia">
          <Contatore
            nome="Fato" valore={d.fatoAttuale} max={d.fato}
            onMeno={() => up((s) => ({ ...s, usati: { ...s.usati, fato: s.usati.fato + 1 } }))}
            onPiu={() => up((s) => ({ ...s, usati: { ...s.usati, fato: Math.max(0, s.usati.fato - 1) } }))}
          />
          <Contatore
            nome="Sybil" valore={d.sybilAttuale} max={d.sybil}
            onMeno={() => up((s) => ({ ...s, usati: { ...s.usati, sybil: s.usati.sybil + 1 } }))}
            onPiu={() => up((s) => ({ ...s, usati: { ...s.usati, sybil: Math.max(0, s.usati.sybil - 1) } }))}
          />
          <div className="stat"><span className="stat-n">Cura</span><strong>{d.cura}</strong><small>punti Cura</small></div>
          <div className="stat">
            <span className="stat-n">Aureos</span>
            <input
              type="number" min="0" value={c.aureos}
              onChange={(e) => up((s) => ({ ...s, aureos: Math.max(0, Number(e.target.value) || 0) }))}
            />
            <small>moneta di gioco</small>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Armor</h2>
        <div className="griglia">
          <div className="stat"><span className="stat-n">Fisica</span><strong>{d.armorFisica}</strong></div>
          <div className="stat"><span className="stat-n">Magica</span><strong>{d.armorMagica}</strong></div>
        </div>
        <label className="campo">
          Armor di base da assegnare alla parte Fisica ({d.armorSplitEff} di {d.armorBase})
          <input type="range" min="0" max={d.armorBase} value={d.armorSplitEff} onChange={(e) => up((s) => ({ ...s, armorSplit: Number(e.target.value) }))} />
        </label>
        <small className="muted">Gli oggetti equipaggiati aggiungono Armor Fisica o Magica in automatico.</small>
      </section>

      <section className="card">
        <h2>Categorie</h2>
        <div className="tabella">
          {CATEGORIE.map((k) => (
            <div key={k.id} className="cat-riga">
              <div>
                <strong>{k.nome}</strong> <span className="pt">{d.cat[k.id]}</span>
                {d.cat[k.id] !== d.catSegni[k.id] && <small className="muted"> (segni {d.catSegni[k.id]} + oggetti {d.cat[k.id] - d.catSegni[k.id]})</small>}
              </div>
              <small>{k.effetto}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Bonus ai dadi e danni</h2>
        <div className="griglia">
          <div className="stat"><span className="stat-n">Sociale</span><strong>+{d.dadiSociale}</strong></div>
          <div className="stat"><span className="stat-n">Attacco fisico</span><strong>+{d.dadiFisico}</strong><small>ai dadi</small></div>
          <div className="stat"><span className="stat-n">Attacco magico</span><strong>+{d.dadiMagico}</strong><small>ai dadi</small></div>
          <div className="stat"><span className="stat-n">Danni fisici</span><strong>+{d.dmgFisici}</strong><small>ogni Arma/Abilità</small></div>
          <div className="stat"><span className="stat-n">Danni magici</span><strong>+{d.dmgMagici}</strong><small>ogni Arma/Abilità</small></div>
          <div className="stat"><span className="stat-n">Critico</span><strong>{1 + d.critico}%</strong><small>in ogni tiro (parte da 1%)</small></div>
        </div>
      </section>

      <details className="card">
        <summary>Correzioni manuali e backup</summary>
        <p className="muted">Per effetti che le regole non calcolano da sole (es. Tonico, ricompense speciali).</p>
        <div className="griglia">
          {[['corpoMax', 'Corpo MAX'], ['menteMax', 'Mente MAX'], ['armor', 'Armor base'], ['fato', 'Fato'], ['sybil', 'Sybil'], ['cura', 'Cura']].map(([k, n]) => (
            <label key={k} className="campo">
              {n}
              <input type="number" value={c.extra[k] || 0} onChange={(e) => up((s) => ({ ...s, extra: { ...s.extra, [k]: Number(e.target.value) || 0 } }))} />
            </label>
          ))}
        </div>
        <div className="riga">
          <button onClick={() => esportaJSON(c)}>Esporta scheda (JSON)</button>
          <button onClick={() => fileRef.current?.click()}>Importa scheda</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importa} />
        </div>
      </details>

      {c.log.length > 0 && (
        <details className="card">
          <summary>Storico ({c.log.length})</summary>
          <ul className="log">
            {c.log.map((l, i) => (
              <li key={i}><small>{new Date(l.t).toLocaleString('it-IT')}</small> {l.testo}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
