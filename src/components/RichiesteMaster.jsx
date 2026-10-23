import { useEffect, useRef, useState } from 'react'
import { ITEMS_BY_ID } from '../data/items.js'
import { RANGO_MAX, applicaBottino, bottinoDi, conCura, conDanno, conLog, conPuntiCura, conSybil, dannoNetto, riceviOggetto, riservaDanno } from '../lib/rules.js'

// I danni e gli Aureos tolti chiedono conferma; i doni si applicano da soli
const RISORSE = ['aureos', 'sybil', 'puntiCura']
export const chiedeConferma = (a) => a.tipo === 'danno' || (RISORSE.includes(a.tipo) && a.dati.n < 0)

const TIPO_DANNO = { fisico: 'fisici', magico: 'magici', puro: 'puri' }
const NOME_RIS = { corpo: 'Corpo', mente: 'Mente' }

// Applica alla scheda le azioni che non richiedono conferma. Ritorna il testo per il giocatore.
function applicaDono(a, c, d, up) {
  const { tipo, dati } = a
  if (tipo === 'aureos') {
    up((s) => conLog({ ...s, aureos: Math.max(0, s.aureos + dati.n) }, `Master: ${dati.n >= 0 ? '+' : ''}${dati.n} Aureos`))
    return `${dati.n >= 0 ? 'Ricevi' : 'Perdi'} ${Math.abs(dati.n)} Aureos`
  }
  if (tipo === 'sybil') {
    up((s) => conLog(conSybil(s, dati.n), `Master: ${dati.n >= 0 ? '+' : ''}${dati.n} Sybil`))
    return `${dati.n >= 0 ? 'Ricevi' : 'Perdi'} ${Math.abs(dati.n)} Sybil`
  }
  if (tipo === 'puntiCura') {
    up((s) => conLog(conPuntiCura(s, dati.n), `Master: ${dati.n >= 0 ? '+' : ''}${dati.n} punti Cura`))
    return `${dati.n >= 0 ? 'Ricevi' : 'Perdi'} ${Math.abs(dati.n)} punti Cura`
  }
  if (tipo === 'oggetto') {
    const it = ITEMS_BY_ID[dati.id]
    if (!it) return null
    up((s) => riceviOggetto(s, it, dati.qta || 1))
    return `Ricevi ${dati.qta > 1 ? dati.qta + '× ' : ''}${it.nome}`
  }
  if (tipo === 'rango') {
    up((s) => (s.rango >= RANGO_MAX ? s : conLog({ ...s, rango: s.rango + 1 }, `Master: Rango ${s.rango + 1}`)))
    return 'Sali di Rango!'
  }
  if (tipo === 'cura') {
    up((s) => conLog(conCura(s, d, dati.riserva, dati.n), `Master: cura ${dati.n} ${NOME_RIS[dati.riserva]}`))
    return `Ti curi di ${dati.n} ${NOME_RIS[dati.riserva]}`
  }
  if (tipo === 'bottino') {
    const m = bottinoDi(dati.mostro)
    if (!m) return null
    up((s) => applicaBottino(s, m))
    return `Bottino di ${m.nome}`
  }
  return null
}

function Danno({ a, c, d, tv, up }) {
  const { tipo, n } = a.dati
  const netto = dannoNetto(d, tipo, n)
  const [finale, setFinale] = useState(netto)
  const [ris, setRis] = useState(riservaDanno(tipo))
  const armor = tipo === 'fisico' ? d.armorFisica : tipo === 'magico' ? d.armorMagica : 0
  const [busy, setBusy] = useState(false)

  const applica = async () => {
    setBusy(true)
    if (await tv.rispondiAzione(a.id, 'applicata')) {
      up((s) => conLog(conDanno(s, d, ris, finale), `Danno dal Master: −${finale} ${NOME_RIS[ris]}`))
      tv.registraEvento(`${c.nome} subisce ${finale} ${NOME_RIS[ris]} (${n} danni ${TIPO_DANNO[tipo]}${armor ? `, Armor ${armor}` : ''})`)
    }
    setBusy(false)
  }
  const rifiuta = async () => {
    setBusy(true)
    if (await tv.rispondiAzione(a.id, 'rifiutata')) tv.registraEvento(`${c.nome} non ha applicato ${n} danni ${TIPO_DANNO[tipo]}`)
    setBusy(false)
  }

  return (
    <div className="richiesta danno">
      <strong>⚔️ Il Master ti infligge {n} danni {TIPO_DANNO[tipo]}</strong>
      {tipo !== 'puro' ? (
        <small className="muted">Armor {tipo === 'fisico' ? 'fisica' : 'magica'} {armor}: subisci {netto}</small>
      ) : (
        <small className="muted">I danni puri ignorano l'Armor: scegli dove toglierli.</small>
      )}
      <div className="riga">
        <label className="campo" style={{ margin: 0 }}>
          Danno finale
          <input type="number" min="0" value={finale} onChange={(e) => setFinale(Math.max(0, Number(e.target.value) || 0))} />
        </label>
        <label className="campo" style={{ margin: 0 }}>
          Da togliere a
          <select value={ris} onChange={(e) => setRis(e.target.value)}>
            <option value="corpo">Corpo</option>
            <option value="mente">Mente</option>
          </select>
        </label>
      </div>
      <div className="riga">
        <button className="primary" disabled={busy} onClick={applica}>Applica −{finale} {NOME_RIS[ris]}</button>
        <button className="ghost" disabled={busy} onClick={rifiuta}>Non applicare</button>
      </div>
    </div>
  )
}

// Aureos, Sybil o punti Cura che il Master toglie: serve la conferma del giocatore
const RISORSA = {
  aureos: { nome: 'Aureos', icona: '💰', ha: (c) => c.aureos },
  sybil: { nome: 'Sybil', icona: '🔮', ha: (c, d) => d.sybilAttuale },
  puntiCura: { nome: 'punti Cura', icona: '💚', ha: (c, d) => d.curaAttuale },
}

function Perdita({ a, c, d, tv, up }) {
  const n = -a.dati.n
  const ris = RISORSA[a.tipo]
  const ha = ris.ha(c, d)
  const tolti = Math.min(n, ha)
  const [busy, setBusy] = useState(false)
  const applica = async () => {
    setBusy(true)
    if (await tv.rispondiAzione(a.id, 'applicata')) {
      if (a.tipo === 'aureos') up((s) => conLog({ ...s, aureos: Math.max(0, s.aureos - n) }, `Master: −${tolti} Aureos`))
      if (a.tipo === 'sybil') up((s) => conLog(conSybil(s, -n), `Master: −${tolti} Sybil`))
      if (a.tipo === 'puntiCura') up((s) => conLog(conPuntiCura(s, -n), `Master: −${tolti} punti Cura`))
      tv.registraEvento(`${c.nome} perde ${tolti} ${ris.nome}`)
    }
    setBusy(false)
  }
  const rifiuta = async () => {
    setBusy(true)
    if (await tv.rispondiAzione(a.id, 'rifiutata')) tv.registraEvento(`${c.nome} non ha dato ${n} ${ris.nome}`)
    setBusy(false)
  }
  return (
    <div className="richiesta danno">
      <strong>{ris.icona} Il Master ti toglie {n} {ris.nome}</strong>
      <small className="muted">Ne hai {ha}.</small>
      <div className="riga">
        <button className="primary" disabled={busy} onClick={applica}>Conferma −{tolti} {ris.nome}</button>
        <button className="ghost" disabled={busy} onClick={rifiuta}>Non applicare</button>
      </div>
    </div>
  )
}

// Richieste e doni del Master per questo giocatore: i danni chiedono conferma, il resto si applica da solo.
export default function RichiesteMaster({ tv, c, d, up }) {
  const [avvisi, setAvvisi] = useState([])
  const inCorso = useRef(new Set())

  useEffect(() => {
    for (const a of tv.azioni) {
      if (chiedeConferma(a) || inCorso.current.has(a.id)) continue
      inCorso.current.add(a.id)
      ;(async () => {
        try {
          if (!(await tv.rispondiAzione(a.id, 'applicata'))) return
          const msg = applicaDono(a, c, d, up)
          if (msg) {
            setAvvisi((x) => [...x, { id: a.id, msg }])
            tv.registraEvento(`${c.nome}: ${msg}`)
            setTimeout(() => setAvvisi((x) => x.filter((v) => v.id !== a.id)), 6000)
          }
        } catch (e) {
          console.error(e)
          inCorso.current.delete(a.id)
        }
      })()
    }
  }, [tv.azioni]) // eslint-disable-line react-hooks/exhaustive-deps

  const daConfermare = tv.azioni.filter(chiedeConferma)
  if (!daConfermare.length && !avvisi.length) return null
  return (
    <div className="richieste">
      {avvisi.map((v) => <div key={v.id} className="msg richiesta-avviso">🎁 {v.msg}</div>)}
      {daConfermare.map((a) => (a.tipo === 'danno' ? <Danno key={a.id} a={a} c={c} d={d} tv={tv} up={up} /> : <Perdita key={a.id} a={a} c={c} d={d} tv={tv} up={up} />))}
    </div>
  )
}
