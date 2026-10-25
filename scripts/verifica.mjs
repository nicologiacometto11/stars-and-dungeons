// Controllo automatico: calcoli di gioco e apertura di tutte le schermate. Si lancia con `npm run verifica`.
import { createServer } from 'vite'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const R = fileURLToPath(new URL('..', import.meta.url))
const vite = await createServer({ root: R, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const req = createRequire(R + 'package.json')
const React = req('react')
const { renderToString } = req('react-dom/server')
const load = (p) => vite.ssrLoadModule(p)
const r = await load('/src/lib/rules.js')
const { ITEMS, SHOP_ITEMS } = await load('/src/data/items.js')
const craft = await load('/src/data/craft.js')
const { SEGNI } = await load('/src/data/zodiac.js')

let fail = 0
const ok = (c, m) => { if (!c) { fail++; console.log('✗', m) } }
const testo = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
const con = (c, nome, eq = true) => {
  const it = ITEMS.find((i) => i.nome === nome)
  const x = r.conAggiunta(c, it.id)
  x.inventario.find((i) => i.id === it.id).eq = eq
  return x
}

// ---- Cinque Essenze: contano solo per il segno, non per Caratteristica né Rango
let es = r.nuovaScheda('E'); es.rango = 3; es.segni.ariete = 1
const sen = r.derive(es)
es = { ...es, bonusSegni: { ariete: 2 } }
const con2 = r.derive(es)
ok(con2.cat.resistenza === sen.cat.resistenza && con2.catSegni.resistenza === 1, 'Cinque Essenze: la Caratteristica (Resistenza) non cambia')
ok(con2.corpoMax === sen.corpoMax + 2, 'Cinque Essenze: il segno raggiunge la soglia 2 e dà il suo bonus fisso (+2 Corpo MAX)')
ok(r.puntiLiberi(es) === 2 && es.rango === 3, 'Cinque Essenze: Rango e punti da assegnare invariati')
ok(r.effSegno(es, 'ariete') === 3 && r.abilitaSbloccate(es, 'ariete').length === 2, 'Cinque Essenze: il segno sale a 3 e sblocca le sue abilità (1 e 2)')

// ---- equipaggiamento: 1 Anello, 1 Amuleto, 1 Item agg; mani delle armi
const slotDi = (nome) => ITEMS.find((i) => i.nome === nome)?.slot
ok(slotDi('Anello di Piume') === 'anello' && slotDi('Luna Nera') === 'amuleto' && slotDi('Armatura Mentale') === 'agg' && slotDi('Tonico') === undefined && slotDi('Anello della Stella Cadente') === undefined, 'slot degli oggetti (anello, amuleto, item agg, consumabili senza slot)')
ok(ITEMS.filter((i) => i.cat === 'oggetto' && !i.consumabile).every((i) => ['anello', 'amuleto', 'agg'].includes(i.slot)), 'ogni oggetto non consumabile ha uno slot')
ok(ITEMS.filter((i) => i.tier === 'SS').every((i) => i.mani === 2), 'le armi SS contano come a due mani')
const eqCon = (nomi) => nomi.reduce((x, n) => con(x, n, true), r.nuovaScheda('E'))
const prova = (nomi, nuovoNome) => r.controllaEquip(eqCon(nomi), ITEMS.find((i) => i.nome === nuovoNome))
ok(!prova(['Anello di Piume'], 'Anello di Guardia').ok && !prova(['Anello di Piume'], 'Anello di Guardia').forzabile, 'un secondo Anello viene bloccato')
ok(prova(['Anello di Piume'], 'Luna Nera').ok && prova(['Anello di Piume', 'Luna Nera'], 'Armatura Mentale').ok, 'Anello + Amuleto + Item agg insieme vanno bene')
ok(!prova(['Luna Nera'], 'Amuleto Selvaggio').ok && !prova(['Armatura Mentale'], 'Sciarpa dei Tarocchi').ok, 'un secondo Amuleto o Item agg viene bloccato')
const dueMani = ITEMS.find((i) => i.cat === 'arma' && i.mani === 2 && i.tier === 'C').nome
const unaMano = ITEMS.find((i) => i.cat === 'arma' && i.mani === 1 && i.tier === 'C').nome
ok(!prova([unaMano], dueMani).ok && prova([unaMano], dueMani).forzabile && !prova([dueMani], unaMano).ok, 'due mani + una mano: errore (forzabile con abilità speciali)')
ok(prova([unaMano], ITEMS.filter((i) => i.cat === 'arma' && i.mani === 1 && i.nome !== unaMano)[0].nome).ok, 'due armi a una mano vanno bene')
ok(!prova([unaMano], 'Gallia Manifestazione di Guerra').ok, 'arma SS + arma a una mano: errore')

// ---- danni delle armi con i bonus
let dc = r.nuovaScheda('D'); dc.rango = 12; dc.segni.cancro = 3; dc.segni.vergine = 2 // Forza 3 (+3 fisici), Arcano 2 (+2 magici)
const dd = r.derive(dc)
const arma = (n) => ITEMS.find((i) => i.nome === n)
ok(dd.dmgFisici === 3 && dd.dmgMagici === 2, 'bonus ai danni dalle Caratteristiche')
const gF = r.dannoArma(arma('Agonia'), dd)
ok(gF.totale === 5 + 3 && r.testoDanno(gF) === '5 danni + 3 fisici = 8', 'arma fisica: base + danni fisici')
ok(r.dannoArma(arma('Aegeon Fendi-Fulmini'), dd).totale === 15 + 2, 'arma magica: base + danni magici')
const gM = r.dannoArma(arma('Titan Genesi del Dio Celeste'), dd)
ok(gM.totale === 8 + 3 + 2 && /\+ 3 fisici \+ 2 magici = 13/.test(r.testoDanno(gM)), 'arma fisica e magica: tutti e due i bonus (8 danni + 3 fisici + 2 magici = 13)')
ok(r.dannoArma(arma('Hyperion Completo Annientamento'), dd).alternativa && /se fisico/.test(r.testoDanno(r.dannoArma(arma('Hyperion Completo Annientamento'), dd))), 'arma fisica o magica: i due casi')
ok(r.dannoArma(arma('Omnipotent'), dd) === null, 'arma senza danni: niente totale')

// ---- Armor a scelta, Rango che scende, Amuleto senza costo tra le abilità, bottino diviso
let ar = r.nuovaScheda('A'); ar.rango = 3
ok(r.derive(r.conArmor(ar, 'armorFisica', 2)).armorFisica === 2 && r.derive(r.conArmor(ar, 'armorMagica', 3)).armorMagica === 3 && r.derive(r.conArmor(ar, 'armorFisica', -9)).armorFisica === 0, 'Armor Fisica e Magica modificabili a scelta, mai sotto 0')
ok(r.togliRango(ar).rango === 2 && r.togliRango(r.assegnaPunto(r.assegnaPunto(r.assegnaPunto(ar, 'ariete'), 'ariete'), 'ariete')).rango === 3 && r.togliRango({ ...ar, rango: 1 }).rango === 1, 'Rango scende solo con un punto libero e mai sotto 1')
ok(r.abilitaScheda(con(r.nuovaScheda('S'), 'Amuleto del Sole Infranto')).some((x) => x.nome === 'Amuleto del Sole Infranto'), 'le abilità di un amuleto equipaggiato si vedono anche senza costo')
const soloAu = r.applicaBottino(r.nuovaScheda('B'), r.bottinoDi('giudicatore'), { drop: false })
ok(soloAu.aureos === 15 && soloAu.inventario.length === 0, 'bottino: solo Aureos (gli oggetti si assegnano a parte)')

// ---- Capelli d'Argento: l'Elfo li lascia, ma diventano 150 Aureos (con avviso)
const elfo = r.bottinoDi('elfo')
const convE = r.conversioniBottino(elfo)
ok(convE.length === 1 && convE[0].nome === "Capelli d'Argento" && convE[0].aureos === 150, "Elfo: i Capelli d'Argento si convertono in 150 Aureos")
ok(/Capelli d'Argento convertito in 150 Aureos/.test(r.testoConversioni(convE)), 'avviso della conversione')
ok(r.applicaBottino(r.nuovaScheda('E'), elfo).aureos === elfo.aureos + 150, "Elfo: gli Aureos del mostro più i 150 dei Capelli d'Argento")

// ---- XP: 3 XP per salire di Rango, gli XP li dà il Master o il Cosmo Liquido
let xpS = r.nuovaScheda('X'); xpS.xp = 2
ok(r.saliRango(xpS) === xpS, 'XP: con 2 XP non si sale di Rango')
xpS = r.conXp(xpS, 4)
const su = r.saliRango(xpS)
ok(su.rango === 2 && su.xp === 3, 'XP: con 6 XP si sale di Rango e ne restano 3')
ok(r.conXp(r.nuovaScheda('X'), -9).xp === 0, 'XP: mai sotto 0')
ok(r.saliRango({ ...r.nuovaScheda('X'), rango: 12, xp: 9 }).rango === 12, 'XP: il Rango non supera 12')
const cosmo = ITEMS.find((i) => i.nome === 'Cosmo Liquido')
ok(cosmo.xp === 2 && cosmo.consumabile, 'Cosmo Liquido: +2 XP in automatico')
ok(r.normalizza({ nome: 'V' }).xp === 0, 'XP: le schede vecchie partono da 0')

// ---- danni, cure, bottino
let c = r.nuovaScheda('T'); c.rango = 12; c.segni.pesci = 3; c.segni.ariete = 2
let d = r.derive(c)
ok(r.dannoNetto(d, 'fisico', 12) === Math.max(0, 12 - d.armorFisica), 'danno fisico sottrae Armor fisica')
ok(r.dannoNetto(d, 'magico', 12) === Math.max(0, 12 - d.armorMagica), 'danno magico sottrae Armor magica')
ok(r.dannoNetto(d, 'puro', 12) === 12 && r.dannoNetto(d, 'fisico', 0) === 0, 'puri ignorano Armor, mai negativo')
ok(r.conDanno(c, d, 'corpo', 999).corpo === 0 && r.conCura(r.conDanno(c, d, 'corpo', 5), d, 'corpo', 999).corpo === d.corpoMax, 'danno e cura restano tra 0 e MAX')
const b0 = r.applicaBottino(r.nuovaScheda('B'), r.bottinoDi('ashuz'))
ok(b0.aureos === 2, 'bottino Ashuz')
const b1 = con(r.nuovaScheda('B'), "Anello d'Oro")
ok(r.applicaBottino(b1, r.bottinoDi('ashuz')).aureos === 4, "Anello d'Oro raddoppia gli Aureos")

// ---- punti, Cura, Sybil, massimi
let p = r.nuovaScheda('P'); p.rango = 2
p = r.assegnaPunto(r.assegnaPunto(p, 'ariete'), 'ariete')
ok(p.segni.ariete === 2 && r.assegnaPunto(p, 'pesci') === p, 'assegnaPunto rispetta i punti liberi')
let s = r.nuovaScheda('S'); s.rango = 3; s.segni.toro = 3
const sy = r.derive(s).sybil
ok(r.derive(r.conSybil(s, 5)).sybilAttuale === sy + 5 && r.derive(r.conSybil(s, -99)).sybilAttuale === 0, 'Sybil oltre la base e mai sotto 0')
ok(r.derive(r.conSybil(r.conSybil(s, -99), 3)).sybilAttuale === 3, 'nessun debito nascosto')
s.usati.cura = -4; ok(r.derive(s).curaAttuale === r.derive(s).cura + 4, 'Cura oltre la base')
const m0 = r.nuovaScheda('M'); m0.rango = 2; m0.segni.pesci = 2
const bm = r.derive(m0).corpoMax
let m1 = r.conMax(m0, 'corpoMax', 1); m1.corpo = bm + 1; m1 = r.conMax(m1, 'corpoMax', -1)
ok(m1.corpo === bm && r.conMax(r.nuovaScheda('Z'), 'menteMax', -1).extra.menteMax === 0, 'massimo modificabile, attuale mai oltre')
const of = r.nuovaScheda('O'); of.rango = 12; for (const k of Object.keys(of.segni)) of.segni[k] = 1
ok(r.derive(r.conMax(of, 'corpoMax', 2)).corpoMax === r.derive(of).corpoMax + 4, 'Ofiuco raddoppia anche i punti a mano')

// ---- dadi di difesa e attacco
const dif = (n, f, m, af = 0, am = 0) => {
  const x = r.derive(con(r.nuovaScheda('x'), n))
  ok(x.dadiDifFisica === f && x.dadiDifMagica === m && x.dadiFisico === af && x.dadiMagico === am, `bonus dadi di ${n}`)
}
dif('Anello di Piume', 3, 0); dif('Cerchio Magico', 0, 3); dif('Sciarpa dei Tarocchi', 3, 3); dif('Cappa Lucente', 0, 0, 3, 3)
let cp = r.nuovaScheda('C'); cp.rango = 3; cp.segni.capricorno = 1
ok(r.derive(cp).dadiDifFisica === 3, 'Pietre Saltellanti: +3 difesa fisica')

// ---- studio, craft, ricette
const og = SHOP_ITEMS.find((i) => i.cat === 'oggetto')
let sc = r.nuovaScheda('S'); sc.rango = 12; sc.segni.toro = 3
const ds = r.derive(sc)
ok(!r.itemNoto(sc, og.id) && r.itemNoto(r.studiaOggetto(sc, ds, og.id), og.id), 'studiare rivela gli effetti')
ok(r.itemNoto(r.conAggiunta(sc, og.id), og.id), 'un oggetto posseduto è noto')
const rA = craft.ARMI_CRAFT_A[0]
let cr = r.nuovaScheda('M'); for (const n of rA.ing) cr = r.conAggiunta(cr, craft.slug(n), 2)
const ids = rA.ing.map(craft.slug)
const t = r.tentaCraft(cr, ids)
ok(t.esito === 'ok' && ids.every((id) => r.qtaIn(t.c, id) === 1) && t.c.ricette.includes(rA.nome), 'craft riuscito: consuma e scopre la ricetta')
ok(r.tentaCraft(cr, ids.slice(0, 2)).c === cr, 'craft sbagliato: non perde niente')
ok(r.RICETTE.every((x) => r.cercaRicetta(x.ing.map(craft.slug))?.nome === x.nome), 'ogni ricetta è univoca')
let rc = r.nuovaScheda('R'); rc.rango = 12; rc.segni.toro = 5; rc.segni.gemelli = 5
const drc = r.derive(rc)
const ra = r.compraRicetta(rc, drc, 'A', 0), rs = r.compraRicetta(rc, drc, 'S', 0)
ok(ra.c.usati.sybil === 1 && rs.c.usati.sybil === 5, 'ricette: arma A 1 Sybil, arma S 5 Sybil')

// ---- Pergamene: l'estrazione a caso avviene quando si ottengono
const { PERGAMENE_ESTRATTE } = await load('/src/data/items.js')
const perg = ITEMS.find((i) => i.id === 'pergamena')
let pz = r.riceviOggetto(r.nuovaScheda('P'), perg, 3, () => 0.99)
ok(PERGAMENE_ESTRATTE.length === 6 && PERGAMENE_ESTRATTE.every((id) => ITEMS.some((i) => i.id === id && i.consumabile)), '6 pergamene consumabili')
ok(r.qtaIn(pz, 'pergamena') === 0 && r.qtaIn(pz, PERGAMENE_ESTRATTE[5]) === 3, 'la Pergamena generica diventa una delle 6 (3 ricevute = 3 estratte)')
const viste = new Set()
for (let k = 0; k < 400; k++) { const q = r.riceviOggetto(r.nuovaScheda('P'), perg); for (const id of PERGAMENE_ESTRATTE) if (r.qtaIn(q, id)) viste.add(id) }
ok(viste.size === 6, 'a caso: escono tutte e 6 le pergamene')
ok(r.estraiPergamena(() => 0).id === PERGAMENE_ESTRATTE[0] && r.estraiPergamena(() => 0.999).id === PERGAMENE_ESTRATTE[5], 'estraiPergamena rispetta il caso')
ok(r.SCOVABILI.length > 0 && r.SCOVABILI.every((i) => ['C', 'B'].includes(i.tier) && !i.aureosAlRicevimento && i.cat === 'materiale'), `Scovare: ${r.SCOVABILI.length} oggetti craft di grado C/B, nessuno che si converte in Aureos`)
ok(r.scovaMateriale(() => 0).id === r.SCOVABILI[0].id && r.scovaMateriale(() => 0.999).id === r.SCOVABILI.at(-1).id, 'Scovare: estrazione a caso dentro l\'elenco')
ok(ITEMS.find((i) => i.id === 'pergamena-scovare').uso === 'scovare', 'Pergamena: Scovare si usa in automatico')
const uso = r.riceviOggetto(r.conRimozione(r.conAggiunta(r.nuovaScheda('S'), 'pergamena-scovare'), 'pergamena-scovare'), r.scovaMateriale(() => 0))
ok(r.qtaIn(uso, 'pergamena-scovare') === 0 && uso.inventario.length === 1 && ITEMS.find((i) => i.id === uso.inventario[0].id).cat === 'materiale', 'usare Scovare: la Pergamena sparisce e arriva un materiale')
ok(!ITEMS.some((i) => i.cat === 'materiale' && i.id === 'pergamena') && r.parseCosti('x').length === 0, 'la Pergamena non è più un materiale')

// ---- tutte le armi/oggetti equipaggiati senza NaN; parsing costi
let nan = 0
for (const it of ITEMS) { const x = con(r.nuovaScheda('x'), it.nome); for (const v of Object.values(r.derive(x))) if (typeof v === 'number' && Number.isNaN(v)) nan++ }
ok(nan === 0, 'nessun NaN equipaggiando ogni oggetto')
ok(r.parseCosti('Bucanuvole (5 Mente)').length === 1 && r.parseCosti('(3 Mente + 3 Corpo)').length === 2, 'costi letti dal testo')
ok(r.costiPagabili([{ n: 5, ris: 'mente' }], true).length === 2, 'Forma dell\'Equilibrio: costi in Mente o Corpo')

// ---- immagini di armi e oggetti: ogni id in elenco ha il file e un oggetto
const elenco = JSON.parse(fs.readFileSync(R + 'src/data/immagini-oggetti.json', 'utf8'))
ok(elenco.every((id) => fs.existsSync(R + `public/images/oggetti/${id}.webp`) && ITEMS.some((i) => i.id === id)), 'immagini oggetti: ogni id ha il file e un oggetto')

// ---- oggetti rinominati: le schede salvate con i vecchi nomi restano valide
const { ID_VECCHI } = await load('/src/data/items.js')
const vec = r.normalizza({ nome: 'V', inventario: [{ id: 'levin', qta: 1, eq: true }, { id: 'daga-della-corrione', qta: 1, eq: false }], noti: { 'pozione-di-veleno': true }, ricette: ['Onix', 'Verglas'], abilita: [{ da: 'Holy', testo: 'x' }], noteAbilita: { 'i:levin': 'nota', 'p:Holy': 'nota2' } })
ok(vec.inventario.map((i) => i.id).join() === 'levin-lance,daga-della-corrosione' && vec.inventario[0].eq === true, 'scheda vecchia: inventario con i nuovi id')
ok(vec.noti['pozione-del-veleno'] && vec.ricette.join() === 'Onix Digger,Verglas' && vec.abilita[0].da === 'Holy Defender', 'scheda vecchia: noti, ricette e abilità aggiornate')
ok(vec.noteAbilita['i:levin-lance'] === 'nota' && vec.noteAbilita['p:Holy Defender'] === 'nota2', 'scheda vecchia: appunti aggiornati')
ok(Object.entries(ID_VECCHI).every(([v, n]) => !ITEMS.some((i) => i.id === v) && ITEMS.some((i) => i.id === n)), 'ogni vecchio id punta a un oggetto esistente e non è più in uso')

// ---- promemoria del backup
const gg = 864e5, ora = Date.now()
const nuovaB = r.nuovaScheda('B')
ok(!r.serveBackup(nuovaB, ora).serve, 'backup: scheda appena creata, nessun promemoria')
ok(r.serveBackup(nuovaB, ora + 31 * gg).serve && r.serveBackup(nuovaB, ora + 31 * gg).mai, 'backup: dopo 30 giorni senza copie compare')
ok(!r.serveBackup({ ...nuovaB, ultimoBackup: new Date(ora).toISOString() }, ora + 10 * gg).serve, 'backup: copia recente, nessun promemoria')
ok(!r.serveBackup({ ...nuovaB, backupRimandato: new Date(ora + 40 * gg).toISOString() }, ora + 31 * gg).serve, 'backup: rimandato, non compare')
ok(r.serveBackup({ ...nuovaB, backupRimandato: new Date(ora + 5 * gg).toISOString() }, ora + 31 * gg).serve, 'backup: finito il rinvio, torna')
ok(typeof r.normalizza({ nome: 'x' }).creata === 'string', 'backup: le schede vecchie ricevono la data di creazione')

// ---- schede vecchie
const vecchia = r.normalizza({ nome: 'V' })
ok(vecchia.noti && vecchia.ricette && vecchia.abilitaPers && vecchia.immagine === null && vecchia.usati.cura === 0, 'scheda vecchia normalizzata')

// ---- schermate
const up = () => {}
let big = r.nuovaScheda('Prova'); big.rango = 12; big.aureos = 500
for (const sg of SEGNI) big.segni[sg.id] = 1
for (const it of ITEMS.slice(0, 40)) big = r.conAggiunta(big, it.id)
big.inventario[0].eq = true
big.bestiario = { scoperti: { ashuz: true, urabrask: true }, rivelati: { ashuz: true } }
const db = r.derive(big)
const g = [{ user_id: 'a', nome: 'Zeta', stato: { rango: 3, corpo: 10, corpoMax: 20, mente: 5, menteMax: 9, armorF: 2, armorM: 1, fato: 1, sybil: 2 } }, { user_id: 'b', nome: 'Alfa', stato: {} }]
const ord = [{ tipo: 'pg', id: 'a', nome: 'Zeta' }, { tipo: 'pg', id: 'b', nome: 'Alfa' }]
const noop = async () => true
const tvB = { attivo: true, pronto: true, giocatori: g, codice: 'ABCD1234', eventi: [{ id: 1, created_at: new Date().toISOString(), testo: 'x' }], azioni: [], inAttesa: [], tavolo: { scontro: true, round: 2, turno: 1, mostri: [{ id: 'midas', qta: 3 }, { id: 'ashuz', qta: 1 }], ordine: ord }, entra: noop, esci: noop, aggiornaTavolo: noop, espelli: noop, nuovoCodice: noop, registraEvento: noop, inviaAzione: noop, rispondiAzione: noop, annullaAzione: noop, pulisciStorico: noop }
const casi = [
  ['Sheet', { c: big, d: db, up, tv: { ...tvB, membro: true } }], ['Zodiac', { c: big, d: db, up }], ['Shop', { c: big, d: db, up }],
  ['Inventory', { c: big, d: db, up }], ['Bestiary', { c: big, d: db, up }], ['Craft', { c: big, d: db, up }], ['Receive', { c: big, d: db, up }],
  ['Tavolo', { c: big, userId: 'a', tv: { ...tvB, membro: true } }], ['Tavolo', { c: big, userId: 'z', tv: { ...tvB, membro: false } }],
  ['Master', { tv: { ...tvB, master: true } }], ['Master', { tv: { ...tvB, master: true, tavolo: { ...tvB.tavolo, scontro: false } } }],
  ['RichiesteMaster', { c: big, d: db, up, tv: { ...tvB, membro: true, azioni: [{ id: 'x', tipo: 'danno', dati: { tipo: 'fisico', n: 12 } }, { id: 'y', tipo: 'sybil', dati: { n: -2 } }] } }],
  ['MasterAzioni', { g: g[0], tv: tvB }], ['Storico', { eventi: tvB.eventi, onPulisci: noop }], ['AssegnaPunto', { c: { ...r.nuovaScheda('x'), rango: 3 }, up }],
]
for (const [n, props] of casi) {
  try {
    const M = (await load(`/src/components/${n}.jsx`)).default
    renderToString(React.createElement(M, props))
  } catch (e) { fail++; console.log('✗ schermata', n, '→', e.message) }
}
const tz = testo(renderToString(React.createElement((await load('/src/components/Zodiac.jsx')).default, { c: (() => { const z = r.nuovaScheda('Z'); z.rango = 4; z.segni.ariete = 1; return z })(), d: r.derive({ ...r.nuovaScheda('Z'), rango: 4, segni: { ...r.nuovaScheda('Z').segni, ariete: 1 } }), up })))
const tb = renderToString(React.createElement((await load('/src/components/Bestiary.jsx')).default, { c: big, d: db, up }))
ok(/class="mappa"/.test(tb) && !/class="luoghi"/.test(tb), 'Bestiario: solo la mappa, senza le altre immagini dei luoghi')
ok(/Muro di Cristallo/.test(tz) && !/Vello d.Oro/.test(tz) && !/prossima soglia/.test(tz) && !/Ofiuco/i.test(tz), 'Zodiaco: nascoste le abilità non sbloccate e nessun indizio su Ofiuco')
const tvM = testo(renderToString(React.createElement((await load('/src/components/Master.jsx')).default, { tv: { ...tvB, master: true } })))
const tvG = testo(renderToString(React.createElement((await load('/src/components/Tavolo.jsx')).default, { c: big, userId: 'a', tv: { ...tvB, membro: true } })))
ok(/Mostri in campo/.test(tvM) && /MIDAS/i.test(tvM) && /3\s*×/.test(tvM), 'mostri in campo: il Master vede tipo e quantità')
ok(/3\s*×/.test(tvG) && /1\s*×/.test(tvG) && /images\/monsters\/midas/.test(renderToString(React.createElement((await load('/src/components/Tavolo.jsx')).default, { c: big, userId: 'a', tv: { ...tvB, membro: true } }))), 'mostri in campo: i giocatori vedono foto e quantità')
ok(!/MIDAS/i.test(tvG), 'mostri in campo: il nome non si vede se il mostro non è stato incontrato')
ok(!/PV/.test(tvG), 'i giocatori non vedono PV dei mostri')
const tuttiNoti = testo(renderToString(React.createElement((await load('/src/components/Shop.jsx')).default, { c: sc, d: ds, up, studi: { oggetti: new Set(ITEMS.map((i) => i.id)), mostri: new Set(), condividi() {} } })))
ok(!/Studia · 1 Sybil/.test(tuttiNoti) && !/sconosciuto/.test(tuttiNoti), 'studio condiviso: se un altro giocatore ha studiato un oggetto, nel Negozio si vede senza pagare')
const BestiaryM = (await load('/src/components/Bestiary.jsx')).default
const bs = (incontrati, master = false) => testo(renderToString(React.createElement(BestiaryM, { c: { ...big, bestiario: { scoperti: {}, rivelati: {} } }, d: db, up, master, studi: { oggetti: new Set(), mostri: new Set(), incontrati: new Set(incontrati), condividi() {}, rimuovi() {} } })))
ok(/ASHUZ/.test(bs(['ashuz'])) && !/ASHUZ/.test(bs([])), 'incontrato in comune: un mostro segnato da un altro si vede con il nome')
ok(!/Nascondi/.test(bs(['ashuz'])) && /Nascondi a tutti/.test(bs(['ashuz'], true)), 'incontrato in comune: solo il Master può nasconderlo a tutti')
const beStud = testo(renderToString(React.createElement((await load('/src/components/Bestiary.jsx')).default, { c: { ...big, bestiario: { scoperti: { ashuz: true }, rivelati: {} } }, d: db, up, studi: { oggetti: new Set(), mostri: new Set(['ashuz']), condividi() {} } })))
ok(/Attacco/.test(beStud) && !/Paga 1 Sybil/.test(beStud.split('ASHUZ')[1]?.slice(0, 200) || ''), 'studio condiviso: i dettagli di un mostro studiato da un altro si vedono')
const th = testo(renderToString(React.createElement((await load('/src/components/Shop.jsx')).default, { c: sc, d: ds, up })))
ok(/sconosciuto/.test(th) && /Studia · 1 Sybil/.test(th), 'Negozio: effetti nascosti con Studia')

await vite.close()
console.log(fail ? `\n${fail} problemi` : 'Tutti i controlli sono passati.')
process.exit(fail ? 1 : 0)
