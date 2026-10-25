// Catalogo di armi e oggetti.
// cat: arma | oggetto | materiale | chiave | abilita
// shop: true = in vendita nel Negozio (prezzo in Aureos)
// dadi: dadiSociale dadiFisico dadiMagico (attacco) dadiDifFisica dadiDifMagica (difesa) si sommano ai bonus delle Caratteristiche
// mods: bonus applicati quando l'oggetto è equipaggiato (categorie e statistiche)
//   categorie: forza resistenza carisma arcano fortuna saggezza
//   statistiche: corpoMax menteMax armorFisica armorMagica fato sybil cura dmgFisici dmgMagici
// req: requisiti per equipaggiare
//   { cat:{forza:1}, stat:{corpoMax:21}, elem:{fuoco:1}, elemDiff:3, aureos:400 }
//   cat = punti minimi in una categoria, stat = statistica minima,
//   elem = numero di segni DIVERSI di quell'elemento con almeno 1 punto,
//   elemDiff = numero di elementi diversi con almeno 1 punto

import {
  MATERIALI, MATERIALI_AUREOS, ALTRI_MATERIALI, ARMI_CRAFT_A, ARMI_CRAFT_S, GALAXIS, slug,
} from './craft.js'

const arma = (nome, tier, o) => ({ cat: 'arma', nome, tier, ...o })
const ogg = (nome, tier, prezzo, desc, o = {}) => ({ cat: 'oggetto', nome, tier, prezzo, shop: true, desc, ...o })

// ---------- ARMI C (5 Danni, 200 Aureos) ----------
const C = (nome, mani, tipo, reqTxt, req, abilita) =>
  arma(nome, 'C', { danni: 5, mani, tipo, reqTxt, req, abilita, prezzo: 200, shop: true })

const ARMI_C = [
  C('Agonia', 1, 'Fisico', 'Corpo 21', { stat: { corpoMax: 21 } }, 'Incanala Dolore: puoi pagare quanti Corpo vuoi per infliggerne altrettanti a un bersaglio (max 10).'),
  C('Bucanuvole', 2, 'Magico', 'Mente 21', { stat: { menteMax: 21 } }, 'Cielo Sereno: colpisci a gran distanza le nuvole, scaricando una catena di fulmini fino a 3 bersagli (5 Mente, 3 Danni Magici a testa).'),
  C('Cercasangue', 2, 'Fisico', '1 Costellazione di Fuoco', { elem: { fuoco: 1 } }, 'Sangue Nero: se hai eliminato un avversario con questa Arma puoi pagare 5 Corpo per colpire un bersaglio infliggendo +3 Danni Fisici.'),
  C('Colossale', 1, 'Fisico', '1 Costellazione di Terra', { elem: { terra: 1 } }, 'Colpo Gigante: puoi pagare 10 Mente per triplicare i Danni Fisici di quest\'Arma per 6 Round.'),
  C('Coppia Gemini', 2, 'Magico', '1 Costellazione d\'Aria', { elem: { aria: 1 } }, 'Colpo Illusorio: puoi pagare 5 Mente per attaccare 2 volte ad ogni attacco per 6 Round.'),
  C('Daga della Corrosione', 1, 'Fisico', '1 Carisma', { cat: { carisma: 1 } }, 'Veleno persistente: il tuo prossimo attacco distrugge l\'Armor avversaria e avvelena all\'80% (3 Mente).'),
  C('Dente di Squalo', 1, 'Magico', '1 Costellazione d\'Acqua', { elem: { acqua: 1 } }, 'Taglia Onde: il tuo fendente taglia ogni materiale (3 Mente).'),
  C('Lama di Cristallo', 1, 'Magico', '1 Fortuna', { cat: { fortuna: 1 } }, 'Punta di Diamante: colpo estremamente accurato sul punto debole, x2 Danni (3 Mente). Ottieni la mappa per gli Altopiani Cristallini.'),
  C('Leone Minore', 1, 'Fisico', '1 Resistenza', { cat: { resistenza: 1 } }, 'Lupus Minor: evoca un lupo spirituale (livello 4) che esegue un tuo ordine o combatte con te (5 Mente).'),
  C('Maschio e Femmina', 2, 'Fisico e Magico', '1 Arcano', { cat: { arcano: 1 } }, 'Maschio è Fisico, Femmina è Magico (3 Mente + 3 Corpo). Turbine: folata che spazza in aria un nemico, 7 Danni Magici.'),
  C('Schiantastelle', 1, 'Magico', '1 Saggezza', { cat: { saggezza: 1 } }, 'Detonazione: accumuli potere magico diminuendo il tuo totale di Mente (min 5, max 15) per rilasciarlo contro uno o più nemici.'),
  C('Tuono e Montagna', 1, 'Fisico', '1 Forza', { cat: { forza: 1 } }, 'Abbattimento: accumuli potere fisico diminuendo il tuo totale di Corpo (min 5, max 15) per rilasciarlo contro uno o più nemici.'),
  arma('Spezzatempo', 'C', { mani: 1, tipo: '—', reqTxt: 'Almeno 400 Aureos', req: { aureos: 400 }, prezzo: 200, shop: true, abilita: 'Time Lapse: non infligge Danno. Pagando 5 Mente accelera o rallenta un oggetto; pagando 5 Corpo accelera o rallenta le ferite di un bersaglio (si rimarginano o si aprono).' }),
]

// ---------- ARMI B (7 Danni, 400 Aureos) ----------
const B = (nome, mani, tipo, reqTxt, req, abilita) =>
  arma(nome, 'B', { danni: 7, mani, tipo, reqTxt, req, abilita, prezzo: 400, shop: true })

const ARMI_B = [
  B('Aquatic', 1, 'Magico', '2 Segni d\'Acqua diversi', { elem: { acqua: 2 } }, 'Prigione d\'Acqua: intrappoli un nemico che non potrà attaccare o difendersi per 1 Round (7 Mente).'),
  B('Creasogni', 1, 'Magico', '3 Saggezza', { cat: { saggezza: 3 } }, 'Chierico: incanali benedizioni; ogni nemico ucciso diventa un cristallo della spada. Ogni 3 cristalli puoi scomporli per far ottenere a un bersaglio 1 Punto Cura.'),
  B('Creatempeste', 1, 'Magico', '2 Segni d\'Aria diversi', { elem: { aria: 2 } }, 'Folgore: scagli un fulmine contro un nemico, 10 Danni Magici (7 Mente).'),
  B('Ember', 1, 'Fisico', '3 Armor', { stat: { armor: 3 } }, 'Fiamma di Metallo: puoi perdere definitivamente 1 Armor per infliggere 12 Danni PURI.'),
  B('Flicker', 1, 'Puro', '3 Fato', { stat: { fato: 3 } }, 'Taglia-Anima: quest\'Arma infligge Danni Puri non prevenibili.'),
  B('Forgiasole', 2, 'Fisico', '2 Segni di Fuoco diversi', { elem: { fuoco: 2 } }, 'SuperNova: puoi pagare 7 Corpo per infliggere 7 Danni Fisici a 3 bersagli.'),
  B('Frangialba', 1, 'Fisico', '3 Forza', { cat: { forza: 3 } }, 'Orizzonte certo: il tuo attacco avrà sicuramente successo (7 Corpo).'),
  B('Frantuma-Valichi', 2, 'Fisico', '2 Segni di Terra diversi', { elem: { terra: 2 } }, 'Smuovi Montagne: raddoppi i Danni del tuo attacco (7 Corpo).'),
  B('Fumo di Morte', 1, 'Magico', '3 Cura', { stat: { cura: 3 } }, 'Assorbi Anima: per ogni nemico che elimini ne assimili l\'essenza, +1 Danno (max 5 nemici).'),
  B('Impero', 1, 'Magico', '1 Forza, 1 Resistenza, 1 Fortuna', { cat: { forza: 1, resistenza: 1, fortuna: 1 } }, 'Benedizione magica: tutti i tuoi bonus sono convertiti per Magico.'),
  B('Lacrima di Diana', 1, 'Magico', '3 Arcano', { cat: { arcano: 3 } }, 'Crisalide Glaciale: congeli un bersaglio, che subisce 10 Danni Magici e ha diff +1 nel difendersi nel prossimo Round (7 Mente).'),
  B('Maglio Demoniaco', 2, 'Fisico', '3 Resistenza', { cat: { resistenza: 3 } }, 'Demon Blood: ogni 5 punti in meno nelle tue riserve +2 Danni Fisici a quest\'Arma.'),
  B('Miraggio', 1, 'Magico', '3 Fortuna', { cat: { fortuna: 3 } }, 'Forma Illusoria: puoi ritirare il tuo attacco (solo se non è un critico) (7 Mente).'),
  B('Pazienza e Impertinenza', 2, 'Fisico e Magico', '3 Sybil', { stat: { sybil: 3 } }, 'Coscienza: puoi decidere quale Danno applicare al nemico.'),
  B('Spiriti-Liberi', 1, 'Fisico', '1 Carisma, 1 Arcano, 1 Saggezza', { cat: { carisma: 1, arcano: 1, saggezza: 1 } }, 'Benedizione Fisica: tutti i tuoi bonus sono convertiti per Fisico.'),
  B('Tulipano', 1, 'Magico', '3 Carisma', { cat: { carisma: 3 } }, 'Bellezza velenosa: il tuo attacco infligge sempre Veleno 2 con 40%.'),
  B('Zenit', 1, 'Fisico', '3 Segni di elementi diversi', { elemDiff: 3 }, 'Sole abbagliante: sbaragli i nemici intorno a te, fino a 5 bersagli subiscono 5 Danni Fisici (7 Corpo).'),
]

// ---------- ARMI A in negozio (9 Danni, 600 Aureos) ----------
const A = (nome, tipo, abilita, mods) =>
  arma(nome, 'A', { danni: 9, mani: 1, tipo, abilita, prezzo: 600, shop: true, ...(mods ? { mods } : {}) })

const ARMI_A = [
  A('Spada di Abbondanza e Carestia', 'Magico', 'Abbondanza: curi un alleato come se avessi Sagg 2 (5 Mente). Carestia: infliggi a un bersaglio Danni pari a un tiro di Cura come se avessi Sagg 2 (5 Corpo).'),
  A('Spada di Casa e Cuore', 'Fisico', 'Casa: scappi da un Combattimento senza perdere nulla (5 Corpo). Cuore: fai ritirare la difesa di un tuo compagno (5 Mente).'),
  A('Spada di Corpo e Mente', 'Magico', 'Unione del corpo e mente: puoi perdere 5 Corpo per guadagnare 5 Mente e viceversa. +2 Danni Magici e Fisici. +2 Armor Fisica e Magica.', { dmgFisici: 2, dmgMagici: 2, armorFisica: 2, armorMagica: 2 }),
  A('Spada di Guerra e Sangue', 'Fisico', 'Vendetta sul Campo: infliggi tanti Danni quanto le ferite a una tua Riserva diviso 2 (5 Mente o Corpo).'),
  A('Spada di Fuoco e Ghiaccio', 'Fisico', 'Fuoco Blu: +5 Danni ai nemici nelle Isole Ghiacciate e nell\'Antica Fucina. Infliggi Danni da Ustione o Congelamento (5 Mente).'),
  A('Spada di Luce e Ombre', 'Magico', 'Eclissi Nera: +10 Danni contro le creature del Chaos World. Infliggi 30 Danni a un bersaglio (10 Mente o Corpo).'),
]

// ---------- ARMI SPECIALI (si ricevono) ----------
const ass = (nome, quando, effetto) =>
  arma(nome, 'Speciale', { origine: 'ricevi', abilita: `Assimilabile. L'arma inscrive una nuova abilità oltre la sua presente. ${quando}, ${effetto}` })

const ARMI_SPECIALI = [
  ass('Presenza di Urabrask', 'Ogni volta che infliggi Danno', 'ottieni altrettanti Aureos.'),
  ass('Aculeo di Sheoldred', 'Ogni volta che infliggi Danno', 'infliggi altrettanti Danni a un bersaglio diverso.'),
  ass('Pienezza di Vorinclex', 'Ogni volta che infliggi Danno', 'puoi curarti della metà del Danno inflitto.'),
  ass('Astuzie di Jin-Gitaxis', 'Ogni volta che infliggi Danno', 'il bersaglio colpito non ti attaccherà alla sua prossima azione.'),
  ass('Miracolo di Elesh-Norn', 'Ogni volta che infliggi Danno', 'tira per Cura come se avessi Saggezza 2.'),
  ass('Lancia della Legione Dispersa', 'Ogni volta che infliggi Danno', 'evoca uno Spettro che combatte al tuo fianco.'),
  ass('Crysis', 'Ogni volta che ti viene inflitto Danno', 'esegui un contrattacco.'),
  ass('Kamikazakaru', 'Ogni volta che ti viene inflitto Danno', 'un avversario bersaglio subisce metà dei Danni subiti.'),
  ass('Patriarch', 'Ogni volta che ti viene inflitto Danno', 'subisci solo metà di quel Danno.'),
  ass('Roar', 'Ogni volta che ti viene inflitto Danno', 'un bersaglio avrà +2 Diff a colpirti nel prossimo attacco.'),
  ass('Verdict', 'Ogni volta che ti viene inflitto Danno', 'un bersaglio si cura della metà dei Danni.'),
  ass('Winterfang', 'Ogni volta che ti viene inflitto Danno', 'un bersaglio non potrà eseguire un\'azione.'),
]

const OGGETTI_CHIAVE = [
  { cat: 'chiave', nome: 'Senza-Tempo', tier: 'Chiave', desc: 'Parte di una strana chiave: non sembra avere alcun utilizzo.' },
  { cat: 'chiave', nome: 'Senza-Spazio', tier: 'Chiave', desc: 'Parte di una strana chiave: non sembra avere alcun utilizzo.' },
  { cat: 'chiave', nome: 'Senza-Vita', tier: 'Chiave', desc: 'Parte di una strana chiave: non sembra avere alcun utilizzo.' },
]

// ---------- ARMI S (15 Danni PURI, una mano) ----------
const ARMI_S_RARE = [
  arma('DivoraEterni', 'S', { danni: 15, mani: 1, tipo: 'Puro', origine: 'ricevi', abilita: 'Divora Mondo (1 volta per Sessione): elimini un bersaglio e ne acquisisci tutti i punti nelle tue statistiche.' }),
  arma('Rosa di Sangue', 'S', { danni: 15, mani: 1, tipo: 'Puro', origine: 'ricevi', abilita: 'Rosso Sangue (1 volta per Sessione): elimini 3 bersagli che hai ferito almeno una volta.' }),
  arma('Spada del Chaos', 'S', { danni: 15, mani: 1, tipo: 'Puro', origine: 'ricevi', abilita: 'Reset Universe (1 volta per Sessione): puoi resettare l\'intero Universo.' }),
]

// ---------- ARMI DELLO ZODIACO (11 Danni, 5 punti in una Costellazione) ----------
const Z = (nome, segno, mani, tipo, abilita) =>
  arma(nome, 'Zodiaco', { danni: 11, mani, tipo, segno, origine: 'zodiaco', reqTxt: `5 punti in ${segno[0].toUpperCase() + segno.slice(1)}`, abilita })

const ARMI_ZODIACO = [
  Z('Hamal', 'ariete', 1, 'Magico', 'Intercettazione amicale: ogni volta che un tuo alleato sta per essere colpito puoi tirare tu per difenderlo.'),
  Z('Aldebaran', 'toro', 2, 'Fisico', 'Presenza Possente: ogni volta che subisci un Danno, ne infliggi altrettanto a un bersaglio.'),
  Z('Castorex', 'gemelli', 2, 'Fisico e Magico', 'Toccata e Fuga: ogni volta che eviti con successo un Danno puoi eseguire un counter.'),
  Z('Al Tarf', 'cancro', 2, 'Magico', 'Mangia Vita: ogni volta che elimini un nemico ne aspiri la vita e tiri per Cura.'),
  Z('Regulus', 'leone', 1, 'Fisico', 'Terrore del Sovrano: ogni volta che attacchi, un altro nemico non si difenderà al prossimo tuo attacco.'),
  Z('Spica', 'vergine', 1, 'Puro', 'Bacio della Donzella: ogni volta che un tuo alleato sta per essere colpito, può prima tirare per Cura.'),
  Z('Zubeneschamali', 'bilancia', 2, 'Fisico e Magico', 'Dare e Avere: ogni volta che eviti con successo un Danno aumenta Danno +1 di quest\'Arma.'),
  Z('Antares', 'scorpione', 1, 'Fisico', 'Guadagno Mancato: ogni volta che non colpisci, guadagni un punto di Fato o Cura o Sybil.'),
  Z('Kaus', 'sagittario', 2, 'Magico', 'Frecce Fantasma: ogni volta che colpisci un bersaglio, un altro bersaglio subisce altrettanti Danni.'),
  Z('Deneb', 'capricorno', 1, 'Fisico', 'Tripla Lama: ogni volta che attacchi hai anche questa Arma equipaggiata.'),
  Z('Sadalsuud', 'acquario', 1, 'Magico', 'Occhio Artico: ogni volta che non colpisci, quel bersaglio avrà +3 al DADO di ATTACCO per chiunque lo colpisca (perenne).'),
  Z('Kullat Nunu', 'pesci', 2, 'Fisico e Magico', 'Inganno mortale: ogni volta che elimini un nemico, puoi eliminarne un altro dello stesso Rango.'),
]

// ---------- ARMI S DEI 4 ELEMENTI (1 punto in tutti e 3 i segni dell'elemento) ----------
const ARMI_ELEMENTI = [
  arma('Aegeon Fendi-Fulmini', 'SS', { danni: 15, tipo: 'Magico', origine: 'elemento', elemento: 'aria', reqTxt: '1 punto in Gemelli, Bilancia e Acquario', abilita: 'Fendi-Fulmini: colpisci quattro bersagli con un attacco infliggendo 5 Danni Magici (3 Mente).' }),
  arma('Gallia Manifestazione di Guerra', 'SS', { danni: 15, tipo: 'Fisico', origine: 'elemento', elemento: 'terra', reqTxt: '1 punto in Toro, Vergine e Capricorno', abilita: 'Manifestazione della Guerra: puoi raddoppiare i danni che infliggi con quest\'arma per 6 Round (10 Corpo).' }),
  arma('Titan Genesi del Dio Celeste', 'SS', { danni: 8, tipo: 'Fisico e Magico', origine: 'elemento', elemento: 'acqua', reqTxt: '1 punto in Cancro, Scorpione e Pesci', abilita: 'Attacca sempre due volte: 8 Danni uno fisico, l\'altro magico. Genesi del Dio Celeste: invochi una creatura di livello 7 che combatterà impugnando Titan per 5 Round (10 Mente).' }),
  arma('Hyperion Completo Annientamento', 'SS', { danni: 20, tipo: 'Fisico o Magico', origine: 'elemento', elemento: 'fuoco', reqTxt: '1 punto in Ariete, Leone e Sagittario', abilita: 'Infligge 20 Danni fisici o magici ma anche 4 Danni corrispondenti al suo possessore, non prevenibili. Completo Annientamento: se uccidi un nemico con Hyperion puoi attaccare di nuovo infliggendo il doppio dei Danni, se ne elimini un altro il quadruplo (x2, x4, x8...) ma ogni volta i Danni che subirai aumentano (4-8-16...).' }),
  arma('Omnipotent', 'SS', { origine: 'ricevi', tipo: 'Puro', abilita: 'Oggetto Chiave per la Storia, craft con le 4 armi (Aegeon + Gallia + Hyperion + Titan). Falciatore universale: puoi eliminare per sempre un Monarca.' }),
]

// ---------- ARMI DA CRAFT ----------
const ARMI_CRAFT = [
  ...ARMI_CRAFT_A.map((r) => arma(r.nome, 'A', { danni: 10, mani: 1, tipo: r.tipo, origine: 'craft', abilita: r.abilita })),
  ...ARMI_CRAFT_S.map((r) =>
    arma(r.nome, 'S', { danni: 12, mani: 1, tipo: r.tipo, origine: 'craft', abilita: `${r.abilita} Abilità perenne: ${r.perenne}.` }),
  ),
  arma(GALAXIS.nome, 'S', { tipo: GALAXIS.tipo, origine: 'ricevi', abilita: `${GALAXIS.abilita} (Si ottiene unendo: ${GALAXIS.ing.join(', ')}; lo assegna il Master)` }),
]

// ---------- OGGETTI C (80-300) ----------
const OGGETTI_C = [
  ogg('Amuleto Selvaggio', 'C', 150, '+1 Forza, +1 Resistenza.', { mods: { forza: 1, resistenza: 1 } }),
  ogg('Amuleto delle Rune', 'C', 150, '+1 Saggezza, +1 Arcano.', { mods: { saggezza: 1, arcano: 1 } }),
  ogg('Amuleto di Fuoco', 'C', 150, 'Puoi lanciare una "Palla di Fuoco": 5 Mente, 8 Danni Magici. Sei resistente al Fuoco e non subisci Danni da esso. (Mappa Antica Fucina se hai anche Anello del Calore)'),
  ogg('Amuleto di Cristallo', 'C', 150, 'Difesa naturale contro la Magia: Armor Magica +3. Non puoi essere incantato, confuso, terrorizzato o manipolato.', { mods: { armorMagica: 3 } }),
  ogg("Amuleto dell'Equilibrio", 'C', 150, '+5 Mente MAX, +5 Corpo MAX. Equilibrio: +3 nei DADI nel muoverti e nella difesa a Corpo.', { mods: { menteMax: 5, corpoMax: 5, dadiDifFisica: 3 } }),
  ogg('Anello del Calore', 'C', 150, 'Incanali il fuoco nelle tue Armi: +3 Danni Magici. Sei resistente al Fuoco e non subisci Danni da esso. (Mappa Antica Fucina se hai anche Amuleto di Fuoco)', { mods: { dmgMagici: 3 } }),
  ogg('Anello di Guardia', 'C', 150, '+2 Armor Fisica.', { mods: { armorFisica: 2 } }),
  ogg('Anello di Perla Rossa', 'C', 150, '+1 Carisma, +1 Fortuna.', { mods: { carisma: 1, fortuna: 1 } }),
  ogg('Anello di Piume', 'C', 150, '+3 ai DADI in DIFESA di Corpo. Levitare: puoi alzarti da terra per pochi minuti quasi potessi volare.', { mods: { dadiDifFisica: 3 } }),
  ogg("Anello d'Oro", 'C', 150, 'Ottieni il doppio degli Aureos che ottieni combattendo Mostri.'),
  ogg('Anello Gelato', 'C', 150, 'Difesa naturale contro gli attacchi elementali: Armor Magica +3. (Ottieni la mappa delle Isole Ghiacciate)', { mods: { armorMagica: 3 } }),
  ogg('Anello Reale', 'C', 150, 'Puoi impartire "Comando" pagando 5 Mente: il bersaglio eseguirà un comando che non danneggi sé stesso. +1 Armor Fisica.', { mods: { armorFisica: 1 } }),
  ogg('Tonico', 'C', 80, 'Bevendolo ottieni +1 Sybil / +1 Fato / +1 Cura.', { consumabile: true }),
  ogg('Pozione del Veleno', 'C', 100, '80% di avvelenare il bersaglio se la beve, 50% se colpito da Armi impregnate con essa.', { consumabile: true }),
  ogg('Pozione del Drago', 'C', 100, '+5 Danni Fisici. (Ottieni la mappa della Valle Decadente)', { consumabile: true }),
  ogg('Pozione Rossa', 'C', 40, 'Tira 2d4 e ti curi di altrettanti punti.', { consumabile: true }),
  ogg('Elettro Liquido', 'C', 100, '+5 Danni Magici.', { consumabile: true }),
  ogg('Armatura Alata', 'C', 250, '(Item Agg) +2 Armor Fisica. Levitare: puoi alzarti da terra per pochi minuti quasi potessi volare.', { mods: { armorFisica: 2 } }),
  ogg('Cerchio Magico', 'C', 250, '(Item Agg) +3 ai DADI in DIFESA MAGICA e +3 Armor Magica. (Ottieni la mappa Città dei Morti)', { mods: { armorMagica: 3, dadiDifMagica: 3 } }),
  ogg('Dadi Incantati', 'C', 100, '20% di critico nei prossimi tuoi 6 Round, +1 Fato.', { consumabile: true }),
  ogg('Pietra del Ritorno', 'C', 150, 'Ti permette di scappare dal dungeon corrente senza perdere Loot.', { consumabile: true }),
  ogg('Sciarpa dei Tarocchi', 'C', 250, '(Item Agg) +3 ai DADI di DIFESA sia FISICA che MAGICA.', { mods: { dadiDifFisica: 3, dadiDifMagica: 3 } }),
  ogg('Scudo Cuore di Rubino', 'C', 250, '+2 Armor Fisica, +3 Armor Magica.', { mods: { armorFisica: 2, armorMagica: 3 } }),
]

// ---------- OGGETTI B (350-700) ----------
const OGGETTI_B = [
  ogg('Ambra Pura', 'B', 350, '(Amuleto) Sei fortunato: +3 ai DADI di DIFESA FISICA e MAGICA. +1 Fortuna.', { mods: { fortuna: 1, dadiDifFisica: 3, dadiDifMagica: 3 } }),
  ogg('Amuleto del Vagabondo', 'B', 350, 'Sei immune agli status.'),
  ogg('Amuleto dello Spirito Naga', 'B', 350, 'Puoi evocare una serpe che combatta per te. Sei immune al Veleno.'),
  ogg('Anello Celeste', 'B', 350, '+2 Arcano. Puoi lanciare "Fulmine": 5 Danni Magici su 2 bersagli (7 Mente).', { mods: { arcano: 2 } }),
  ogg('Anello dei Grani', 'B', 350, 'Puoi subire 15 Danni aggiuntivi prima di morire. Poi distruggi questo oggetto.', { consumabile: true }),
  ogg('Anello del Drago di Giada', 'B', 350, '+2 Forza.', { mods: { forza: 2 } }),
  ogg('Anello del Mal Comune', 'B', 350, 'Tu e un bersaglio condividete i Danni del prossimo Round che subiresti (5 Mente).'),
  ogg('Anello della Protezione', 'B', 450, '+3 Armor Fisica.', { mods: { armorFisica: 3 } }),
  ogg('Anello della Stella Cadente', 'B', 500, 'Puoi resettare tutti i tuoi punti acquisiti (categorie e Costellazioni). Il Rango rimane invariato. Poi distruggi questo item.', { consumabile: true, uso: 'reset-segni' }),
  ogg('Anello delle Tempeste', 'B', 450, '+3 Danni Magici che infliggi.', { mods: { dmgMagici: 3 } }),
  ogg('Armatura Mentale', 'B', 450, '+3 Armor Magica.', { mods: { armorMagica: 3 } }),
  ogg('Campana Angelica', 'B', 400, '(Amuleto) +2 Cura.', { mods: { cura: 2 } }),
  ogg('Candela Nera', 'B', 500, 'Puoi spegnere questa candela per rianimare un morto. Poi distruggi questo oggetto.', { consumabile: true }),
  ogg('Cappa Arcobaleno', 'B', 350, '(Item Agg) +3 ai DADI nella DIFESA FISICA, puoi evitare un Danno (7 Corpo).', { mods: { dadiDifFisica: 3 } }),
  ogg('Cappa Lucente', 'B', 350, '(Item Agg) +3 ai DADI di ATTACCO FISICO e MAGICO, puoi evitare un Danno (7 Mente).', { mods: { dadiFisico: 3, dadiMagico: 3 } }),
  ogg('Ingarbuglia Incubi', 'B', 600, 'Chi lo beve osserva l\'oscurità più profonda, un\'esperienza simile alla morte.', { consumabile: true }),
  ogg('Koi di Luce', 'B', 400, '(Item Agg) Critico +30%. Puoi evocare la Karpa che ti cura nel tempo per 3 Round.'),
  ogg('Perle del Riflesso', 'B', 350, '(Amuleto) Rifletti al nemico il prossimo Danno che subiresti (7 Mente).'),
  ogg('Pozione di Vita', 'B', 200, 'Cura completamente una tua riserva.', { consumabile: true }),
  ogg('ScriviPensiero', 'B', 500, 'Puoi modificare il Danno di un\'Arma da Fisico a Magico o viceversa, oppure il costo di una Tecnica.', { consumabile: true }),
  ogg('Scudo di Forza', 'B', 700, '(Item Agg) Occupa due mani. Tutti i Danni che subisci vengono inflitti a un altro bersaglio a tua scelta. +5 Armor Fisica, +5 Armor Magica.', { mods: { armorFisica: 5, armorMagica: 5 } }),
  ogg('The dei Dieci Sapori', 'B', 500, 'Puoi spostare un tuo punto caratteristica, oppure scambiare 5 punti tra Corpo e Mente, oppure 2 punti tra Fato/Sybil/Armor/Cura.', { consumabile: true }),
  ogg('Totem della Rana', 'B', 350, '(Amuleto) +3 ai DADI di DIFESA FISICA e MAGICA. Sei immune al Veleno.', { mods: { dadiDifFisica: 3, dadiDifMagica: 3 } }),
]

// ---------- OGGETTI A (550-900) ----------
const OGGETTI_A = [
  ogg('Amuleto del Gatto di Giada', 'A', 550, 'Ogni volta che tiri il tuo primo 1 nella Sessione, ignoralo e ottieni un 20 naturale.'),
  ogg('Amuleto del Sole Infranto', 'A', 550, 'Acquisisci la potenza del sole: per 2 Round +6 Danni sia Magici che Fisici e +3 Armor sia Magica che Fisica (una volta per Combattimento).'),
  ogg('Amuleto di Ossa', 'A', 550, 'Puoi imbrigliare l\'anima di un nemico appena ucciso, ottenendo diversi bonus in base al suo Grado.'),
  ogg("Anello d'Argento Liquido", 'A', 550, 'Assimilazione: questo oggetto ottiene le Abilità di qualsiasi altro oggetto o Arma.'),
  ogg('Anello dei Tre Desideri', 'A', 900, 'Puoi esprimere 3 Desideri, dopo di che distruggi questo Item.', { consumabile: true }),
  ogg('Anello del Cavaliere Nero', 'A', 550, 'Evochi l\'anima del Cavaliere Nero che combatterà al tuo fianco.'),
  ogg('Anello del Cosmo', 'A', 550, '+5 Danni Magici e +5 Armor Magica.', { mods: { dmgMagici: 5, armorMagica: 5 } }),
  ogg('Anello del Volere', 'A', 550, 'Puoi manipolare un Mostro di Grado C o inferiore (8 Mente).'),
  ogg('Anello della Corona', 'A', 550, '+5 Danni Fisici e +5 Armor Fisica.', { mods: { dmgFisici: 5, armorFisica: 5 } }),
  ogg('Anello Polimorfo', 'A', 550, 'Puoi far diventare questo Item un qualunque altro Item/Arma che conosci.'),
  ogg('Armatura di Stelle', 'A', 600, '(Item Agg) +2 Forza, +2 Arcano, +2 Resistenza.', { mods: { forza: 2, arcano: 2, resistenza: 2 } }),
  ogg("Borsa dell'Alba", 'A', 600, '(Item Agg) Usa 3 oggetti da Craft per ottenere una Pozione Rossa, o 5 per un Tonico, o 8 per una Pozione di Vita, o 15 per un Elisir.'),
  ogg('Cinque Essenze', 'A', 800, 'Ottieni +2 a una qualunque Costellazione (aumenta perennemente, dando i BONUS). Poi distruggi questo Item.', { consumabile: true, uso: 'cinque-essenze' }),
  ogg('Corona del Teschio', 'A', 600, '(Item Agg) Sei immune agli status e al controllo mentale. +5 Armor Magica.', { mods: { armorMagica: 5 } }),
  ogg('Cosmo Liquido', 'A', 900, 'Ottieni +2 XP, poi distruggi questo Item (si applica da solo quando lo usi).', { consumabile: true, xp: 2 }),
  ogg('Elisir', 'A', 400, 'Cura completamente tutte le tue Riserve.', { consumabile: true }),
  ogg('Fiore senza Fiore', 'A', 450, 'Puoi perdere x punti Corpo o Mente e un bersaglio ne guadagna altrettanti.', { consumabile: true }),
  ogg('Galassia Portatile', 'A', 450, 'Cambi Dungeon, qualunque esso sia, senza perdere Loot o Aureos: verrai trasportato in un Dungeon di Grado inferiore, in un ambiente diverso.', { consumabile: true }),
  ogg('Luna Nera', 'A', 550, '(Amuleto) Maledizione della Prima Luna: infliggi a 5 bersagli 5 Danni Puri (8 Corpo o 8 Mente).'),
  ogg('Scudo di Cristalli', 'A', 600, '(Item Agg) Scegli Magico o Fisico: sei immune a quei Danni per 3 Round. Una sola volta per Combattimento.'),
  ogg('Vaso di Pandora', 'A', 800, 'Un antico potere dormiente (rilascia i 20 Mali).', { consumabile: true }),
  ogg("Giara dell'Annientamento", 'A', 500, '(Item Agg) Elimini un nemico ma perdi definitivamente una caratteristica che abbia almeno 1 punto.'),
]

// ---------- MATERIALI ----------
const mat = (nome, tier, extra = {}) => ({ cat: 'materiale', nome, tier, ...extra })
const MATERIALI_ITEMS = [
  ...Object.entries(MATERIALI).flatMap(([tier, lista]) => lista.map((n) => mat(n, tier))),
  ...Object.entries(MATERIALI_AUREOS).map(([n, au]) =>
    mat(n, au === 50 ? 'D' : 'C', { aureosAlRicevimento: au, desc: `Non si combina: appena ottenuto vale ${au} Aureos.` }),
  ),
  ...ALTRI_MATERIALI.map((n) => mat(n, 'Speciale')),
]

// ---------- ABILITÀ UNICHE dei mostri di Grado A (le dà il Master a chi li uccide) ----------
const ABILITA_UNICHE = [
  ['Crepa del Fabbro', 'Puoi rompere un oggetto o Arma indifferente dalla distanza, o l\'Armor di una creatura (7 Corpo).'],
  ['Tripla Fauce', 'Puoi colpire 3 nemici ad ogni tuo attacco (10 Corpo).'],
  ['Benedizione dei Morti', 'Il prossimo Danno che subisci ti cura invece della metà dei Danni (10 Mente).'],
  ['Voce del Mare', 'Terrorizzi tutti i nemici sul campo che non attaccheranno per questo turno (10 Mente).'],
  ['Genesi del Gelo', 'Infliggi tanti Danni Magici quanti quelli che hai subito (7 Mente).'],
  ['Crescita Spropositata', 'Il tuo prossimo attacco infligge 3 x Danni (10 Corpo).'],
].map(([nome, desc]) => ({ cat: 'abilita', nome, tier: 'A', desc: `Abilità UNICA. ${desc}` }))

// ---------- PERGAMENE (le dà il Master) ----------
// "Pergamena" è l'oggetto generico: quando la si ottiene si trasforma subito in una delle 6 a caso (vedi riceviOggetto).
// Le 6 sono consumabili: l'effetto lo applica il giocatore a mano.
const PERGAMENE_EFFETTI = [
  ['Fortuna', '+1 Fato e +100% di critico alla prossima azione.'],
  ['Analisi', '+1 Sybil.'],
  ['Difesa', 'Eviti un attacco.'],
  ['Scovare', 'Ottieni un oggetto di craft almeno Raro (da grado C in su): lo estrae l\'app, a caso, quando la usi.', { uso: 'scovare' }],
  ['Colpo avverso', 'Infliggi tanti Danni quanti sono i Danni subiti da una tua Riserva.'],
  ['Cura', 'Cura completamente una delle tue Riserve.'],
]
const PERGAMENE = [
  ogg('Pergamena', 'Speciale', 0, 'Quando la ottieni si trasforma in una delle 6 Pergamene, a caso.', { shop: false, consumabile: true, uso: 'apri-pergamena' }),
  ...PERGAMENE_EFFETTI.map(([n, d, extra]) => ogg(`Pergamena: ${n}`, 'Speciale', 0, d, { shop: false, consumabile: true, ...extra })),
]
export const PERGAMENE_ESTRATTE = PERGAMENE_EFFETTI.map(([n]) => slug(`Pergamena: ${n}`))

const TUTTI = [
  ...ARMI_C, ...ARMI_B, ...ARMI_A, ...ARMI_SPECIALI, ...OGGETTI_CHIAVE, ...ARMI_S_RARE, ...ARMI_ZODIACO,
  ...ARMI_ELEMENTI, ...ARMI_CRAFT, ...OGGETTI_C, ...OGGETTI_B, ...OGGETTI_A, ...MATERIALI_ITEMS, ...PERGAMENE, ...ABILITA_UNICHE,
]

// Nomi cambiati in seguito (vecchio → nuovo): servono per aggiornare le schede già salvate
export const RINOMINATI = {
  "Levin": "Levin Lance",
  "Onix": "Onix Digger",
  "Green": "Green Rings",
  "Iguana": "Sleeping Iguana",
  "Dry Caliche": "Dry Chalice",
  "Amber": "Amber Sword",
  "Volcano": "Volcano Forgid",
  "Springtide": "Springtide Glass",
  "Phantom": "Phantom Needle",
  "Holy": "Holy Defender",
  "Daga della Corrione": "Daga della Corrosione",
  "Astuzie di Gin-Jitaxias": "Astuzie di Jin-Gitaxis",
  "Pozione di Veleno": "Pozione del Veleno",
  "Thè dai Dieci Sapori": "The dei Dieci Sapori",
}
export const ID_VECCHI = Object.fromEntries(Object.entries(RINOMINATI).map(([o, n]) => [slug(o), slug(n)]))

// Dove si indossa un oggetto: 1 Anello, 1 Amuleto e 1 Oggetto aggiuntivo al massimo. Le armi SS contano come a due mani.
export const SLOT_NOME = { anello: 'Anello', amuleto: 'Amuleto', agg: 'Item aggiuntivo' }
export const LIMITE_SLOT = { anello: 1, amuleto: 1, agg: 1 }
const slotDi = (i) => {
  if (i.cat !== 'oggetto' || i.consumabile) return undefined
  if (/^Anello/i.test(i.nome)) return 'anello'
  if (/^Amuleto/i.test(i.nome) || /\(Amuleto\)/i.test(i.desc || '')) return 'amuleto'
  return 'agg'
}

export const ITEMS = TUTTI.map((i) => {
  const o = { ...i, id: slug(i.nome) }
  const slot = slotDi(i)
  if (slot) o.slot = slot
  if (i.cat === 'arma' && i.tier === 'SS') o.mani = 2
  return o
})
export const ITEMS_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]))
export const itemByName = (nome) => ITEMS_BY_ID[slug(nome)]
export const SHOP_ITEMS = ITEMS.filter((i) => i.shop)

// Doppioni di id = errore di trascrizione
const visti = new Set()
for (const i of ITEMS) {
  if (visti.has(i.id)) console.warn('[data] id duplicato:', i.id)
  visti.add(i.id)
}
