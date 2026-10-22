import { verificaReq } from '../lib/rules.js'

const TIER_CLASS = { C: 't-c', B: 't-b', A: 't-a', S: 't-s', SS: 't-s', Zodiaco: 't-z', Speciale: 't-z', Chiave: 't-k' }

export default function ItemCard({ it, c, d, qta, children, compact }) {
  const reqOk = it.req ? verificaReq(it.req, c, d) : true
  return (
    <div className={`item ${TIER_CLASS[it.tier] || ''}`}>
      <div className="item-head">
        <strong>{it.nome}</strong>
        <span className="tag">{it.tier}</span>
        {qta > 1 && <span className="tag qta">×{qta}</span>}
        {it.consumabile && <span className="tag">consumabile</span>}
      </div>
      {it.cat === 'arma' && (
        <div className="item-meta">
          {it.danni != null && <span>{it.danni} Danni</span>}
          {it.tipo && <span>{it.tipo}</span>}
          {it.mani && <span>{it.mani === 2 ? 'Due mani' : 'Una mano'}</span>}
        </div>
      )}
      {it.reqTxt && (
        <div className={`req ${reqOk ? 'ok' : 'no'}`}>
          Requisiti: {it.reqTxt} {reqOk ? '✓' : '✗'}
        </div>
      )}
      {!compact && (it.abilita || it.desc) && <p className="item-desc">{it.abilita || it.desc}</p>}
      {children && <div className="item-act">{children}</div>}
    </div>
  )
}
