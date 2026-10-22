// Regole di gioco: tutto ciò che è "derivato" (Corpo MAX, Mente MAX, Armor, bonus, soglie, Ofiuco...)
// viene calcolato qui a partire dalla scheda salvata, così non si può mai disallineare.

import { SEGNI, SEGNI_BY_ID, CATEGORIE, SOGLIE } from '../data/zodiac.js'
import { ITEMS_BY_ID } from '../data/items.js'

export const RANGO_MAX = 12
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
    usati: { fato: 0, sybil: 0 }, // punti spesi (il valore attuale = massimo - usati)
    extra: { corpoMax: 0, menteMax: 0, armor: 0, fato: 0, sybil: 0, cura: 0 }, // correzioni manuali
    armorSplit: null, // quanta Armor base è Fisica (null = tutta Fisica)
    aureos: 0,
    inventario: [], // { id, qta, eq }
    bestiario: { scoperti: {}, rivelati: {} },
    abilita: [],
    log: [],
  }
}

export const effSegno = (c, id) => (c.segni[id] || 0) + (c.bonusSegni?.[id] || 0)

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
  const mod = { corpoMax: 0, menteMax: 0, armor: 0, armorFisica: 0, armorMagica: 0, fato: 0, sybil: 0, cura: 0, dmgFisici: 0, dmgMagici: 0 }

  // categorie = somma dei due segni
  for (const k of CATEGORIE) cat[k.id] = k.segni.reduce((a, s) => a + effSegno(c, s), 0)

  // bonus dei Segni (soglia 2)
  for (const s of SEGNI) {
    if (effSegno(c, s.id) < 2) continue
    const ab = s.abilita.find((a) => a.tipo === 'segno')
    for (const [k, v] of Object.entries(ab.bonus)) mod[k] += v
    mod[scelteBonus(c, s.id)] += 1
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
    armorItemF: mod.armorFisica,
    armorItemM: mod.armorMagica,
    fato: tot.fortuna + mod.fato + (ex.fato || 0),
    sybil: tot.carisma + mod.sybil + (ex.sybil || 0),
    cura: tot.saggezza + mod.cura + (ex.cura || 0),
    dadiSociale: 3 * tot.carisma,
    dadiFisico: 3 * tot.forza,
    dadiMagico: 3 * tot.arcano,
    dmgFisici: tot.forza + mod.dmgFisici,
    dmgMagici: tot.arcano + mod.dmgMagici,
    critico: 10 * tot.fortuna,
  }

  const ofiuco = ofiucoAttivo(c)
  if (ofiuco) {
    for (const k of ['corpoMax', 'menteMax', 'armorBase', 'armorItemF', 'armorItemM', 'fato', 'sybil', 'cura', 'dadiSociale', 'dadiFisico', 'dadiMagico', 'dmgFisici', 'dmgMagici', 'critico'])
      d[k] *= 2
  }
  d.ofiuco = ofiuco

  const split = c.armorSplit == null ? d.armorBase : Math.min(c.armorSplit, d.armorBase)
  d.armorFisica = split + d.armorItemF
  d.armorMagica = d.armorBase - split + d.armorItemM
  d.armorSplitEff = split

  d.fatoAttuale = Math.max(0, d.fato - (c.usati?.fato || 0))
  d.sybilAttuale = Math.max(0, d.sybil - (c.usati?.sybil || 0))
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

// ---- inventario ----
export function qtaIn(c, id) {
  return c.inventario.find((i) => i.id === id)?.qta || 0
}

export function conAggiunta(c, id, qta = 1) {
  const inv = [...c.inventario]
  const idx = inv.findIndex((i) => i.id === id)
  if (idx >= 0) inv[idx] = { ...inv[idx], qta: inv[idx].qta + qta }
  else inv.push({ id, qta, eq: false })
  return { ...c, inventario: inv }
}

export function conRimozione(c, id, qta = 1) {
  const inv = c.inventario
    .map((i) => (i.id === id ? { ...i, qta: i.qta - qta, eq: i.qta - qta > 0 ? i.eq : false } : i))
    .filter((i) => i.qta > 0)
  return { ...c, inventario: inv }
}

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
  c.inventario = raw?.inventario || []
  c.log = raw?.log || []
  return c
}
