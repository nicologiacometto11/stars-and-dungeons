import { useState } from 'react'
import { ITEMS_BY_ID } from '../data/items.js'
import { SEGNI } from '../data/zodiac.js'
import { conLog, conRimozione, conXp, controllaEquip, riceviOggetto, scovaMateriale, verificaReq } from '../lib/rules.js'
import ItemCard from './ItemCard.jsx'
import Sagoma from './Sagoma.jsx'

const SEZIONI = [
  ['arma', 'Armi'],
  ['oggetto', 'Oggetti'],
  ['materiale', 'Materiali di Craft'],
  ['chiave', 'Oggetti chiave'],
  ['abilita', 'Abilità uniche'],
]

export default function Inventory({ c, d, up }) {
  const [scegliSegno, setScegliSegno] = useState(false)

  const righe = c.inventario.map((r) => ({ ...r, it: ITEMS_BY_ID[r.id] })).filter((r) => r.it)

  const equipaggia = (r) => {
    if (!r.eq && r.it.req && !verificaReq(r.it.req, c, d)) {
      alert(`Non soddisfi i requisiti di ${r.it.nome}: ${r.it.reqTxt}`)
      return false
    }
    if (!r.eq) {
      const ctl = controllaEquip(c, r.it)
      if (!ctl.ok) {
        if (!ctl.forzabile) { alert(ctl.motivo); return false }
        if (!confirm(`${ctl.motivo}\n\nEquipaggiare comunque? Fallo solo se una tua abilità speciale lo permette.`)) return false
      }
    }
    up((s) => ({ ...s, inventario: s.inventario.map((x) => (x.id === r.id ? { ...x, eq: !x.eq } : x)) }))
    return true
  }

  const usa = (r) => {
    if (r.it.uso === 'cinque-essenze') return setScegliSegno(true)
    if (r.it.xp) {
      up((s) => conLog(conXp(conRimozione(s, r.id), r.it.xp), `Usato ${r.it.nome}: +${r.it.xp} XP`))
      return alert(`${r.it.nome}: +${r.it.xp} XP`)
    }
    if (r.it.uso === 'scovare') {
      const trovato = scovaMateriale()
      up((s) => conLog(riceviOggetto(conRimozione(s, r.id), trovato), `Pergamena: Scovare → ${trovato.nome}`))
      return alert(`Hai scovato: ${trovato.nome} (grado ${trovato.tier})`)
    }
    if (r.it.uso === 'apri-pergamena') return up((s) => riceviOggetto(conRimozione(s, r.id), r.it))
    if (r.it.uso === 'reset-segni') {
      if (!confirm('Resettare TUTTI i punti nei segni dello Zodiaco? Il Rango resta invariato e l\'anello si distrugge.')) return
      return up((s) =>
        conLog(
          conRimozione({ ...s, segni: Object.fromEntries(SEGNI.map((x) => [x.id, 0])) }, r.id),
          'Usato Anello della Stella Cadente: punti dello Zodiaco azzerati',
        ),
      )
    }
    up((s) => conLog(conRimozione(s, r.id), `Usato ${r.it.nome}`))
    alert(`${r.it.nome}: ${r.it.desc}\n\nApplica l'effetto a mano sulla scheda (Correzioni manuali) o con il Master.`)
  }

  const cinqueEssenze = (segnoId) => {
    up((s) =>
      conLog(
        conRimozione({ ...s, bonusSegni: { ...s.bonusSegni, [segnoId]: (s.bonusSegni?.[segnoId] || 0) + 2 } }, 'cinque-essenze'),
        `Cinque Essenze: +2 a ${SEGNI.find((x) => x.id === segnoId).nome}`,
      ),
    )
    setScegliSegno(false)
  }

  const scarta = (r) => {
    if (confirm(`Scartare 1 × ${r.it.nome}?`)) up((s) => conLog(conRimozione(s, r.id), `Scartato ${r.it.nome}`))
  }

  if (righe.length === 0) return <p className="muted centrato card">Inventario vuoto. Compra qualcosa nel Negozio o ricevi un oggetto dal Master.</p>

  return (
    <div className="stack">
      {scegliSegno && (
        <section className="card">
          <h2>Cinque Essenze: a quale costellazione dai +2?</h2>
          <div className="filtri">
            {SEGNI.map((s) => (
              <button key={s.id} onClick={() => cinqueEssenze(s.id)}>{s.nome}</button>
            ))}
          </div>
          <button className="ghost" onClick={() => setScegliSegno(false)}>Annulla</button>
        </section>
      )}

      <Sagoma c={c} d={d} onToggle={equipaggia} />

      {SEZIONI.map(([cat, titolo]) => {
        const lista = righe.filter((r) => r.it.cat === cat)
        if (!lista.length) return null
        return (
          <section key={cat} className="stack">
            <h2 className="titolo-sez">{titolo}</h2>
            {lista.map((r) => (
              <ItemCard key={r.id} it={r.it} c={c} d={d} qta={r.qta}>
                {(cat === 'arma' || cat === 'oggetto') && !r.it.consumabile && (
                  <button className={r.eq ? 'on' : ''} onClick={() => equipaggia(r)}>
                    {r.eq ? '✓ Equipaggiato' : 'Equipaggia'}
                  </button>
                )}
                {r.it.consumabile && <button className="primary" onClick={() => usa(r)}>Usa</button>}
                <button className="ghost" onClick={() => scarta(r)}>Scarta</button>
              </ItemCard>
            ))}
          </section>
        )
      })}
    </div>
  )
}
