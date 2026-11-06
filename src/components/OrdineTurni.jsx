import { useRef, useState } from 'react'

// Ordine dei turni: si tiene premuta la maniglia e si trascina il giocatore su o giù, come la coda di Spotify.
// Da tastiera la maniglia risponde alle frecce.
export default function OrdineTurni({ ordine, turno, onSposta }) {
  const lista = useRef(null)
  const [drag, setDrag] = useState(null) // { da, a, dy, y0, altezza, centri }

  const inizia = (e, i) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const righe = [...lista.current.children].map((el) => el.getBoundingClientRect())
    setDrag({
      da: i, a: i, dy: 0, y0: e.clientY,
      altezza: righe.length > 1 ? righe[1].top - righe[0].top : 0,
      centri: righe.map((r) => r.top + r.height / 2),
    })
  }
  const muovi = (e) => {
    if (!drag) return
    const dy = e.clientY - drag.y0
    const centro = drag.centri[drag.da] + dy
    // la riga prende il posto di quella a cui il suo centro è più vicino
    const a = drag.centri.reduce((m, c, i) => (Math.abs(c - centro) < Math.abs(drag.centri[m] - centro) ? i : m), 0)
    setDrag({ ...drag, dy, a })
  }
  const fine = () => {
    if (drag && drag.a !== drag.da) onSposta(drag.da, drag.a)
    setDrag(null)
  }
  const spostamento = (i) => {
    if (!drag) return undefined
    if (i === drag.da) return `translateY(${drag.dy}px)`
    if (i > drag.da && i <= drag.a) return `translateY(${-drag.altezza}px)`
    if (i < drag.da && i >= drag.a) return `translateY(${drag.altezza}px)`
    return undefined
  }
  const frecce = (e, i) => {
    const j = e.key === 'ArrowUp' ? i - 1 : e.key === 'ArrowDown' ? i + 1 : -1
    if (j < 0 || j >= ordine.length) return
    e.preventDefault()
    onSposta(i, j)
  }

  return (
    <ol className={`ordine ordine-master${drag ? ' in-trascinamento' : ''}`} ref={lista}>
      {ordine.map((o, i) => (
        <li
          key={o.tipo + o.id}
          className={`${i === turno ? 'on' : ''}${drag?.da === i ? ' presa' : ''}`}
          style={{ transform: spostamento(i) }}
        >
          <span>{o.nome}</span>
          <button
            type="button" className="ghost maniglia" aria-label={`Sposta ${o.nome}: tieni premuto e trascina, o usa le frecce`}
            onPointerDown={(e) => inizia(e, i)} onPointerMove={muovi} onPointerUp={fine} onPointerCancel={() => setDrag(null)}
            onKeyDown={(e) => frecce(e, i)}
          >
            <i /><i /><i />
          </button>
        </li>
      ))}
    </ol>
  )
}
