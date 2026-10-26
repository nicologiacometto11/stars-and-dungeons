import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ITEMS_BY_ID } from '../data/items.js'
import { RANGO_MAX, anteprimaDanno, conversioniBottino, costoLibero, testoConversioni, conXp, estraiPergamena, applicaBottino, bottinoDi, conCura, conDanno, conLog, conPuntiCura, conSybil, dannoNetto, riceviOggetto, riservaDanno } from '../lib/rules.js'

// I danni e gli Aureos tolti chiedono conferma; i doni si applicano da soli
const RISORSE = ['aureos', 'sybil', 'puntiCura', 'xp']
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
  if (tipo === 'xp') {
    up((s) => conLog(conXp(s, dati.n), `Master: ${dati.n >= 0 ? '+' : ''}${dati.n} XP`))
    return `${dati.n >= 0 ? 'Ricevi' : 'Perdi'} ${Math.abs(dati.n)} XP`
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
    if (it.id === 'pergamena') {
      // si estrae qui, così il giocatore vede subito quali Pergamene sono uscite
      const uscite = Array.from({ length: dati.qta || 1 }, () => estraiPergamena())
      up((s) => uscite.reduce((x, v) => riceviOggetto(x, v), s))
      return `Ricevi ${uscite.map((v) => v.nome).join(', ')}`
    }
    up((s) => riceviOggetto(s, it, dati.qta || 1))
    if (it.aureosAlRicevimento) return `${it.nome} convertito in ${it.aureosAlRicevimento * (dati.qta || 1)} Aureos`
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
    up((s) => applicaBottino(s, m, { drop: !dati.soloAureos }))
    const conv = dati.soloAureos ? [] : conversioniBottino(m)
    return (dati.soloAureos ? `Aureos di ${m.nome}` : `Bottino di ${m.nome}`) + (conv.length ? ` (${testoConversioni(conv)})` : '')
  }
  return null
}

function Danno({ a, c, d, tv, up, inCoda = 0 }) {
  const { tipo, n } = a.dati
  const netto = dannoNetto(d, tipo, n)
  const [finale, setFinale] = useState(netto)
  const [ris, setRis] = useState(riservaDanno(tipo))
  // con la Forma dell'Equilibrio (Bilancia) si può scegliere Corpo o Mente; i danni puri si scelgono sempre
  const sceltaLibera = tipo === 'puro' || costoLibero(c)
  const armor = tipo === 'fisico' ? d.armorFisica : tipo === 'magico' ? d.armorMagica : 0
  const [busy, setBusy] = useState(false)
  const { ora, max, dopo } = anteprimaDanno(c, d, ris, finale)
  const persi = ora - dopo
  const perc = (x) => (max > 0 ? Math.max(0, Math.min(100, (x / max) * 100)) : 0)
  const corretto = finale !== netto

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

  const finestra = (
    <div className="danno-velo">
      <div className="danno-fin" role="dialog" aria-modal="true" aria-label="Danno dal Master">
        <p className="danno-titolo">⚔️ Il Master ti infligge danni {TIPO_DANNO[tipo]}</p>

        <div className="danno-conto" aria-label="Calcolo del danno">
          {tipo === 'puro' ? (
            <>
              <span className="danno-num">{n}</span>
              <span className="danno-nota">puri: ignorano l'Armor</span>
            </>
          ) : (
            <>
              <span className="danno-num">{n}</span>
              <span className="danno-op">−</span>
              <span className="danno-num armor">{Math.min(armor, n)}<small>Armor</small></span>
              <span className="danno-op">=</span>
              <span className="danno-num risultato">{netto}</span>
            </>
          )}
        </div>
        {tipo !== 'puro' && armor > n && <p className="danno-nota">L'Armor ({armor}) copre tutto il danno.</p>}

        {sceltaLibera ? (
          <div className="filtri danno-ris" role="group" aria-label="Da togliere a">
            {['corpo', 'mente'].map((r) => <button key={r} className={ris === r ? 'on' : ''} onClick={() => setRis(r)}>{NOME_RIS[r]}</button>)}
          </div>
        ) : (
          <p className="danno-nota">Colpisce il {NOME_RIS[ris]}.</p>
        )}

        <div className="danno-barra-box">
          <div className="riga spazio">
            <strong>{NOME_RIS[ris]}</strong>
            <span className="danno-dopo"><s>{ora}</s> → <b className={dopo === 0 ? 'zero' : ''}>{dopo}</b> / {max}</span>
          </div>
          <div className="danno-barra" role="img" aria-label={`${NOME_RIS[ris]} da ${ora} a ${dopo} su ${max}`}>
            <i className="resta" style={{ width: `${perc(dopo)}%` }} />
            <i className="persa" style={{ left: `${perc(dopo)}%`, width: `${perc(persi)}%` }} />
          </div>
          {dopo === 0 && ora > 0 && <p className="danno-allarme">Scenderesti a 0 {NOME_RIS[ris]}.</p>}
        </div>

        <div className="danno-corr">
          <button aria-label="Meno danno" onClick={() => setFinale((x) => Math.max(0, x - 1))}>−</button>
          <span>Danno finale <strong>{finale}</strong>{corretto && <small> (corretto, era {netto})</small>}</span>
          <button aria-label="Più danno" onClick={() => setFinale((x) => x + 1)}>+</button>
        </div>

        <div className="riga">
          <button className="primary" disabled={busy} onClick={applica}>Applica −{finale} {NOME_RIS[ris]}</button>
          <button className="ghost" disabled={busy} onClick={rifiuta}>Non applicare</button>
        </div>
        {inCoda > 0 && <small className="muted">{inCoda === 1 ? 'Dopo questo hai un altro danno da confermare.' : `Dopo questo hai altri ${inCoda} danni da confermare.`}</small>}
      </div>
    </div>
  )
  return typeof document === 'undefined' ? finestra : createPortal(finestra, document.body)
}

// Aureos, Sybil o punti Cura che il Master toglie: serve la conferma del giocatore
const RISORSA = {
  aureos: { nome: 'Aureos', icona: '💰', ha: (c) => c.aureos },
  sybil: { nome: 'Sybil', icona: '🔮', ha: (c, d) => d.sybilAttuale },
  puntiCura: { nome: 'punti Cura', icona: '💚', ha: (c, d) => d.curaAttuale },
  xp: { nome: 'XP', icona: '⭐', ha: (c) => c.xp || 0 },
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
      if (a.tipo === 'xp') up((s) => conLog(conXp(s, -n), `Master: −${tolti} XP`))
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
  const primoDanno = daConfermare.find((a) => a.tipo === 'danno')
  if (!daConfermare.length && !avvisi.length) return null
  return (
    <div className="richieste">
      {avvisi.map((v) => <div key={v.id} className="msg richiesta-avviso">🎁 {v.msg}</div>)}
      {daConfermare.filter((a) => a.tipo !== 'danno').map((a) => <Perdita key={a.id} a={a} c={c} d={d} tv={tv} up={up} />)}
      {primoDanno && <Danno key={primoDanno.id} a={primoDanno} c={c} d={d} tv={tv} up={up} inCoda={daConfermare.filter((a) => a.tipo === 'danno').length - 1} />}
    </div>
  )
}
