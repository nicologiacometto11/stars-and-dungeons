// Regole di gioco: tutto ciò che è "derivato" (Corpo MAX, Mente MAX, Armor, bonus, soglie, Ofiuco...)
// viene calcolato qui a partire dalla scheda salvata, così non si può mai disallineare.

import { SEGNI, SEGNI_BY_ID, CATEGORIE, SOGLIE, OFIUCO } from '../data/zodiac.js'
import { ITEMS, ITEMS_BY_ID, RINOMINATI, ID_VECCHI, PERGAMENE_ESTRATTE, SLOT_NOME, LIMITE_SLOT } from '../data/items.js'
import { MOSTRI_BY_ID } from '../data/monsters.js'
import { slug, ARMI_CRAFT_A, ARMI_CRAFT_S } from '../data/craft.js'

export const RANGO_MAX = 12
export const XP_PER_RANGO = 3
export const ELEMENTI = ['fuoco', 'terra', 'aria', 'acqua']

export function nuovaScheda(nome = '') {
  const segni = Object.fromEntries(SEGNI.map((s) => [s.id, 0]))
  return {
    v: 1,
    nome,
    rango: 1,
    segni, // punti spesi su ogni segno
    bonusSegni: {}, // punti extra (es. Cinque Essenze), non contano per il Rango
    scelte: {}, // scelta del bonus "+1 a X" del Segno, per segno
    corpo: null, // null = al massimo
    mente: null,
    usati: { fato: 0, sybil: 0, cura: 0 }, // punti spesi (il valore attuale = massimo - usati; per la Cura può essere negativo: il giocatore la modifica liberamente)
    extra: { corpoMax: 0, menteMax: 0, armor: 0, armorFisica: 0, armorMagica: 0, fato: 0, sybil: 0, cura: 0 }, // correzioni manuali (Armor Fisica/Magica a scelta)
    armorSplit: null, // quanta Armor base è Fisica (null = tutta Fisica)
    aureos: 0,
    xp: 0, // punti esperienza: 3 XP per salire di Rango
    inventario: [], // { id, qta, eq }
    bestiario: { scoperti: {}, rivelati: {} },
    noti: {}, // oggetti e armi di cui il giocatore conosce gli effetti (studiati, comprati, ricevuti, forgiati)
    ricette: [], // ricette di craft scoperte (nome dell'arma)
    immagine: null, // foto del personaggio (data URL ridotta)
    sabikUsi: 0, // quante volte hai invocato Sabik in questa Sessione (max 2)
    ofiucoRivelato: false, // la rivelazione animata di Ofiuco si vede una volta sola
    creata: new Date().toISOString(), // per il promemoria del backup
    ultimoBackup: null, // ultima esportazione della scheda (JSON)
    backupRimandato: null, // il promemoria non compare prima di questa data
    abilita: [], // abilità perenni ottenute (armi S): { da, testo }
    abilitaPers: [], // abilità scritte dal giocatore: { id, nome, testo, mente, corpo }
    noteAbilita: {}, // appunti per abilità, per chiave
    log: [],
  }
}

// Punti del segno per le sue abilità: assegnati + bonus (Cinque Essenze). I bonus NON contano per Rango né per la Caratteristica.
export const effSegno = (c, id) => (c.segni[id] || 0) + (c.bonusSegni?.[id] || 0)

export const puntiLiberi = (c) => c.rango - segniUsati(c)

// Assegna un punto Rango a un segno (max 10 per segno, solo se ci sono punti liberi)
export function assegnaPunto(c, segnoId) {
  if (puntiLiberi(c) <= 0 || (c.segni[segnoId] || 0) >= 10) return c
  const nuovo = (c.segni[segnoId] || 0) + 1
  return conLog({ ...c, segni: { ...c.segni, [segnoId]: nuovo } }, `${SEGNI_BY_ID[segnoId].nome}: ${nuovo} punti`)
}

export function segniUsati(c) {
  return Object.values(c.segni).reduce((a, b) => a + b, 0)
}

export function ofiucoAttivo(c) {
  return SEGNI.every((s) => effSegno(c, s.id) >= 1)
}

export function elementiConPunti(c) {
  // per ogni elemento: quanti segni DIVERSI hanno almeno 1 punto
  const out = Object.fromEntries(ELEMENTI.map((e) => [e, 0]))
  for (const s of SEGNI) if (effSegno(c, s.id) >= 1) out[s.elemento]++
  return out
}

export function scelteBonus(c, segnoId) {
  const s = SEGNI_BY_ID[segnoId]
  const ab = s.abilita.find((a) => a.tipo === 'segno')
  return c.scelte?.[segnoId] || ab.scelta[0]
}

export function derive(c) {
  const cat = Object.fromEntries(CATEGORIE.map((k) => [k.id, 0]))
  const catItem = { ...cat }
  const mod = { corpoMax: 0, menteMax: 0, armor: 0, armorFisica: 0, armorMagica: 0, fato: 0, sybil: 0, cura: 0, dmgFisici: 0, dmgMagici: 0, dadiSociale: 0, dadiFisico: 0, dadiMagico: 0, dadiDifFisica: 0, dadiDifMagica: 0 }

  // categorie = somma dei due segni
  // la Caratteristica conta solo i punti assegnati (non i bonus del segno, es. Cinque Essenze)
  for (const k of CATEGORIE) cat[k.id] = k.segni.reduce((a, s) => a + (c.segni[s] || 0), 0)

  // bonus dei Segni (soglia 2)
  for (const s of SEGNI) {
    if (effSegno(c, s.id) < 2) continue
    const ab = s.abilita.find((a) => a.tipo === 'segno')
    for (const [k, v] of Object.entries(ab.bonus)) mod[k] += v
    mod[scelteBonus(c, s.id)] += 1
  }

  // bonus ai dadi delle abilità dello Zodiaco sbloccate
  for (const s of SEGNI) {
    for (const a of s.abilita) {
      if (a.dadi && effSegno(c, s.id) >= a.soglia) for (const [k, v] of Object.entries(a.dadi)) mod[k] += v
    }
  }

  // oggetti equipaggiati
  for (const inv of c.inventario) {
    if (!inv.eq) continue
    const it = ITEMS_BY_ID[inv.id]
    if (!it?.mods) continue
    for (const [k, v] of Object.entries(it.mods)) {
      if (k in catItem) catItem[k] += v
      else mod[k] = (mod[k] || 0) + v
    }
  }

  const tot = Object.fromEntries(CATEGORIE.map((k) => [k.id, cat[k.id] + catItem[k.id]]))
  const ex = c.extra || {}

  let d = {
    cat: tot,
    catSegni: cat,
    corpoMax: 3 * tot.resistenza + mod.corpoMax + (ex.corpoMax || 0),
    menteMax: 3 * tot.saggezza + mod.menteMax + (ex.menteMax || 0),
    armorBase: tot.resistenza + mod.armor + (ex.armor || 0),
    armorItemF: mod.armorFisica + (ex.armorFisica || 0),
    armorItemM: mod.armorMagica + (ex.armorMagica || 0),
    fato: tot.fortuna + mod.fato + (ex.fato || 0),
    sybil: tot.carisma + mod.sybil + (ex.sybil || 0),
    cura: tot.saggezza + mod.cura + (ex.cura || 0),
    dadiSociale: 3 * tot.carisma + mod.dadiSociale,
    dadiFisico: 3 * tot.forza + mod.dadiFisico,
    dadiMagico: 3 * tot.arcano + mod.dadiMagico,
    dadiDifFisica: mod.dadiDifFisica,
    dadiDifMagica: mod.dadiDifMagica,
    dmgFisici: tot.forza + mod.dmgFisici,
    dmgMagici: tot.arcano + mod.dmgMagici,
    critico: 10 * tot.fortuna,
  }

  const ofiuco = ofiucoAttivo(c)
  if (ofiuco) {
    for (const k of ['corpoMax', 'menteMax', 'armorBase', 'armorItemF', 'armorItemM', 'fato', 'sybil', 'cura', 'dadiSociale', 'dadiFisico', 'dadiMagico', 'dadiDifFisica', 'dadiDifMagica', 'dmgFisici', 'dmgMagici', 'critico'])
      d[k] *= 2
  }
  d.ofiuco = ofiuco

  const split = c.armorSplit == null ? d.armorBase : Math.min(c.armorSplit, d.armorBase)
  d.armorFisica = Math.max(0, split + d.armorItemF)
  d.armorMagica = Math.max(0, d.armorBase - split + d.armorItemM)
  d.armorSplitEff = split

  d.fatoAttuale = Math.max(0, d.fato - (c.usati?.fato || 0))
  d.sybilAttuale = Math.max(0, d.sybil - (c.usati?.sybil || 0))
  d.curaAttuale = Math.max(0, d.cura - (c.usati?.cura || 0))
  return d
}

// ---- requisiti ----
export function verificaReq(req, c, d) {
  if (!req) return true
  if (req.cat) for (const [k, n] of Object.entries(req.cat)) if ((d.cat[k] || 0) < n) return false
  if (req.stat) {
    const val = {
      corpoMax: d.corpoMax, menteMax: d.menteMax, armor: d.armorFisica + d.armorMagica,
      fato: d.fato, sybil: d.sybil, cura: d.cura,
    }
    for (const [k, n] of Object.entries(req.stat)) if ((val[k] || 0) < n) return false
  }
  const el = elementiConPunti(c)
  if (req.elem) for (const [e, n] of Object.entries(req.elem)) if ((el[e] || 0) < n) return false
  if (req.elemDiff && ELEMENTI.filter((e) => el[e] >= 1).length < req.elemDiff) return false
  if (req.aureos && c.aureos < req.aureos) return false
  return true
}

// ---- sblocchi Ruota ----
export const abilitaSbloccate = (c, segnoId) => SEGNI_BY_ID[segnoId].abilita.filter((a) => effSegno(c, segnoId) >= a.soglia)

export function armiZodiacoDisponibili(c) {
  return SEGNI.filter((s) => effSegno(c, s.id) >= 5).map((s) => s.id)
}

export function armiElementoDisponibili(c) {
  return ELEMENTI.filter((e) => SEGNI.filter((s) => s.elemento === e).every((s) => effSegno(c, s.id) >= 1))
}

export const prossimaSoglia = (c, segnoId) => SOGLIE.find((s) => s > effSegno(c, segnoId))

// ---- studio di armi e oggetti ----
export const STUDIO_SYBIL = 1

// Prima di averli (comprati, ricevuti, forgiati) o studiati, gli effetti di armi e oggetti sono nascosti.
export const itemNoto = (c, id) => !!c.noti?.[id] || qtaIn(c, id) > 0

export function studiaOggetto(c, d, id) {
  if (itemNoto(c, id) || d.sybil - (c.usati?.sybil || 0) < STUDIO_SYBIL) return c
  const it = ITEMS_BY_ID[id]
  return conLog(
    { ...c, usati: { ...c.usati, sybil: (c.usati?.sybil || 0) + STUDIO_SYBIL }, noti: { ...(c.noti || {}), [id]: true } },
    `Studiato ${it?.nome || id} (−${STUDIO_SYBIL} Sybil)`,
  )
}

// ---- craft a tentativi ----
export const RICETTE = [...ARMI_CRAFT_A, ...ARMI_CRAFT_S]

// Acquisto di una ricetta a caso: armi A = 1 Sybil, armi S = 5 Sybil
export const COSTO_RICETTA = { A: 1, S: 5 }
const gruppoRicetta = (r) => (ARMI_CRAFT_S.includes(r) ? 'S' : 'A')

// Ricette ancora da scoprire: non conosciute e di un'arma che il giocatore non ha già
export const ricetteDisponibili = (c, gruppo) =>
  RICETTE.filter((r) => gruppoRicetta(r) === gruppo && !c.ricette.includes(r.nome) && qtaIn(c, slug(r.nome)) === 0)

export function compraRicetta(c, d, gruppo, caso = Math.random()) {
  const costo = COSTO_RICETTA[gruppo]
  const pool = ricetteDisponibili(c, gruppo)
  if (!pool.length || d.sybil - (c.usati?.sybil || 0) < costo) return { c, ricetta: null }
  const ricetta = pool[Math.min(pool.length - 1, Math.floor(caso * pool.length))]
  return {
    ricetta,
    c: conLog(
      { ...c, usati: { ...c.usati, sybil: (c.usati?.sybil || 0) + costo }, ricette: [...c.ricette, ricetta.nome] },
      `Scoperta la ricetta di ${ricetta.nome} (−${costo} Sybil)`,
    ),
  }
}

// La ricetta che corrisponde esattamente ai materiali scelti (nessuno in più, nessuno in meno)
export function cercaRicetta(ids) {
  const set = new Set(ids)
  return RICETTE.find((r) => r.ing.length === set.size && r.ing.every((n) => set.has(slug(n)))) || null
}

// Tenta il craft: se la combinazione è giusta i materiali si consumano e si ottiene l'arma, altrimenti non si perde niente.
export function tentaCraft(c, ids) {
  const set = [...new Set(ids)]
  if (!set.length || !set.every((id) => qtaIn(c, id) > 0)) return { c, esito: 'no' }
  const ric = cercaRicetta(set)
  if (!ric) return { c, esito: 'no' }
  let x = c
  for (const n of ric.ing) x = conRimozione(x, slug(n))
  x = conAggiunta(x, slug(ric.nome))
  if (ric.perenne) x = { ...x, abilita: [...(x.abilita || []), { da: ric.nome, testo: ric.perenne }] }
  if (!x.ricette.includes(ric.nome)) x = { ...x, ricette: [...x.ricette, ric.nome] }
  return { c: conLog(x, `Forgiata ${ric.nome}`), esito: 'ok', ricetta: ric }
}

// ---- abilità ----
// Cerca nel testo i costi in Mente/Corpo, es. "(5 Mente)", "(3 Mente + 3 Corpo)", "pagando 5 Corpo".
export function parseCosti(testo = '', largo = false) {
  const out = []
  const add = (n, ris) => {
    const r = ris.toLowerCase()
    if (!out.some((x) => x.n === n && x.ris === r)) out.push({ n, ris: r })
  }
  for (const m of testo.matchAll(/\((?:costo\s*)?(\d+)\s*(Mente|Corpo)(?:\s*(o|e|\+)\s*(?:(\d+)\s*)?(Mente|Corpo))?/gi)) {
    add(Number(m[1]), m[2])
    if (m[5]) add(m[4] ? Number(m[4]) : Number(m[1]), m[5])
  }
  for (const m of testo.matchAll(/(?:pagando|pagare|paga|costo:?)\s+(\d+)\s*(Mente|Corpo)/gi)) add(Number(m[1]), m[2])
  if (largo) for (const m of testo.matchAll(/(\d+)\s*(Mente|Corpo)/gi)) add(Number(m[1]), m[2])
  return out
}

// Forma dell'Equilibrio (Bilancia, soglia 1): ogni costo si può pagare in Mente o in Corpo a scelta.
export const costoLibero = (c) => effSegno(c, 'bilancia') >= 1

// Se il costo è libero, ogni costo diventa pagabile in entrambe le riserve.
export function costiPagabili(costi, libero) {
  if (!libero) return costi
  const importi = [...new Set(costi.map((k) => k.n))]
  return importi.flatMap((n) => [{ n, ris: 'mente' }, { n, ris: 'corpo' }])
}

// Tutte le abilità che il giocatore può usare ora: Ruota sbloccata, oggetti/armi equipaggiati,
// abilità uniche, perenni (armi S) e quelle scritte da lui.
export const SABIK_USI = 2

// Sabik (Ofiuco): una qualunque delle 12 abilità di Grado 8, 2 volte per Sessione
export function abilitaSabik() {
  return SEGNI.map((s) => ({ segno: s.nome, ...s.abilita.find((a) => a.soglia === 8) }))
}

export function conSabik(c, delta) {
  return { ...c, sabikUsi: Math.min(SABIK_USI, Math.max(0, (c.sabikUsi || 0) + delta)) }
}

export function abilitaScheda(c) {
  const lista = []
  const ofiuco = ofiucoAttivo(c)
  if (ofiuco) {
    // Le tecniche della Ruota non sono più disponibili: al loro posto ci sono le 4 di Ofiuco
    const NOMI = ['Colpo di Ofiuco', 'Zanna del serpente', 'Asclepio', 'Sabik']
    OFIUCO.abilita.forEach((testo, i) => {
      const sabik = i === 3
      lista.push({ key: `ofiuco:${i}`, nome: NOMI[i], fonte: 'Ofiuco', tipo: 'zodiaco', testo: sabik ? `${testo} Scegli qui sotto quale.` : testo, costi: sabik ? [] : parseCosti(testo), ...(sabik ? { sabik: abilitaSabik() } : {}) })
    })
  }
  for (const s of ofiuco ? [] : SEGNI) {
    for (const a of abilitaSbloccate(c, s.id)) {
      if (a.tipo === 'segno') continue
      lista.push({ key: `z:${s.id}:${a.soglia}`, nome: a.nome, fonte: `Zodiaco · ${s.nome}`, tipo: 'zodiaco', testo: a.desc, costoTxt: a.costo, costi: parseCosti(a.costo || '', true) })
    }
  }
  for (const inv of c.inventario) {
    const it = ITEMS_BY_ID[inv.id]
    if (!it) continue
    if (it.cat === 'abilita') {
      lista.push({ key: `i:${it.id}`, nome: it.nome, fonte: 'Abilità unica', tipo: 'unica', testo: it.desc.replace(/^Abilità UNICA\.\s*/, ''), costi: parseCosti(it.desc) })
    } else if (inv.eq && (it.cat === 'arma' || it.cat === 'oggetto')) {
      const testo = it.abilita || it.desc || ''
      const costi = parseCosti(testo)
      lista.push({ key: `i:${it.id}`, nome: it.nome, fonte: it.cat === 'arma' ? 'Arma equipaggiata' : `${SLOT_NOME[it.slot] || 'Oggetto'} equipaggiato`, tipo: 'oggetto', testo, costi })
    }
  }
  for (const a of c.abilita || []) {
    lista.push({ key: `p:${a.da}`, nome: a.da, fonte: 'Abilità perenne (Arma S)', tipo: 'perenne', testo: a.testo, costi: parseCosti(a.testo) })
  }
  for (const a of c.abilitaPers || []) {
    const costi = []
    if (a.mente > 0) costi.push({ n: a.mente, ris: 'mente' })
    if (a.corpo > 0) costi.push({ n: a.corpo, ris: 'corpo' })
    lista.push({ key: `c:${a.id}`, nome: a.nome, fonte: 'Tua', tipo: 'pers', testo: a.testo, costi, persId: a.id })
  }
  return lista
}

// ---- inventario ----
export function qtaIn(c, id) {
  return c.inventario.find((i) => i.id === id)?.qta || 0
}

export function conAggiunta(c, id, qta = 1) {
  const inv = [...c.inventario]
  const idx = inv.findIndex((i) => i.id === id)
  if (idx >= 0) inv[idx] = { ...inv[idx], qta: inv[idx].qta + qta }
  else inv.push({ id, qta, eq: false })
  return { ...c, inventario: inv, noti: { ...(c.noti || {}), [id]: true } }
}

export function conRimozione(c, id, qta = 1) {
  const inv = c.inventario
    .map((i) => (i.id === id ? { ...i, qta: i.qta - qta, eq: i.qta - qta > 0 ? i.eq : false } : i))
    .filter((i) => i.qta > 0)
  return { ...c, inventario: inv }
}

// Aggiunge un oggetto alla scheda. I materiali "che danno Aureos" si convertono subito.
// Estrae a caso una delle 6 Pergamene
export const estraiPergamena = (caso = Math.random) => ITEMS_BY_ID[PERGAMENE_ESTRATTE[Math.floor(caso() * PERGAMENE_ESTRATTE.length)]]

// Pergamena di Scovare: un oggetto di craft a caso di grado C o B (quelli che si convertono in Aureos sono esclusi)
export const SCOVABILI = ITEMS.filter((i) => i.cat === 'materiale' && ['C', 'B'].includes(i.tier) && !i.aureosAlRicevimento)
export const scovaMateriale = (caso = Math.random) => SCOVABILI[Math.floor(caso() * SCOVABILI.length)]

export function riceviOggetto(s, it, qta = 1, caso = Math.random) {
  // la Pergamena generica diventa subito una delle 6, estratta a caso per ognuna
  if (it.id === 'pergamena') {
    let x = s
    for (let i = 0; i < qta; i++) {
      const vera = estraiPergamena(caso)
      x = conLog(conAggiunta(x, vera.id), `Ricevuta una Pergamena: ${vera.nome.replace('Pergamena: ', '')}`)
    }
    return x
  }
  if (it.aureosAlRicevimento) {
    const tot = it.aureosAlRicevimento * qta
    return conLog({ ...s, aureos: s.aureos + tot }, `Ricevuto ${it.nome}: +${tot} Aureos`)
  }
  return conLog(conAggiunta(s, it.id, qta), `Ricevuto ${qta > 1 ? qta + '× ' : ''}${it.nome}`)
}

export const haAnelloOro = (c) => c.inventario.some((i) => i.id === slug("Anello d'Oro") && i.eq)

// Mostro sconfitto: Aureos (raddoppiati con l'Anello d'Oro equipaggiato) e materiali del bottino.
export function applicaBottino(s, m, { drop = true } = {}) {
  let x = s
  if (m.aureos) {
    const doppio = haAnelloOro(s)
    const au = m.aureos * (doppio ? 2 : 1)
    x = conLog({ ...x, aureos: x.aureos + au }, `Sconfitto ${m.nome}: +${au} Aureos${doppio ? " (Anello d'Oro)" : ''}`)
  } else x = conLog(x, `Sconfitto ${m.nome}`)
  if (drop) {
    for (const n of m.drop) {
      const it = ITEMS_BY_ID[slug(n)]
      if (it) x = riceviOggetto(x, it)
    }
  }
  return x
}
export const bottinoDi = (idMostro) => MOSTRI_BY_ID[idMostro]

// Materiali del bottino che si convertono subito in Aureos (es. Capelli d'Argento = 150 Aureos)
export function conversioniBottino(m) {
  return m.drop.map((n) => ITEMS_BY_ID[slug(n)]).filter((it) => it?.aureosAlRicevimento).map((it) => ({ nome: it.nome, aureos: it.aureosAlRicevimento }))
}
export const testoConversioni = (lista) => lista.map((x) => `${x.nome} convertito in ${x.aureos} Aureos`).join(', ')

// ---- danni e cure del Master ----
// L'Armor dello stesso tipo si sottrae al danno (minimo 0); i danni puri la ignorano.
export function dannoNetto(d, tipo, n) {
  if (tipo === 'fisico') return Math.max(0, n - d.armorFisica)
  if (tipo === 'magico') return Math.max(0, n - d.armorMagica)
  return n
}
// Riserva che di norma subisce il danno: fisico = Corpo, magico = Mente (i puri li sceglie il giocatore)
export const riservaDanno = (tipo) => (tipo === 'magico' ? 'mente' : 'corpo')

const attuale = (c, d, ris) => {
  const max = ris === 'corpo' ? d.corpoMax : d.menteMax
  return { ora: Math.min(c[ris] ?? max, max), max }
}
// Com'è la riserva ora e com'è dopo il danno (per la finestra del Tavolo)
export function anteprimaDanno(c, d, ris, n) {
  const { ora, max } = attuale(c, d, ris)
  return { ora, max, dopo: Math.max(0, ora - n) }
}
export function conDanno(c, d, ris, n) {
  const { ora } = attuale(c, d, ris)
  return { ...c, [ris]: Math.max(0, ora - n) }
}
export function conCura(c, d, ris, n) {
  const { ora, max } = attuale(c, d, ris)
  return { ...c, [ris]: Math.min(max, ora + n) }
}

// Sybil e punti Cura dati o tolti dal Master: il valore attuale non scende sotto 0 (e può superare la base)
export function conSybil(c, n) {
  const d = derive(c)
  return { ...c, usati: { ...c.usati, sybil: d.sybil - Math.max(0, d.sybilAttuale + n) } }
}
export function conPuntiCura(c, n) {
  const d = derive(c)
  return { ...c, usati: { ...c.usati, cura: d.cura - Math.max(0, d.curaAttuale + n) } }
}

// Cambia il massimo di Corpo o Mente a mano (punti bonus): il valore attuale non supera mai il massimo.
export function conMax(c, chiave, delta) {
  const ris = chiave === 'corpoMax' ? 'corpo' : 'mente'
  let x = { ...c, extra: { ...c.extra, [chiave]: (c.extra?.[chiave] || 0) + delta } }
  const max = derive(x)[chiave]
  if (max < 0) return c
  if (x[ris] != null && x[ris] > max) x = { ...x, [ris]: max }
  return x
}

// Promemoria del backup: compare se l'ultimo (o la creazione della scheda) è più vecchio di 30 giorni
export const GIORNI_BACKUP = 30
export function serveBackup(c, adesso = Date.now()) {
  const giorno = 864e5
  const ultimo = Date.parse(c.ultimoBackup || c.creata || '') || adesso
  const giorni = Math.floor((adesso - ultimo) / giorno)
  const rimandato = c.backupRimandato ? Date.parse(c.backupRimandato) > adesso : false
  return { serve: giorni >= GIORNI_BACKUP && !rimandato, giorni, mai: !c.ultimoBackup }
}

// Armor Fisica o Magica a scelta (oltre a quella degli oggetti)
export function conArmor(c, chiave, delta) {
  return { ...c, extra: { ...c.extra, [chiave]: (c.extra?.[chiave] || 0) + delta } }
}

// Correzione: si può scendere di Rango solo se c'è un punto Rango non assegnato (altrimenti prima si toglie dallo Zodiaco)
export function togliRango(c) {
  if (c.rango <= 1 || puntiLiberi(c) <= 0) return c
  return conLog({ ...c, rango: c.rango - 1 }, `Rango ${c.rango - 1} (correzione)`)
}

// ---- equipaggiamento: limiti per Anello/Amuleto/Item aggiuntivo e mani delle armi
export function controllaEquip(c, it) {
  const eq = c.inventario.filter((r) => r.eq).map((r) => ITEMS_BY_ID[r.id]).filter(Boolean)
  if (it.cat === 'oggetto' && it.slot) {
    if (eq.filter((x) => x.slot === it.slot).length >= LIMITE_SLOT[it.slot]) {
      const nome = SLOT_NOME[it.slot]
      return { ok: false, forzabile: false, motivo: `Hai già equipaggiato ${it.slot === 'agg' ? "l'Item aggiuntivo" : 'un ' + nome}: toglilo prima. Puoi tenere 1 Anello, 1 Amuleto e 1 Item aggiuntivo.` }
    }
  }
  if (it.cat === 'arma' && it.mani) {
    const armi = eq.filter((x) => x.cat === 'arma' && x.mani)
    const conflitto = (it.mani === 2 && armi.length > 0) || (it.mani === 1 && armi.some((x) => x.mani === 2))
    if (conflitto) return { ok: false, forzabile: true, motivo: 'Un\'arma a due mani non si equipaggia insieme a un\'arma a una mano (salvo abilità speciali).' }
  }
  return { ok: true }
}

// Cosa è equipaggiato e dove: un oggetto per slot (anello, amuleto, item agg) e le armi nelle mani
export function equipaggiato(c) {
  const eq = c.inventario.filter((r) => r.eq).map((r) => ITEMS_BY_ID[r.id]).filter(Boolean)
  const perSlot = (slot) => eq.filter((x) => x.cat === 'oggetto' && x.slot === slot)
  const armi = eq.filter((x) => x.cat === 'arma')
  const conMani = armi.filter((a) => a.mani)
  const due = conMani.find((a) => a.mani === 2)
  return {
    anello: perSlot('anello'), amuleto: perSlot('amuleto'), agg: perSlot('agg'),
    dueMani: due || null,
    destra: due ? null : conMani[0] || null,
    sinistra: due ? null : conMani[1] || null,
    extraMani: due ? conMani.filter((a) => a !== due) : conMani.slice(2), // armi in più (solo se forzate)
    senzaMani: armi.filter((a) => !a.mani), // armi speciali che non occupano le mani
  }
}

// ---- danno delle armi con i bonus
export function dannoArma(it, d) {
  if (it.danni == null) return null
  const t = (it.tipo || '').toLowerCase()
  const f = t.includes('fisico'), m = t.includes('magico')
  const alternativa = f && m && t.includes(' o ')
  const parti = []
  if (f) parti.push({ n: d.dmgFisici, tipo: 'fisici' })
  if (m) parti.push({ n: d.dmgMagici, tipo: 'magici' })
  const totale = it.danni + (alternativa ? 0 : parti.reduce((a, p) => a + p.n, 0))
  return { base: it.danni, parti, alternativa, totale }
}
export function testoDanno(g) {
  if (g.alternativa) return `${g.base} danni (+ ${g.parti[0].n} fisici se fisico, + ${g.parti[1].n} magici se magico)`
  const bonus = g.parti.map((p) => ` + ${p.n} ${p.tipo}`).join('')
  return bonus ? `${g.base} danni${bonus} = ${g.totale}` : `${g.base} danni`
}

// Sale di un Rango spendendo 3 XP (il Rango non scende mai)
export function saliRango(c) {
  if (c.rango >= RANGO_MAX || (c.xp || 0) < XP_PER_RANGO) return c
  return conLog({ ...c, xp: c.xp - XP_PER_RANGO, rango: c.rango + 1 }, `Rango ${c.rango + 1} (−${XP_PER_RANGO} XP)`)
}
export const conXp = (c, n) => ({ ...c, xp: Math.max(0, (c.xp || 0) + n) })

export function conLog(c, testo) {
  const log = [{ t: new Date().toISOString(), testo }, ...(c.log || [])].slice(0, 150)
  return { ...c, log }
}

// Porta una scheda salvata (anche vecchia o parziale) alla forma corrente.
export function normalizza(raw) {
  const base = nuovaScheda(raw?.nome || '')
  const c = { ...base, ...raw }
  c.segni = { ...base.segni, ...(raw?.segni || {}) }
  c.usati = { ...base.usati, ...(raw?.usati || {}) }
  c.extra = { ...base.extra, ...(raw?.extra || {}) }
  c.bestiario = { scoperti: {}, rivelati: {}, ...(raw?.bestiario || {}) }
  c.xp = Math.max(0, Number(raw?.xp) || 0)
  c.immagine = raw?.immagine || null
  c.ofiucoRivelato = !!raw?.ofiucoRivelato
  c.sabikUsi = Math.min(SABIK_USI, Math.max(0, Number(raw?.sabikUsi) || 0))
  c.creata = raw?.creata || new Date().toISOString()
  // oggetti e armi rinominati: l'id (e il nome della ricetta) cambia, la scheda resta valida
  const nuovoId = (id) => ID_VECCHI[id] || id
  const nuovoNome = (n) => RINOMINATI[n] || n
  c.noti = Object.fromEntries(Object.entries(raw?.noti || {}).map(([k, v]) => [nuovoId(k), v]))
  c.ricette = (raw?.ricette || []).map(nuovoNome)
  c.abilita = (raw?.abilita || []).map((a) => ({ ...a, da: nuovoNome(a.da) }))
  c.abilitaPers = raw?.abilitaPers || []
  c.noteAbilita = Object.fromEntries(
    Object.entries(raw?.noteAbilita || {}).map(([k, v]) => [k.startsWith('i:') ? 'i:' + nuovoId(k.slice(2)) : k.startsWith('p:') ? 'p:' + nuovoNome(k.slice(2)) : k, v]),
  )
  c.inventario = (raw?.inventario || []).map((r) => ({ ...r, id: nuovoId(r.id) }))
  c.log = raw?.log || []
  return c
}
