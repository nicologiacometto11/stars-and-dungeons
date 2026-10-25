import { MOSTRI_BY_ID } from '../data/monsters.js'

const img = (id) => `${import.meta.env.BASE_URL}images/monsters/${id}.webp`

// Vista del giocatore: i mostri in campo, solo foto e quanti sono (il nome solo se l'ha già incontrato nel Bestiario)
export default function MostriInCampo({ mostri, c, studi }) {
  const lista = (mostri || []).filter((m) => m.qta > 0 && MOSTRI_BY_ID[m.id])
  if (!lista.length) return null
  return (
    <div className="mostri-campo">
      {lista.map((m) => {
        const mo = MOSTRI_BY_ID[m.id]
        const noto = !!c?.bestiario?.scoperti?.[m.id] || !!studi?.incontrati?.has(m.id)
        return (
          <figure key={m.id} className="mostro-campo">
            <img src={img(m.id)} alt={noto ? mo.nome : 'Mostro sconosciuto'} loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
            <figcaption><strong>{m.qta}×</strong>{noto && <span> {mo.nome}</span>}</figcaption>
          </figure>
        )
      })}
    </div>
  )
}
