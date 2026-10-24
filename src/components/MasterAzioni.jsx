import { useMemo, useState } from 'react'
import { ITEMS } from '../data/items.js'

const TIPI = [['danno', 'Danno'], ['cura', 'Cura'], ['aureos', 'Aureos'], ['sybil', 'Sybil'], ['puntiCura', 'Punti Cura'], ['xp', 'XP'], ['oggetto', 'Oggetto'], ['rango', 'Rango +1']]
const RISORSE = { aureos: 'Aureos', sybil: 'Sybil', puntiCura: 'punti Cura', xp: 'XP' }
const TIPO_DANNO = { fisico: 'fisici', magico: 'magici', puro: 'puri' }

// Azioni del Master verso un giocatore
export default function MasterAzioni({ g, tv }) {
  const [tipo, setTipo] = useState('danno')
  const [n, setN] = useState('')
  const [tipoDanno, setTipoDanno] = useState('fisico')
  const [ris, setRis] = useState('corpo')
  const [segno, setSegno] = useState('+')
  const [q, setQ] = useState('')
  const [oggetto, setOggetto] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const nome = g.nome || 'il giocatore'
  const num = Number(n) || 0

  const trovati = useMemo(() => {
    const t = q.trim().toLowerCase()
    return t ? ITEMS.filter((i) => i.nome.toLowerCase().includes(t)).slice(0, 8) : []
  }, [q])

  const valido = tipo === 'rango' || (tipo === 'oggetto' ? !!oggetto : num > 0)

  const invia = async () => {
    setBusy(true)
    setMsg('')
    try {
      if (tipo === 'danno') await tv.inviaAzione(g.user_id, 'danno', { tipo: tipoDanno, n: num }, `Master → ${nome}: ${num} danni ${TIPO_DANNO[tipoDanno]}`)
      if (tipo === 'cura') await tv.inviaAzione(g.user_id, 'cura', { riserva: ris, n: num }, `Master → ${nome}: cura ${num} ${ris === 'corpo' ? 'Corpo' : 'Mente'}`)
      if (RISORSE[tipo]) await tv.inviaAzione(g.user_id, tipo, { n: segno === '+' ? num : -num }, `Master → ${nome}: ${segno}${num} ${RISORSE[tipo]}`)
      if (tipo === 'oggetto') await tv.inviaAzione(g.user_id, 'oggetto', { id: oggetto, qta: Math.max(1, num || 1) }, `Master → ${nome}: ${ITEMS.find((i) => i.id === oggetto)?.nome}`)
      if (tipo === 'rango') await tv.inviaAzione(g.user_id, 'rango', {}, `Master → ${nome}: Rango +1`)
      setMsg('Inviato ✓')
      setN('')
      setOggetto('')
      setQ('')
    } catch (e) {
      console.error(e)
      setMsg('Non riesco a inviare. Riprova.')
    }
    setBusy(false)
  }

  return (
    <div className="master-azioni">
      <div className="filtri">
        {TIPI.map(([k, nm]) => <button key={k} className={tipo === k ? 'on' : ''} onClick={() => { setTipo(k); setMsg('') }}>{nm}</button>)}
      </div>

      {tipo === 'danno' && (
        <div className="riga">
          <input type="number" min="1" placeholder="Danni" value={n} onChange={(e) => setN(e.target.value)} />
          <select value={tipoDanno} onChange={(e) => setTipoDanno(e.target.value)}>
            <option value="fisico">Fisici</option>
            <option value="magico">Magici</option>
            <option value="puro">Puri</option>
          </select>
        </div>
      )}
      {tipo === 'cura' && (
        <div className="riga">
          <input type="number" min="1" placeholder="Punti" value={n} onChange={(e) => setN(e.target.value)} />
          <select value={ris} onChange={(e) => setRis(e.target.value)}>
            <option value="corpo">Corpo</option>
            <option value="mente">Mente</option>
          </select>
        </div>
      )}
      {RISORSE[tipo] && (
        <div className="riga">
          <select value={segno} onChange={(e) => setSegno(e.target.value)} style={{ width: 'auto' }}>
            <option value="+">Dai</option>
            <option value="-">Togli</option>
          </select>
          <input type="number" min="1" placeholder={RISORSE[tipo]} value={n} onChange={(e) => setN(e.target.value)} />
        </div>
      )}
      {tipo === 'oggetto' && (
        <>
          <input placeholder="Cerca oggetto, arma, abilità…" value={q} onChange={(e) => { setQ(e.target.value); setOggetto('') }} />
          {trovati.length > 0 && !oggetto && (
            <div className="filtri">
              {trovati.map((i) => <button key={i.id} onClick={() => { setOggetto(i.id); setQ(i.nome) }}>{i.nome}</button>)}
            </div>
          )}
          {oggetto && <input type="number" min="1" placeholder="Quantità (1)" value={n} onChange={(e) => setN(e.target.value)} />}
        </>
      )}
      {tipo === 'rango' && <small className="muted">Il giocatore sale di un Rango (max 12) e ha un punto in più da assegnare.</small>}

      <div className="riga">
        <button className="primary" disabled={busy || !valido} onClick={invia}>Invia a {nome}</button>
        {msg && <small className="muted">{msg}</small>}
      </div>
      {tipo === 'danno' && <small className="muted">Il giocatore vede il danno con l'Armor già sottratta e lo conferma.</small>}
      {RISORSE[tipo] && segno === '-' && <small className="muted">Togliere {RISORSE[tipo]} chiede la conferma del giocatore.</small>}
    </div>
  )
}
