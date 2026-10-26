import { useEffect, useRef } from 'react'

// Cielo stellato di sfondo: poche stelle che scivolano lentissime e brillano piano. Si ferma quando l'app non è visibile.
export default function CieloStellato() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const ridotto = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, stelle = [], id = 0, ultimo = 0
    const prepara = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth; h = window.innerHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.max(35, Math.min(90, Math.round((w * h) / 14000)))
      stelle = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.4 + Math.random() * 1.1, v: 1.2 + Math.random() * 3.2, // pixel al secondo
        fase: Math.random() * 6.28, vel: 0.4 + Math.random() * 1.1,
        caldo: Math.random() < 0.22,
      }))
    }
    const disegna = (t) => {
      ctx.clearRect(0, 0, w, h)
      for (const s of stelle) {
        const luce = ridotto ? 0.6 : 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t / 1000 * s.vel + s.fase))
        ctx.globalAlpha = luce
        ctx.fillStyle = s.caldo ? '#ffe3a1' : '#dfe6ff'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, 6.2832)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    const passo = (t) => {
      id = requestAnimationFrame(passo)
      if (t - ultimo < 40) return // circa 25 fotogrammi al secondo bastano
      const dt = Math.min(0.1, (t - ultimo) / 1000)
      ultimo = t
      for (const s of stelle) {
        s.y += s.v * dt
        s.x -= s.v * 0.35 * dt
        if (s.y > h + 4) { s.y = -4; s.x = Math.random() * w }
        if (s.x < -4) s.x = w + 4
      }
      disegna(t)
    }
    const visibilita = () => {
      cancelAnimationFrame(id)
      if (!ridotto && document.visibilityState === 'visible') id = requestAnimationFrame(passo)
    }
    prepara()
    disegna(0)
    if (!ridotto) visibilita()
    window.addEventListener('resize', prepara)
    document.addEventListener('visibilitychange', visibilita)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', prepara)
      document.removeEventListener('visibilitychange', visibilita)
    }
  }, [])
  return <canvas ref={ref} className="cielo-sfondo" aria-hidden="true" />
}
