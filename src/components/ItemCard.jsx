import { useEffect, useRef, useState } from 'react'
import { avviaInclinazione, chiediSensori } from '../lib/inclinazione.js'
import { dannoArma, testoDanno, verificaReq } from '../lib/rules.js'
import { SLOT_NOME } from '../data/items.js'
import IMMAGINI from '../data/immagini-oggetti.json' // elenco degli id che hanno un'immagine in public/images/oggetti/

const TIER_CLASS = { C: 't-c', B: 't-b', A: 't-a', S: 't-s', SS: 't-s', Zodiaco: 't-z', Speciale: 't-z', Chiave: 't-k' }

export default function ItemCard({ it, c, d, qta, children, compact, noto = true, puoiStudiare, onStudia }) {
  const reqOk = it.req ? verificaReq(it.req, c, d) : true
  const [zoom, setZoom] = useState(false)
  const [gira, setGira] = useState(false)
  const eraNoto = useRef(noto)
  useEffect(() => { avviaInclinazione() }, [])
  useEffect(() => {
    // la carta si gira quando passa da misteriosa a rivelata
    if (noto && !eraNoto.current) {
      setGira(true)
      const t = setTimeout(() => setGira(false), 1400)
      eraNoto.current = noto
      return () => clearTimeout(t)
    }
    eraNoto.current = noto
  }, [noto])
  return (
    <div className={`item carta-ogg ${TIER_CLASS[it.tier] || ''}${noto ? '' : ' misteriosa'}${gira ? ' gira' : ''}`} onPointerDown={chiediSensori}>
      {IMMAGINI.includes(it.id) && (
        <button type="button" className="item-img" onClick={() => setZoom(true)} aria-label={`Ingrandisci l'immagine di ${it.nome}`}>
          <img src={`${import.meta.env.BASE_URL}images/oggetti/${it.id}.webp`} alt="" loading="lazy" />
        </button>
      )}
      {zoom && (
        <div className="lightbox" onClick={() => setZoom(false)}>
          <img src={`${import.meta.env.BASE_URL}images/oggetti/${it.id}.webp`} alt={it.nome} />
          <span>{it.nome}</span>
        </div>
      )}
      <div className="item-head">
        <strong>{it.nome}</strong>
        <span className="tag">{it.tier}</span>
        {qta > 1 && <span className="tag qta">×{qta}</span>}
        {it.slot && <span className="tag">{SLOT_NOME[it.slot]}</span>}
        {it.consumabile && <span className="tag">consumabile</span>}
      </div>
      {it.cat === 'arma' && (
        <div className="item-meta">
          {it.danni != null && <div className="item-danno">{d && dannoArma(it, d) ? testoDanno(dannoArma(it, d)) : `${it.danni} Danni`}</div>}
          <div className="item-etichette">
            {it.tipo && it.tipo !== '—' && <span className="etichetta">{it.tipo}</span>}
            {it.mani && <span className="etichetta">{it.mani === 2 ? 'Due mani' : 'Una mano'}</span>}
          </div>
        </div>
      )}
      {it.reqTxt && (
        <div className={`req ${reqOk ? 'ok' : 'no'}`}>
          Requisiti: {it.reqTxt} {reqOk ? '✓' : '✗'}
        </div>
      )}
      {!compact && (it.abilita || it.desc) && (noto ? (
        <p className="item-desc">{it.abilita || it.desc}</p>
      ) : (
        <div className="item-lock dorso">
          <span className="dorso-segno" aria-hidden="true">✦</span>
          <small className="muted">Cosa fa e che effetti ha: sconosciuto finché non lo studi o lo compri.</small>
          <button disabled={!puoiStudiare} onClick={onStudia}>{puoiStudiare ? 'Studia · 1 Sybil' : 'Servono 1 Sybil'}</button>
        </div>
      ))}
      {children && <div className="item-act">{children}</div>}
    </div>
  )
}
