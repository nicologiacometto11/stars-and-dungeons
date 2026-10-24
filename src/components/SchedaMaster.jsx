import { useCallback, useEffect, useState } from 'react'
import { CATEGORIE, SEGNI } from '../data/zodiac.js'
import { ITEMS_BY_ID } from '../data/items.js'
import { abilitaScheda, derive, segniUsati } from '../lib/rules.js'
import { caricaScheda } from '../lib/store.js'

// Scheda di un giocatore in sola lettura, per il Master
export default function SchedaMaster({ userId }) {
  const [c, setC] = useState(undefined)
  const [errore, setErrore] = useState(false)

  const carica = useCallback(() => {
    setErrore(false)
    caricaScheda(userId).then(setC).catch((e) => { console.error(e); setErrore(true) })
  }, [userId])
  useEffect(() => { carica() }, [carica])

  if (errore) return <p className="muted">Non riesco a leggere la scheda. <button className="ghost" onClick={carica}>Riprova</button></p>
  if (c === undefined) return <p className="muted">Carico la scheda…</p>
  if (c === null) return <p className="muted">Questo giocatore non ha ancora una scheda.</p>
  return <SchedaLettura c={c} onAggiorna={carica} />
}

export function SchedaLettura({ c, onAggiorna }) {
  const d = derive(c)
  const corpo = Math.min(c.corpo ?? d.corpoMax, d.corpoMax)
  const mente = Math.min(c.mente ?? d.menteMax, d.menteMax)
  const segni = SEGNI.filter((s) => (c.segni[s.id] || 0) + (c.bonusSegni?.[s.id] || 0) > 0)
  const inv = c.inventario.map((r) => ({ ...r, it: ITEMS_BY_ID[r.id] })).filter((r) => r.it)
  const abilita = abilitaScheda(c)

  return (
    <div className="scheda-master">
      {c.immagine && <img className="avatar-grande" src={c.immagine} alt={c.nome} />}
      <div className="riga spazio">
        <strong>Rango {c.rango}{d.ofiuco && ' · ☉ Ofiuco'}</strong>
        <span className="oro">{c.aureos} Aureos</span>
        <button className="ghost" onClick={onAggiorna}>Aggiorna</button>
      </div>

      <div className="griglia">
        <div className="stat"><span className="stat-n">Corpo</span><strong>{corpo} / {d.corpoMax}</strong></div>
        <div className="stat"><span className="stat-n">Mente</span><strong>{mente} / {d.menteMax}</strong></div>
        <div className="stat"><span className="stat-n">Armor</span><strong>F {d.armorFisica} · M {d.armorMagica}</strong></div>
        <div className="stat"><span className="stat-n">Fato</span><strong>{d.fatoAttuale} / {d.fato}</strong></div>
        <div className="stat"><span className="stat-n">Sybil</span><strong>{d.sybilAttuale} / {d.sybil}</strong></div>
        <div className="stat"><span className="stat-n">Cura</span><strong>{d.curaAttuale} / {d.cura}</strong></div>
        <div className="stat"><span className="stat-n">Critico</span><strong>{1 + d.critico}%</strong></div>
        <div className="stat"><span className="stat-n">Dadi Soc · Fis · Mag</span><strong>+{d.dadiSociale} · +{d.dadiFisico} · +{d.dadiMagico}</strong></div>
        <div className="stat"><span className="stat-n">Difesa Fis · Mag</span><strong>+{d.dadiDifFisica} · +{d.dadiDifMagica}</strong></div>
        <div className="stat"><span className="stat-n">Danni Fis · Mag</span><strong>+{d.dmgFisici} · +{d.dmgMagici}</strong></div>
      </div>

      <h3 className="sotto">Categorie</h3>
      <div className="riga">{CATEGORIE.map((k) => <span key={k.id} className="tag">{k.nome} {d.cat[k.id]}</span>)}</div>

      <h3 className="sotto">Zodiaco ({segniUsati(c)} punti)</h3>
      <div className="riga">
        {segni.length ? segni.map((s) => <span key={s.id} className="tag">{s.nome} {(c.segni[s.id] || 0) + (c.bonusSegni?.[s.id] || 0)}</span>) : <small className="muted">Nessun punto assegnato.</small>}
      </div>

      <h3 className="sotto">Inventario</h3>
      {inv.length ? (
        <ul className="inv-master">
          {inv.map((r) => (
            <li key={r.id}>
              <span>{r.it.nome}{r.qta > 1 && ` ×${r.qta}`}</span>
              {r.eq && <span className="tag qta">equipaggiato</span>}
            </li>
          ))}
        </ul>
      ) : <small className="muted">Vuoto.</small>}

      <h3 className="sotto">Abilità</h3>
      {abilita.length ? (
        <ul className="inv-master">
          {abilita.map((a) => <li key={a.key}><span>{a.nome}</span><span className="tag">{a.fonte}</span></li>)}
        </ul>
      ) : <small className="muted">Nessuna.</small>}
    </div>
  )
}
