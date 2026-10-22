import { useEffect, useState } from 'react'

const CHIAVE = 'stars-and-dungeons:banner-install'
const PAUSA_GIORNI = 14

const eInstallata = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
const eTelefono = () => window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(max-width: 820px)').matches
const eIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

function rimandato() {
  try {
    const t = Number(localStorage.getItem(CHIAVE))
    return t && Date.now() - t < PAUSA_GIORNI * 864e5
  } catch {
    return false
  }
}

// Solo su telefono e solo se l'app non è già installata.
export default function InstallBanner() {
  const [visibile, setVisibile] = useState(false)
  const [evento, setEvento] = useState(null)

  useEffect(() => {
    if (eInstallata() || !eTelefono() || rimandato()) return
    setVisibile(true)
    const prima = (e) => {
      e.preventDefault()
      setEvento(e)
    }
    const fatta = () => setVisibile(false)
    window.addEventListener('beforeinstallprompt', prima)
    window.addEventListener('appinstalled', fatta)
    return () => {
      window.removeEventListener('beforeinstallprompt', prima)
      window.removeEventListener('appinstalled', fatta)
    }
  }, [])

  if (!visibile) return null

  const chiudi = () => {
    try { localStorage.setItem(CHIAVE, String(Date.now())) } catch { /* ignora */ }
    setVisibile(false)
  }
  const installa = async () => {
    evento.prompt()
    await evento.userChoice
    setEvento(null)
    chiudi()
  }

  return (
    <div className="banner-install" role="note">
      <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" width="40" height="40" />
      <div className="banner-testo">
        <strong>Usala come app</strong>
        {evento ? (
          <small>Aprila dalla schermata Home, a schermo intero e anche con poca connessione.</small>
        ) : eIOS() ? (
          <small>Premi il tasto Condividi <b>⎋</b> e poi <b>Aggiungi a Home</b>.</small>
        ) : (
          <small>Dal menu del browser (⋮) scegli <b>Installa app</b> o <b>Aggiungi a schermata Home</b>.</small>
        )}
      </div>
      <div className="banner-azioni">
        {evento && <button className="primary" onClick={installa}>Installa</button>}
        <button className="ghost" onClick={chiudi}>Non ora</button>
      </div>
    </div>
  )
}
