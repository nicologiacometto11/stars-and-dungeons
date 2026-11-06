import { useEffect } from 'react'

// Finestra sopra la pagina: si chiude con la ×, con un tocco fuori o con Esc
export default function Finestra({ titolo, onChiudi, children }) {
  useEffect(() => {
    const tasto = (e) => { if (e.key === 'Escape') onChiudi() }
    window.addEventListener('keydown', tasto)
    return () => window.removeEventListener('keydown', tasto)
  }, [onChiudi])
  return (
    <div className="fin-velo" onClick={(e) => { if (e.target === e.currentTarget) onChiudi() }}>
      <div className="fin" role="dialog" aria-modal="true" aria-label={titolo}>
        <button type="button" className="ghost fin-x" onClick={onChiudi} aria-label="Chiudi">×</button>
        {children}
      </div>
    </div>
  )
}
