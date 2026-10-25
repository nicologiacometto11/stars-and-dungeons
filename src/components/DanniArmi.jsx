import { ITEMS_BY_ID } from '../data/items.js'
import { dannoArma, testoDanno } from '../lib/rules.js'

// Quanti danni fanno le armi equipaggiate, con i bonus della scheda (es. 10 +3 fisici +2 magici = 15)
export default function DanniArmi({ c, d, titolo = 'Danni delle armi equipaggiate' }) {
  const armi = c.inventario
    .filter((r) => r.eq)
    .map((r) => ITEMS_BY_ID[r.id])
    .filter((it) => it?.cat === 'arma')
    .map((it) => ({ it, g: dannoArma(it, d) }))
    .filter((x) => x.g)
  if (!armi.length) return null
  return (
    <section className="card danni-armi">
      <h2>{titolo}</h2>
      <ul className="inv-master">
        {armi.map(({ it, g }) => (
          <li key={it.id}>
            <span>{it.nome} <small className="muted">{it.tipo}</small></span>
            <strong className="oro">{testoDanno(g)}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}
