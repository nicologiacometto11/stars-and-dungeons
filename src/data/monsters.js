// Bestiario. Formato di ogni riga:
// NOME | Ambiente | Grado | PV | D (minimo sul dado per colpirlo) | Aureos | Drop (separati da ;) | Abilità
// Per cambiare un mostro basta modificare la riga. Le immagini vanno in public/images/monsters/<id>.webp (id = nome in minuscolo con trattini).
// Costo in Sybil per studiare un mostro: 1 per tutti (SYBIL_COSTO).
// Grado A+ = mostri illeggibili: solo immagine, nessuna statistica né studio.

import { slug } from './craft.js'

export const AMBIENTI = ['Città dei Morti', 'Isole Ghiacciate', 'Foresta Fungina', 'Valle Decadente', 'Antica Fucina', 'Altopiani Cristallini']

export const GRADI = ['F', 'E', 'E+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S']

// Confermato dal Master: 1 Sybil per tutti i mostri.
export const SYBIL_COSTO = 1

const GCD = 'Frammento Gemma Dimensionale'

const RAW = `
ASHUZ|Città dei Morti|F|5|9|2||Attacco 2F. Morso Velenoso: 20% avvelenare, 2M
GRAVEGOLEM|Città dei Morti|F|10|6|5||Armor 2. Attacco 4F. Vanga Lenta: attacca solo un bersaglio ogni due turni
FROSS|Isole Ghiacciate|F|5|9|3||Attacco 1M. Palla di Neve: colpisce 2 nemici
LIZARDMEN|Isole Ghiacciate|F|5|9|3||Attacco 2F. Trancio Congelante: 20% il colpito salta il turno
FUNGUS|Foresta Fungina|F|8|9|4||Attacco 3F. Evoca Saprolingio ogni 2 Turni
SAPROLINGIO|Foresta Fungina|F|3|6|1||Attacco 1F
ONGROOVE|Foresta Fungina|F|6|9|3||Attacco 2M
TRIBUKS|Valle Decadente|F|5|9|2||Attacco 2F. Morso 4F
TRIBUKS 2|Valle Decadente|F|7|9|3||Attacco 3F. Armor 1
VELOCIX|Antica Fucina|F|5|9|2||Attacco 2F. Balzo letale 2M
VIGORITE|Antica Fucina|F|8|12|5||Attacco 3F. Colpo caricato 3M
HANS|Altopiani Cristallini|F|5|9|3||Attacco 2M. Spore: stordisce, 30% di saltare il turno
YUKHAV|Altopiani Cristallini|F|6|9|5||Attacco 3F. Rinascita: 20% di tornare in vita
ATLANTIDEO|Isole Ghiacciate|E|15|12|8|Fibra d'Acqua|Attacco 3M. Lancio del Tridente 5F
FLYSTORM|Isole Ghiacciate|E|12|12|6|Piuma Arcobaleno|Attacco 3F. In volo: diff +1 a colpire
RURR|Città dei Morti|E|17|12|6|Fibra di Metallo|Attacco 3F. Armor 2
FORGE GUARDIAN|Città dei Morti|E|15|12|7|Cristallo|Attacco 3M. Crea Golem (come lui ma con 10 PV, -5 a volta)
ARACNIDE|Foresta Fungina|E|14|12|6|Tela di Seta|Attacco a distanza 4F. Veleno 30%
MANGROVIA|Foresta Fungina|E|16|12|7|Corteccia magica|Attacco 3F. Petali danzanti 3M
WURM|Valle Decadente|E|16|12|8|Vertebra morbida|Attacco 4F. Armor 2. Regen 1
SANDTHOOT|Valle Decadente|E|16|12|7|Dente di sabbia|Attacco 5F. Balzo dal terreno 5F (-1 Diff)
BITUM|Antica Fucina|E|14|12|6|Inchiostro vivo|Attacco 2M. Veleno 30%. Copia di sé con stessi danni
BOW|Antica Fucina|E|10|12|5|Goccia di Resina|Se non viene ucciso si fa esplodere infliggendo 5M a tutti
GANRAK|Altopiani Cristallini|E|18|12|7|Pelliccia Rosa|Armor 2. Dopo che viene colpito raddoppia i Danni che ha subito
TRIALA|Altopiani Cristallini|E|16|12|7|Maschera di Ossa|Vola: +1 diff a colpire in F. Attacco 4F. Catena di Fulmini 2M a tutti
LIGHTOUND|Isole Ghiacciate|E+|20|15|10|Scheggia di Tuono;${GCD} C|Attacco 4F. Folgore 3M. Forma elettrica: Armor 2 M, Danni +1
SECRET KEEPER|Città dei Morti|E+|20|15|10|Chiave della Città;${GCD} C|Armor 3. Attacco 5F. Danza Macabra: colpisce tutti 3F
VELENOCNE|Foresta Fungina|E+|20|15|10|Tossina pura;${GCD} C|Attacco 5F. Veleno 40%. Pungiglioni: 2 bersagli 3M
MANTICORA|Valle Decadente|E+|20|15|10|Ali di Manticora;${GCD} C|Attacco 3M e/o 3F. Veleno 20%. Soffio di Fuoco 5M
LUZARRAK|Antica Fucina|E+|20|15|10|Ferro Etereo;${GCD} C|Armor 2M. Attacco 3M. Catene di Pietra: blocca un nemico 4F
TROLL|Altopiani Cristallini|E+|20|15|10|Grasso Spesso;${GCD} C|Armor 2. Regen 2. Attacco 5F. Sradica-alberi 3F a tutti
B DELTA|Isole Ghiacciate|D|25|15|12|Pelliccia bestia;Zanna selvaggia|Attacco 5F. Armor 2. Scuoti-Terra 3F a tutti. Pilastro ghiacciato 8M
VINCULUM|Isole Ghiacciate|D|20|15|10|Bende fantasma|Attacco 5M. Assorbi magia (metà danni magici). Incanala Caos 3M a tutti
B BETA|Città dei Morti|D|25|15|12|Pelliccia bestia;Zanna selvaggia|Attacco 5F. Armor 2. Scuoti-Terra 3F a tutti. Scaglia ossa 5M
XAZLAHR|Città dei Morti|D|20|15|10|Zampa recisa|Attacco 3F a tutti. Maledizione 8M. Regen 2. Sangue Vorace 3M a tutti
B LAMBDA|Foresta Fungina|D|25|15|12|Pelliccia bestia;Zanna selvaggia|Attacco 5F. Veleno 40%. Armor 2. Scuoti-Terra 3F a tutti. Aculeo Velenoso 8F, Veleno 60%
PACU|Foresta Fungina|D|20|15|10|Bava aliena|Attacco 6F. Armor 3. Bava alienante 4M a tutti, 30% Paralisi. Rullo Feroce 8F a un bersaglio fermo
B EPSILON|Valle Decadente|D|25|15|12|Pelliccia bestia;Zanna selvaggia|Attacco 5F. Armor 2. Scuoti-Terra 3F a tutti. Coda a Squarcio 3M a tutti
VIRIDE|Valle Decadente|D|20|15|10|Roccia di Malachite|Attacco 6F. Armor 2. Zanne di Pietra 10F
B ALPHA|Antica Fucina|D|25|15|12|Pelliccia bestia;Zanna selvaggia|Attacco 5F. Armor 2. Scuoti-Terra 3F a tutti. Crea Fuoco 4M a tutti
SHAVASH|Antica Fucina|D|20|15|10|Anello arcano|Attacco 5M. Catene d'Oro 5M a tutti. Sfera epocale 8F
B GAMMA|Altopiani Cristallini|D|25|15|12|Pelliccia bestia;Zanna selvaggia|Attacco 5F. Armor 2. Scuoti-Terra 3F a tutti. Zanne Cerulee 5M a tutti
MIDAS|Altopiani Cristallini|D|20|15|10|Collana d'Oro|Attacco 5F. Armor 3. Regen 2. Sfere cromate 4F a tutti. Crisi d'Oro 8M
MAMMOTH|Isole Ghiacciate|D+|30|18|15|Zanna Antica;Proboscide Forte|Attacco 8F. Armor 2. Regen 2. Zanna Potente 5F a tutti. Valanga 3M a tutti
GIUDICATORE|Città dei Morti|D+|30|18|15|Corazza aurea;Giudizio in bottiglia|Attacco 8F. Armor 5. Giudizio 10M poi ricarica. Grido di paura (+1 diff prox tiro)
CHIMERA|Foresta Fungina|D+|30|18|15|Scaglia chimerica;Coda a scaglie|Attacca 2 volte (5F/5M). Fiamma 4M a tutti. Assalto 8F a un bersaglio
DEMOGORGONE|Valle Decadente|D+|30|18|15|Corno del Demone;Scaglia Nera|Attacco 6F. Armor 3. Regen 3. Fuoco Arcano 5M a tutti. Colpo Potente 10F poi ricarica
GOLEM GUARDIANO|Antica Fucina|D+|30|18|15|Placca arcana;Chiave del Sistema|Attacco 6F. Ignora danni fisici. Raggio Obliterante 8M. Scudi Rotanti 3M a tutti
LYCAN|Altopiani Cristallini|D+|30|18|15|Pelliccia di Lupo;Zanna della Luna|Attacco 5M. Reclutare: chiama a raccolta 2 Mostri E. Taglia Gemme 10F
CHIGARU|Altopiani Cristallini|C|40|18|18|Corazza animale;Nucleo di Luce|Armor 3. Attacco 8F. Controllo cinetico 8M a tutti. Zampata 10F
DEMONE|Antica Fucina|C|40|18|16|Antica Roccia;Carbone rovente|Immune al fisico. Attacco 8F. Crollo di Lava 8M a tutti. Esplosione: infligge tanti danni quanti i suoi PV rimanenti
MAHK|Città dei Morti|C|40|18|20|Ali spettrali;Lingua di Drago|Regen 5. Attacco 8M. Alito venefico 10M a tutti, Veleno 50%. Recarn 30%
ESECUTORE|Foresta Fungina|C|35|18|18|Zampa Esecutrice;Clorofilla|50% di schivare Danni. Attacco 8F. Falce Lampo 10F a tutti
ELFO|Isole Ghiacciate|C|40|18|16|Capelli d'Argento;Schegge di cristallo|Attacco 8F. Frecce ghiacciate 8M a tutti. Controllo: 50% paralisi
AZVIRA|Valle Decadente|C|35|18|15|Grumo d'oro;Lingua d'Ebano|Se colpito da fisico si sdoppia (8F). Collasso: esplode infliggendo 15M
LYCAN ALPHA|Altopiani Cristallini|C+|50|21|20|Collana del Sole;Artiglio dell'Alfa;${GCD} B|Attacco 8M. Reclutare: chiama 1 Lycan. Frangi Gemme 12F. Cerchio di Fuoco 8M a tutti
NEMEA|Antica Fucina|C+|50|21|22|Criniera d'oro;Corona gemmata;${GCD} B|Immune alla magia. Attacco 8M. Ruggito d'oro 10F a tutti. Brillare: diff +1 a tutti (cumulabile)
YIV|Città dei Morti|C+|50|21|18|Cuore Marcio;Occhio Malvagio;${GCD} B|Immune al fisico. Regen 3. Attacco 8M. Evoca creatura (3 di ranghi diversi). Palla del Male 8M ma 10% di far perdere 20
TARTACOLOSSO|Foresta Fungina|C+|60|21|20|Guscio Titanico;Squame arcane;${GCD} B|Armor 5 (Diff -1 a colpirlo). Attacco 10F a tutti. Scosse 10M a tutti
UCCELLO DEL TUONO|Isole Ghiacciate|C+|50|21|22|Piuma Celeste;Becco di Ghiaccio;${GCD} B|Attacco 8M. Tempesta 12F a tutti. Visibilità: +1 diff a colpire
FRANGICOLPI|Valle Decadente|C+|50|21|23|Coda concussiva;Mine animali;${GCD} B|Se colpito rilascia un'esplosione da schivare (5M). Attacco 8F. Concussione 12F a tutti
GURLAMBRAM|Isole Ghiacciate|B|60|21|35|Scalpo dei Re|Evocazione: Yeti (40PV, 5F). Rune mistiche (varie magie 12M). Ascia dei Ghiacci 15F a tutti
LEONE DI NEBBIA|Isole Ghiacciate|B|70|24|50|Cometa glaciale;${GCD} A|Immune alla magia. Zampata 15F a tutti. Maelstorm 15M a tutti
ABOMRAX|Città dei Morti|B|60|21|35|Artigli del Male|Colpi tentacolari 15F a tutti. Dolore: stessi danni persi come danno (max 30). Annientare 15M
CAMPIONE|Città dei Morti|B|70|24|50|Antica Anima Samurai;${GCD} A|Immune al fisico. TranciaMondo 15F a tutti. Accumula Dolore: riflette danni x2. CreaVedove: doppio hit 15F
HONEYNEEDLE|Foresta Fungina|B|60|21|35|Ago Dolorante|Veleno in polvere 50% 10M a tutti. Colpo preciso 15F. Paralisi morente 10M a tutti, Paralisi 40%
REKINA|Foresta Fungina|B|70|24|50|Ali a crisalide;${GCD} A|Ipnosi 60%: agisce il Master. Danza di farfalle 15M a tutti. -1 a essere colpita. Schiaffo 10F
GRAY HAGH|Valle Decadente|B|60|21|35|Staffa da strega|Magie varie 15M. +1 a colpire. Spazzata 10F a tutti. Maledizione: -2 diff al prossimo turno
ARKIPENT|Valle Decadente|B|70|24|50|Pelle acida;${GCD} A|TrafiggiMontagne 15F a tutti. Saetta a lancia 20M a un bersaglio. +1 a colpirlo. Regen 8
FAMEVORAX|Antica Fucina|B|60|21|35|Blob in fialetta|Quando colpito evoca serpe di lingua (15PV, 15F). Leccare 15F a tutti. Vernice 15M a tutti, Paralisi 20%
GRAVITY|Antica Fucina|B|70|24|50|Nucleo Dragonico;${GCD} A|Diff -1 a colpire. Schianto cinetico 15M a tutti. Collasso terrestre 20F. Respingi magia 50%
ARCANEFOX|Altopiani Cristallini|B|60|21|35|Pelliccia Mistica|Rifletti magia 40%. Lampo 15M a tutti. Costruisci Elementali (40PV, 8M). Esplosione mistica 20M
PIUMA|Altopiani Cristallini|B|70|24|50|Piume eteree;${GCD} A|Diff -1 a colpire. Riflette fisico 40%. Scintille nel cielo 15M a tutti. Rinascere 40%. Fuoco arcano 20F
ILLUNA||B+|80|24|100|Gemma assoluta|Immune alla magia. Rifletti magia. Soffio reale 20M. Volare: +1 diff da colpire. Desiderio male o bene (20F a tutti o +10 PV)
NETHROI||B+|80|24|100|Gemma morente|Immune al fisico. Rifletti danni sempre. Morte venefica 15M a tutti, veleno 50%. Rianimare 30%. Anime erranti (30PV, 5F) 15F
BROKKOS||B+|80|24|100|Gemma della rinascita|Dimezza danni subiti. Terremoto 20F a tutti. Regen 10. Schianta alberi 15M a tutti
SNAPDAX||B+|80|24|100|Gemma animale|Raddoppia i Danni che infligge. Colpo Rapido 15F a tutti. Lame di Vento 10M. -1 a essere colpito
VADROK||B+|80|24|100|Gemma spirituale|Crea 3 copie di sé, solo una reale che compare dopo 40 Danni. Tuoni 15M a tutti. Frammenti di cristalli 10F a tutti
ATRAVAX||B+|90|24|120|Dono dei Pretori|-1 diff a colpire. Il silenzio è d'oro: se qualcuno emette parole subisce Danni. La parola è d'argento: se nessuno parla subisce Danni. Potere 15M a tutti. Regen 5. Distruzione 10F a tutti
GLAVILAX||B+|90|24|120|Dono dei Pretori|Immune al fisico. Armor 5. Regen 5. Cicla le forme 123 231 312...: 1ª Forma (se la eviti invece la subisci, 20F); 2ª Forma (somma insieme dei risultati); 3ª Forma (attacca tutti, se nessuno colpisce si deprime). Ultima forma sotto i 40 PV: 30 Danni al più sano
ORMAX||B+|90|24|120|Dono dei Pretori|Immune alla magia. Regen 5. Acqua 20M (l'ambiente viene sommerso). Fuoco (l'ambiente diventa di fuoco). Terra (crollano montagne). Vento (grande tempesta). Oblio (non si vede e non si sente nulla)
CTHULU|Antica Fucina|A|100|27|150||Immune alla magia. 3 Maledizioni (Danno 15M circa e nerf). Controllo Mentale. Annichilisci 20F. Morte dell'anima: 30% di portare a 0 una Riserva. Abilità unica: Crepa del Fabbro
GODSLAYER|Valle Decadente|A|120|27|150||Diff -1 per colpire. Armor 10. Fiamme Nere 15M. Triplo Colpo 15Fx3. Caduta Astrale 20F. SuperNova 30M. Abilità unica: Tripla Fauce
HORROR|Città dei Morti|A|100|27|150||Armor 8 anche magico. Recarm 40%. Colpo Colossale 20F. Tranci Corpi 10 Danni. Maledizione congiunta: due bersagli, stessi danni. Feroce: +5 Danni, +2 Armor. Abilità unica: Benedizione dei Morti
KAIJU|Altopiani Cristallini|A|120|27|150||Diff -1 per colpire. Armor 10. Tuoni leviatanici 15M. Urlo: +2 diff alla prossima azione. Furia Celeste 20F. Tsunami. Abilità unica: Voce del Mare
RE GUARDIANO|Isole Ghiacciate|A|120|27|150||Armor 12 (tutta). Schianto Glaciale 20F. Bufera 5M ogni turno. Ordine imperiale. Collasso invernale 15M. Abilità unica: Genesi del Gelo
SANGUINIS|Foresta Fungina|A|100|27|150||Immune al fisico. Veleno perenne. Crisalide imperturbabile 10F: non può essere danneggiata se prima non uccidi 3 mostri evocati. Comunione del Sangue 15M e si cura. Bacio Tossico 10F + Velenox. Abilità unica: Crescita Spropositata
URABRASK|Boss|A+|||||
SHEOLDRED|Boss|A+|||||
VORINCLEX|Boss|A+|||||
ELESH-NORN|Boss|A+|||||
JIN-GITAXIAS|Boss|A+|||||
HOLLOWKING|Boss|A+|||||
ANGELO|Missione|C|40|||| Lancia Celeste 8M a tutti. Evoca un simile con 5 PV in meno (mostro speciale evocato durante una missione)
SERAPHIM|Missione|B|65|24|80||10M a tutti. 12F. Evoca due Angeli o un Seraphim con -10 PV (mostro speciale evocato durante una missione)
`.trim()

export const MOSTRI = RAW.split('\n').map((riga) => {
  const [nome, ambiente, grado, pv, d, au, drop, abilita] = riga.split('|').map((s) => s.trim())
  return {
    id: slug(nome),
    nome,
    ambiente: ambiente || 'Boss (senza ambiente)',
    grado,
    pv: Number(pv) || null,
    d: d ? Number(d) : null,
    aureos: au === '' ? null : Number(au),
    drop: drop ? drop.split(';').map((s) => s.trim()) : [],
    abilita,
    illeggibile: grado === 'A+',
  }
})

export const MOSTRI_BY_ID = Object.fromEntries(MOSTRI.map((m) => [m.id, m]))
