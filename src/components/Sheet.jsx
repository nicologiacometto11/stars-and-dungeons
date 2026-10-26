import { useEffect, useRef, useState } from 'react'
import { CATEGORIE } from '../data/zodiac.js'
import { RANGO_MAX, XP_PER_RANGO, conArmor, saliRango, segniUsati, conLog, conMax, normalizza, serveBackup, togliRango } from '../lib/rules.js'
import { esportaJSON } from '../lib/store.js'
import Abilities from './Abilities.jsx'
import AssegnaPunto from './AssegnaPunto.jsx'
import DanniArmi from './DanniArmi.jsx'
import { ridimensiona } from '../lib/immagine.js'

// Il numero scorre dal vecchio al nuovo valore (senza animazioni se l'utente le ha ridotte)
function useScorrevole(valore) {
  const [mostrato, setMostrato] = useState(valore)
  const prec = useRef(valore)
  useEffect(() => {
    const da = prec.current
    prec.current = valore
    if (da === valore) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setMostrato(valore); return }
    const t0 = performance.now()
    let id
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / 1000)
      const verso = valore > da ? 1 : -1
      setMostrato(da + verso * Math.ceil(Math.abs(valore - da) * (1 - Math.pow(1 - k, 3)) - 1e-9))
      if (k < 1) id = requestAnimationFrame(passo)
    }
    id = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(id)
  }, [valore])
  return mostrato
}

// Riserva come sfera di liquido: Corpo rosso, Mente blu. Il liquido sale e scende con i punti.
function Riserva({ nome, valore, max, onChange, onRipristina, onMaxMeno, onMaxPiu }) {
  const pct = max > 0 ? Math.min(100, (valore / max) * 100) : 0
  const stato = max > 0 && valore <= 0 ? 'vuota' : pct <= 25 ? 'bassa' : ''
  const numero = useScorrevole(valore)
  // per un momento l'onda si agita quando il livello cambia
  const [agita, setAgita] = useState(false)
  const primo = useRef(true)
  useEffect(() => {
    if (primo.current) { primo.current = false; return }
    setAgita(true)
    const t = setTimeout(() => setAgita(false), 1100)
    return () => clearTimeout(t)
  }, [valore, max])
  return (
    <div className={`riserva orb-${nome.toLowerCase()}`}>
      <div className={`orb ${stato} ${agita ? 'agita' : ''}`} role="img" aria-label={`${nome}: ${valore} su ${max}`}>
        <div className="liquido" style={{ transform: `translateY(calc(${100 - pct}% + ${pct === 0 ? 18 : 0}px))` }} />
        <span className="orb-testo"><b>{numero}</b> / {max}</span>
      </div>
      <strong className="orb-nome">{nome}</strong>
      <div className="orb-btn">
        <button onClick={() => onChange(Math.max(0, valore - 5))}>−5</button>
        <button onClick={() => onChange(Math.max(0, valore - 1))}>−1</button>
        <button onClick={() => onChange(Math.min(max, valore + 1))}>+1</button>
        <button onClick={() => onChange(Math.min(max, valore + 5))}>+5</button>
      </div>
      <button className="ghost orb-ripristina" onClick={onRipristina}>Ripristina</button>
      <div className="riga riserva-max">
        <small className="muted">Massimo</small>
        <button onClick={onMaxMeno} disabled={max <= 0} aria-label={`Diminuisci il massimo di ${nome}`}>−</button>
        <button onClick={onMaxPiu} aria-label={`Aumenta il massimo di ${nome}`}>+</button>
      </div>
    </div>
  )
}

function Contatore({ nome, valore, max, onMeno, onPiu, nota, libero }) {
  return (
    <div className="stat">
      <span className="stat-n">{nome}</span>
      <div className="riga">
        <button onClick={onMeno} disabled={valore <= 0}>−</button>
        <strong>{valore}</strong>
        <button onClick={onPiu} disabled={!libero && valore >= max}>+</button>
      </div>
      <small>{nota || `max ${max}`}</small>
    </div>
  )
}

function ZonaPericolo({ nome, onElimina }) {
  const [aperta, setAperta] = useState(false)
  const [testo, setTesto] = useState('')
  const ok = testo.trim().toLowerCase() === (nome || '').trim().toLowerCase()
  if (!aperta) return <button className="pericolo" onClick={() => setAperta(true)}>Elimina personaggio…</button>
  return (
    <div className="pericolo-box">
      <p><b>Questa azione è definitiva</b>: la scheda, l'inventario e il bestiario di «{nome}» verranno cancellati e non si possono recuperare. Se vuoi un backup, esportala prima.</p>
      <label className="campo">
        Per confermare scrivi il nome del personaggio
        <input value={testo} onChange={(e) => setTesto(e.target.value)} placeholder={nome} spellCheck={false} autoCorrect="off" autoComplete="off" autoFocus />
      </label>
      <div className="riga">
        <button className="pericolo" disabled={!ok} onClick={onElimina}>Elimina per sempre</button>
        <button className="ghost" onClick={() => { setAperta(false); setTesto('') }}>Annulla</button>
      </div>
    </div>
  )
}

// Campo numerico che si può svuotare per scrivere un numero nuovo (lo 0 non resta bloccato)
function CampoAureos({ valore, onChange }) {
  const [testo, setTesto] = useState(String(valore))
  useEffect(() => { setTesto((t) => (Number(t) === valore && t !== '' ? t : String(valore))) }, [valore])
  return (
    <input
      type="number" inputMode="numeric" min="0" value={testo}
      onChange={(e) => {
        setTesto(e.target.value)
        if (e.target.value !== '') onChange(Math.max(0, Math.floor(Number(e.target.value)) || 0))
      }}
      onBlur={() => { if (testo === '') { setTesto('0'); onChange(0) } }}
    />
  )
}

// Ogni tanto ricorda di salvare una copia della scheda sul proprio dispositivo
function PromemoriaBackup({ c, up }) {
  const { serve, giorni, mai } = serveBackup(c)
  if (!serve) return null
  return (
    <section className="card promemoria">
      <strong>💾 Salva una copia della tua scheda</strong>
      <p className="muted">
        {mai ? 'Non hai ancora mai esportato la scheda.' : `L'ultima copia è di ${giorni} giorni fa.`} Una copia sul tuo telefono o computer ti protegge se un giorno il servizio dovesse avere problemi.
      </p>
      <div className="riga">
        <button className="primary" onClick={() => { esportaJSON(c); up((s) => ({ ...s, ultimoBackup: new Date().toISOString() })) }}>Esporta ora</button>
        <button className="ghost" onClick={() => up((s) => ({ ...s, backupRimandato: new Date(Date.now() + 7 * 864e5).toISOString() }))}>Tra una settimana</button>
      </div>
    </section>
  )
}

// Foto del personaggio: si sceglie dal telefono o dal computer e viene ridotta prima di salvarla
// Metallo della cornice: bronzo ai primi Ranghi, argento a metà, oro in cima
const metallo = (rango) => (rango >= 9 ? 'oro' : rango >= 5 ? 'argento' : 'bronzo')

function Avatar({ c, up }) {
  const ref = useRef(null)
  const carica = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const img = await ridimensiona(f)
      up((s) => ({ ...s, immagine: img }))
    } catch {
      alert('Non riesco a leggere questa immagine.')
    }
  }
  return (
    <div className="avatar-box">
      <button type="button" className="avatar" onClick={() => ref.current?.click()} aria-label="Cambia la foto del personaggio">
        {c.immagine ? <img src={c.immagine} alt="" /> : <span>📷</span>}
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={carica} />
      {c.immagine && <button type="button" className="ghost avatar-x" onClick={() => up((s) => ({ ...s, immagine: null }))} aria-label="Togli la foto">×</button>}
    </div>
  )
}

export default function Sheet({ c, d, up, onElimina, tv }) {
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
      <section className={`card carta ${metallo(c.rango)}`}>
        <span className="angolo a1" aria-hidden="true">✦</span>
        <span className="angolo a2" aria-hidden="true">✦</span>
        <span className="angolo a3" aria-hidden="true">✦</span>
        <span className="angolo a4" aria-hidden="true">✦</span>
        <div className="testa-top">
          <Avatar c={c} up={up} />
          <div className="nome-blocco">
            <input className="nome" spellCheck={false} autoCorrect="off" autoComplete="off" value={c.nome} onChange={(e) => up((s) => ({ ...s, nome: e.target.value }))} aria-label="Nome del personaggio" />
            <div className="pips" role="img" aria-label={`Rango ${c.rango} su ${RANGO_MAX}`}>
              {Array.from({ length: RANGO_MAX }, (_, i) => <i key={i} className={i < c.rango ? 'pip on' : 'pip'} />)}
            </div>
          </div>
        </div>

        <div className="testa-stat">
          <div className="rango">
            <small>RANGO</small>
            <div className="rango-num"><strong>{c.rango}</strong><span className="muted">/ {RANGO_MAX}</span></div>
          </div>
          <div className="xp-box">
            <small>ESPERIENZA</small>
            <div className="xp-num"><span className="tag qta">{c.xp || 0} XP</span><span className="muted">{XP_PER_RANGO} XP = 1 Rango</span></div>
            <div className="xp-barra" aria-hidden="true"><div style={{ width: `${Math.min(100, ((c.xp || 0) / XP_PER_RANGO) * 100)}%` }} /></div>
          </div>
        </div>

        <button
          className="primary sali-rango" disabled={c.rango >= RANGO_MAX || (c.xp || 0) < XP_PER_RANGO}
          onClick={() => up((s) => saliRango(s))}
        >
          {c.rango >= RANGO_MAX ? 'Rango massimo' : (c.xp || 0) >= XP_PER_RANGO ? `Sali di Rango · ${XP_PER_RANGO} XP` : `Sali di Rango · servono ${XP_PER_RANGO - (c.xp || 0)} XP in più`}
        </button>

        <p className={liberi > 0 ? 'avviso-int' : 'muted'}>
          {liberi > 0 ? `Hai ${liberi} punt${liberi === 1 ? 'o' : 'i'} da assegnare nello Zodiaco.` : 'Tutti i punti Rango sono assegnati.'}
        </p>
        <div className="riga spazio testa-nota">
          <small className="muted">Gli XP li dà il Master.</small>
          <button
            className="ghost rango-meno" disabled={c.rango <= 1 || liberi <= 0}
            title={liberi <= 0 ? 'Prima togli un punto dallo Zodiaco (modalità correzione)' : ''}
            onClick={() => confirm('Scendere di un Rango? Serve solo per correggere un errore.') && up((x) => togliRango(x))}
          >− Togli un Rango</button>
        </div>
        {d.ofiuco && <p className="ofiuco">☉ Hai trovato Ofiuco: tutte le tue caratteristiche sono raddoppiate.</p>}
      </section>

      <PromemoriaBackup c={c} up={up} />

      <AssegnaPunto c={c} up={up} />

      <section className="card">
        <h2>Riserve</h2>
        <div className="riserve-orb">
        <Riserva nome="Corpo" valore={corpo} max={d.corpoMax} onChange={(v) => up((s) => ({ ...s, corpo: v }))} onRipristina={() => up((s) => ({ ...s, corpo: null }))} onMaxMeno={() => up((s) => conMax(s, 'corpoMax', -1))} onMaxPiu={() => up((s) => conMax(s, 'corpoMax', 1))} />
        <Riserva nome="Mente" valore={mente} max={d.menteMax} onChange={(v) => up((s) => ({ ...s, mente: v }))} onRipristina={() => up((s) => ({ ...s, mente: null }))} onMaxMeno={() => up((s) => conMax(s, 'menteMax', -1))} onMaxPiu={() => up((s) => conMax(s, 'menteMax', 1))} />
        </div>
        <div className="griglia">
          <Contatore
            nome="Fato" valore={d.fatoAttuale} max={d.fato} libero nota={`base ${d.fato} · modificabile`}
            onMeno={() => up((s) => ({ ...s, usati: { ...s.usati, fato: s.usati.fato + 1 } }))}
            onPiu={() => up((s) => ({ ...s, usati: { ...s.usati, fato: s.usati.fato - 1 } }))}
          />
          <Contatore
            nome="Sybil" valore={d.sybilAttuale} max={d.sybil} libero nota={`base ${d.sybil} · modificabile`}
            onMeno={() => up((s) => ({ ...s, usati: { ...s.usati, sybil: s.usati.sybil + 1 } }))}
            onPiu={() => up((s) => ({ ...s, usati: { ...s.usati, sybil: s.usati.sybil - 1 } }))}
          />
          <Contatore
            nome="Cura" valore={d.curaAttuale} max={d.cura} libero nota={`base ${d.cura} · modificabile`}
            onMeno={() => up((s) => ({ ...s, usati: { ...s.usati, cura: (s.usati.cura || 0) + 1 } }))}
            onPiu={() => up((s) => ({ ...s, usati: { ...s.usati, cura: (s.usati.cura || 0) - 1 } }))}
          />
          <div className="stat">
            <span className="stat-n">Aureos</span>
            <CampoAureos valore={c.aureos} onChange={(n) => up((s) => ({ ...s, aureos: n }))} />
            <small>moneta di gioco</small>
          </div>
        </div>
      </section>

      <Abilities c={c} d={d} up={up} tv={tv} />

      <DanniArmi c={c} d={d} />

      <section className="card">
        <h2>Armor</h2>
        <div className="griglia">
          {[['armorFisica', 'Fisica', d.armorFisica], ['armorMagica', 'Magica', d.armorMagica]].map(([k, nome, v]) => (
            <div className="stat" key={k}>
              <span className="stat-n">{nome}</span>
              <div className="riga">
                <button onClick={() => up((x) => conArmor(x, k, -1))} disabled={v <= 0} aria-label={`Meno Armor ${nome}`}>−</button>
                <strong>{v}</strong>
                <button onClick={() => up((x) => conArmor(x, k, 1))} aria-label={`Più Armor ${nome}`}>+</button>
              </div>
            </div>
          ))}
        </div>
        <label className="campo">
          Armor di base da assegnare alla parte Fisica ({d.armorSplitEff} di {d.armorBase})
          <input type="range" min="0" max={d.armorBase} value={d.armorSplitEff} onChange={(e) => up((s) => ({ ...s, armorSplit: Number(e.target.value) }))} />
        </label>
        <small className="muted">Puoi cambiare a mano l'Armor Fisica e quella Magica con − e +; gli oggetti equipaggiati aggiungono la loro in automatico.</small>
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
          <div className="stat"><span className="stat-n">Difesa fisica</span><strong>+{d.dadiDifFisica}</strong><small>ai dadi</small></div>
          <div className="stat"><span className="stat-n">Difesa magica</span><strong>+{d.dadiDifMagica}</strong><small>ai dadi</small></div>
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
          <button onClick={() => { esportaJSON(c); up((s) => ({ ...s, ultimoBackup: new Date().toISOString() })) }}>Esporta scheda (JSON)</button>
          <button onClick={() => fileRef.current?.click()}>Importa scheda</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importa} />
        </div>
        <hr className="sep-h" />
        <ZonaPericolo nome={c.nome} onElimina={onElimina} />
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
