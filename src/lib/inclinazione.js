// Riflesso delle carte: segue l'inclinazione del telefono (o il mouse sul computer).
// Scrive --tx e --ty (da -1 a 1) sulla radice; parte una volta sola.
let avviato = false
let permessoChiesto = false

const imposta = (x, y) => {
  const r = document.documentElement.style
  r.setProperty('--tx', Math.max(-1, Math.min(1, x)).toFixed(3))
  r.setProperty('--ty', Math.max(-1, Math.min(1, y)).toFixed(3))
}

export function avviaInclinazione() {
  if (avviato || typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  avviato = true
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null) return
    imposta(e.gamma / 30, (e.beta - 45) / 30)
  })
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return
    imposta((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
  })
}

// Su iPhone il sensore si attiva solo dopo un tocco e un permesso dell'utente
export async function chiediSensori() {
  const DOE = typeof DeviceOrientationEvent !== 'undefined' ? DeviceOrientationEvent : null
  if (permessoChiesto || !DOE || typeof DOE.requestPermission !== 'function') return
  permessoChiesto = true
  try { await DOE.requestPermission() } catch { /* se rifiuta, restano le carte senza riflesso */ }
}
