// Ruota dello Zodiaco — dati dal documento di gioco.
// Per ogni segno: soglie 1/2/4/6/8/10. A soglia 2 c'è il "Segno" con bonus (bonus fissi + una scelta).
// bonus: { corpoMax, menteMax, armor, fato, sybil, cura }  scelta: ['fato','sybil'] ecc. (+1 a una delle due)

export const CATEGORIE = [
  { id: 'resistenza', nome: 'Resistenza', segni: ['pesci', 'ariete'], effetto: '+3 Corpo MAX e +1 Armor per punto' },
  { id: 'carisma', nome: 'Carisma', segni: ['toro', 'gemelli'], effetto: '+3 ai dadi nel Sociale e +1 Sybil per punto' },
  { id: 'forza', nome: 'Forza', segni: ['cancro', 'leone'], effetto: '+3 ai dadi in Attacco Fisico e +1 Danni Fisici (ogni Arma/Abilità) per punto' },
  { id: 'arcano', nome: 'Arcano', segni: ['vergine', 'bilancia'], effetto: '+3 ai dadi in Attacco Magico e +1 Danni Magici (ogni Arma/Abilità) per punto' },
  { id: 'fortuna', nome: 'Fortuna', segni: ['scorpione', 'sagittario'], effetto: '+1 Fato e +10% Critico in ogni tiro per punto' },
  { id: 'saggezza', nome: 'Saggezza', segni: ['capricorno', 'acquario'], effetto: '+3 Mente MAX e +1 Cura per punto' },
]

const SEGNO = {
  fuoco: { nome: 'Segno di Fuoco', bonus: { corpoMax: 2, menteMax: 2 }, scelta: ['fato', 'sybil'] },
  terra: { nome: 'Segno di Terra', bonus: { corpoMax: 2, armor: 2 }, scelta: ['sybil', 'fato'] },
  aria: { nome: "Segno d'Aria", bonus: { menteMax: 2, sybil: 2 }, scelta: ['fato', 'armor'] },
  acqua: { nome: "Segno d'Acqua", bonus: { fato: 2, cura: 2 }, scelta: ['armor', 'sybil'] },
}

const seg = (el) => ({ soglia: 2, tipo: 'segno', ...SEGNO[el] })

export const SEGNI = [
  {
    id: 'ariete', nome: 'Ariete', elemento: 'fuoco', categoria: 'resistenza',
    abilita: [
      { soglia: 1, nome: 'Muro di Cristallo', costo: '5 Mente', desc: "L'Ariete ti protegge creando un muro invisibile di luce riflettente, in grado di proteggerti dalla maggior parte degli attacchi fisici e magici. Sta attento che altri Arieti possono infrangere questa difesa." },
      seg('fuoco'),
      { soglia: 4, nome: 'Rivoluzione di Stelle', costo: '3 Mente per missile', desc: "Lanci un potente attacco di polvere di stelle: i missili sono tanti quanto i Punti in Resistenza. Ogni missile contro un nemico costa 3 Mente e infligge 5 Danni Magici." },
      { soglia: 6, nome: "Vello d'Oro", costo: '1 volta al giorno', desc: 'Una volta al giorno puoi renderti invulnerabile agli attacchi fisici o magici per 5 Round, non subendo alcun Danno del relativo tipo.' },
      { soglia: 8, nome: 'Estinzione delle Stelle', costo: 'Mente pari al livello del nemico · 1 volta a Sessione', desc: 'Concentrandoti su un bersaglio puoi cancellarlo da questo piano dell\'esistenza.' },
      { soglia: 10, nome: 'Malahidael', desc: "Tu sei l'Ariete, l'angelo della Ruota Malahidael ti segue e viene convocato a tua volontà." },
    ],
  },
  {
    id: 'toro', nome: 'Toro', elemento: 'terra', categoria: 'carisma',
    abilita: [
      { soglia: 1, nome: 'Posa del Toro', desc: "Finché rimani in questa posa con le braccia incrociate, immobile, subendo i Danni; quando apri le braccia rilasci una potente energia che colpisce un nemico del doppio dei Danni totali che hai subito (fisici o magici)." },
      seg('terra'),
      { soglia: 4, nome: 'Carica del Toro', costo: '5 Corpo', desc: 'Proietti la tua energia fisica contro un avversario: la forza del colpo è pari alla tua Armor e puoi colpire tanti bersagli quanti i punti in Saggezza.' },
      { soglia: 6, nome: 'Corno Aureo', costo: '1 volta al giorno', desc: 'In combattimento puoi diventare il bersaglio di qualunque attacco per 3 Round e rimanere in vita con 1 Corpo e 1 Mente.' },
      { soglia: 8, nome: 'Stella Inamovibile', desc: 'Prima di subire il primo attacco in una Sessione puoi colpire l\'avversario infliggendogli tanti Danni quanto il tuo Corpo MAX (Danno Fisico) o la tua Mente MAX (Danno Magico).' },
      { soglia: 10, nome: 'Amodael', desc: "Tu sei il Toro, l'angelo della Ruota Amodael ti segue e viene convocato a tua volontà." },
    ],
  },
  {
    id: 'gemelli', nome: 'Gemelli', elemento: 'aria', categoria: 'carisma',
    abilita: [
      { soglia: 1, nome: 'Altra Dimensione', costo: '5 Mente', desc: 'Crei due piccole zone di connessione spaziale distanti non più di 10 metri tra loro. Possono essere create in aria o su oggetti, non su esseri viventi.' },
      seg('aria'),
      { soglia: 4, nome: 'Barriera Dimensionale', costo: '7 Mente', desc: 'Altra Dimensione diventa più grande permettendo il passaggio di un essere vivente e la distanza arriva fino a 20 metri.' },
      { soglia: 6, nome: 'Castore e Polluce', costo: '1 volta al giorno', desc: 'Le due guide dei Gemelli si manifestano per difenderti: due ombre guerriere di livello 5 che scompaiono dopo aver eseguito un tuo ordine o dopo 10 Round in combattimento.' },
      { soglia: 8, nome: 'Esplosione Galattica', costo: '15 Mente · 1 volta a Sessione', desc: "Fai collassare su sé stessa l'Altra Dimensione: 10 Danni Magici a tutti coloro che erano vicini in un raggio di 20 metri." },
      { soglia: 10, nome: 'Ambriael', desc: "Tu sei i Gemelli, l'angelo della Ruota Ambriael ti segue e viene convocato a tua volontà." },
    ],
  },
  {
    id: 'cancro', nome: 'Cancro', elemento: 'acqua', categoria: 'forza',
    abilita: [
      { soglia: 1, nome: 'Ammasso del Presepe', costo: '5 Corpo per attivare, poi 2 Mente a turno', desc: 'Ricrei intorno a te la distesa dei morti, infliggendo 2 Danni Magici costanti a chi ti sta intorno.' },
      seg('acqua'),
      { soglia: 4, nome: "Bara dell'Omertà", costo: '7 Mente', desc: "Trascini nell'Abisso un essere vivente, rinchiudendolo in una bara di energia: non può subire né infliggere Danni di alcun tipo, solo tu puoi interagire con la bara e con lui." },
      { soglia: 6, nome: "Custode dell'Idra", costo: '1 volta al giorno', desc: 'La tua conoscenza sinistra ti permette di salvarti dalla morte una volta al giorno.' },
      { soglia: 8, nome: 'Strati di Spirito', costo: 'Mente pari al livello del bersaglio · 1 volta a Sessione', desc: 'Domini la Porta dei Morti in modo che si apra a tuo volere su chi desideri, trascinandolo negli Inferi.' },
      { soglia: 10, nome: 'Muriael', desc: "Tu sei il Cancro, l'angelo della Ruota Muriael ti segue e viene convocato a tua volontà." },
    ],
  },
  {
    id: 'leone', nome: 'Leone', elemento: 'fuoco', categoria: 'forza',
    abilita: [
      { soglia: 1, nome: 'Ruggito del Re', costo: '3 Mente per bersaglio', desc: 'Sprigioni la tua ira sui bersagli: si immobilizzano per il prossimo Round, indifesi e paralizzati dalla paura.' },
      seg('fuoco'),
      { soglia: 4, nome: 'Zanne del Tuono', desc: 'Un potentissimo colpo di energia su un bersaglio: puoi pagare quanti punti Corpo vuoi per infliggere altrettanti Danni Fisici.' },
      { soglia: 6, nome: 'Leone di Nemea', costo: '1 volta al giorno', desc: 'In combattimento, per 10 Round, tutti i tuoi Danni infliggono +15 Danni FISICI.' },
      { soglia: 8, nome: 'Sovrano di Luce', costo: '15 Corpo · 1 volta a Sessione', desc: 'Colpisci tutti i nemici in un raggio di 10 metri con fasci di pura luce, infliggendo 15 Danni Fisici.' },
      { soglia: 10, nome: 'Verchiael', desc: "Tu sei il Leone, l'angelo della Ruota Verchiael ti segue e viene convocato a tua volontà." },
    ],
  },
  {
    id: 'vergine', nome: 'Vergine', elemento: 'terra', categoria: 'arcano',
    abilita: [
      { soglia: 1, nome: 'Illuminazione', costo: '3 Mente', desc: 'Capisci quando una persona mente o nasconde qualcosa. Puoi parlare in telepatia per 5 minuti con chi desideri.' },
      seg('terra'),
      { soglia: 4, nome: 'I Sei Mondi', costo: '5 Mente per attivare, poi la richiesta di uno dei 6 Regni', desc: 'Costringi un bersaglio a vivere la trasmigrazione della sua anima nei sei regni: infernale, spirituale, bestiale, sanguinario, umano e celeste. Riporta le colpe del bersaglio su di lui, al prezzo che ti viene richiesto da uno di questi Regni.' },
      { soglia: 6, nome: 'La Fanciulla', costo: '1 volta al giorno', desc: 'Puoi salvare una persona da morte certa.' },
      { soglia: 8, nome: 'Celeste Danza del Supremo Ciclo', costo: '1 volta a Sessione', desc: 'Tu e un bersaglio venite proiettati in un luogo ignoto: puoi porgli ogni domanda e non potrà mentirti, pena la perdita di uno dei suoi sensi a tua scelta. Al termine del Ciclo tornate nella realtà.' },
      { soglia: 10, nome: 'Hamaliael', desc: "Tu sei la Vergine, l'angelo della Ruota Hamaliael ti segue e viene convocato a tua volontà." },
    ],
  },
  {
    id: 'bilancia', nome: 'Bilancia', elemento: 'aria', categoria: 'arcano',
    abilita: [
      { soglia: 1, nome: "Forma dell'Equilibrio", costo: '5 Mente', desc: 'Puoi pagare ogni costo sia in Mente che Corpo a tua scelta. Rafforzi (+3 Danni FISICI) o indebolisci (-3 Danni FISICI) un\'Arma che tocchi.' },
      seg('aria'),
      { soglia: 4, nome: 'Pace e Guerra', costo: 'a piacere (3 Mente per guerriero)', desc: 'Ogni 3 punti Mente pagati evochi un guerriero di livello 3 che combatte al tuo fianco fino alla fine del combattimento.' },
      { soglia: 6, nome: 'Infinito', costo: '1 volta al giorno', desc: 'Non hai limiti di Armi equipaggiate e ognuna rimane rafforzata per 10 Round.' },
      { soglia: 8, nome: 'Vita e Morte', costo: 'Corpo pari alle ferite · 1 volta a Sessione', desc: 'Decreti vita o morte su un bersaglio: lo curi di tutte le ferite o gli fai subire il doppio delle ferite che ha attualmente.' },
      { soglia: 10, nome: 'Zuriael', desc: "Tu sei la Bilancia, l'angelo della Ruota Zuriael ti segue e viene convocato a tua volontà." },
    ],
  },
  {
    id: 'scorpione', nome: 'Scorpione', elemento: 'acqua', categoria: 'fortuna',
    abilita: [
      { soglia: 1, nome: 'Il Nemico del Cacciatore', desc: 'Vedi sempre i punti deboli dei nemici: se li colpisci (-3 ai DADI di ATTACCO) infliggi +3 Danni PURI. Non lasci mai aperture: +3 ai DADI nella tua difesa.', dadi: { dadiDifFisica: 3, dadiDifMagica: 3 } },
      seg('acqua'),
      { soglia: 4, nome: 'Cuspide Scarlatta', costo: '5 Corpo', desc: 'Terribile attacco (7 Danni PURI) che colpisce sempre un punto debole, lasciando una cicatrice. Ogni Cuspide ha il x% di uccidere istantaneamente un nemico (x = Punti Fortuna nella Ruota).' },
      { soglia: 6, nome: 'Sei Debole!', costo: '1 volta al giorno', desc: 'Comprendi doti, abilità e caratteristiche dei tuoi nemici e puoi nullificare un\'abilità di un nemico che combatterà solo ed esclusivamente con te.' },
      { soglia: 8, nome: 'Antares', costo: '10 Corpo · 1 volta a Sessione', desc: 'Per 10 Round tutti i tuoi attacchi hanno un x% di uccidere istantaneamente un nemico (x = Punti Fortuna nella Ruota).' },
      { soglia: 10, nome: 'Barbiael', desc: "Tu sei lo Scorpione, l'angelo della Ruota Barbiael ti segue e viene convocato a tua volontà." },
    ],
  },
  {
    id: 'sagittario', nome: 'Sagittario', elemento: 'fuoco', categoria: 'fortuna',
    abilita: [
      { soglia: 1, nome: "Ali dell'Arciere", costo: '5 Corpo', desc: 'Ti sollevi da terra, come se volassi, per circa 3 minuti.' },
      seg('fuoco'),
      { soglia: 4, nome: 'Caccia Grossa', costo: '5 Mente', desc: 'Colpisci tanti bersagli quanti i tuoi punti in Forza infliggendo 7 Danni Magici.' },
      { soglia: 6, nome: 'Anima di Chirone', costo: '1 volta al giorno', desc: 'Richiami la furia degli antichi Centauri che colpiscono tutti i tuoi avversari con frecce magiche, rendendoli vulnerabili ai Danni magici o fisici (doppio dei Danni di quella tipologia).' },
      { soglia: 8, nome: 'La Freccia Sacra', costo: '10 Mente · 1 volta a Sessione', desc: 'Scocchi dal nulla una freccia potentissima: colpisce qualunque bersaglio, ovunque sia, basta che tu pronunci il suo nome e conosca il suo volto. 30 Danni Magici.' },
      { soglia: 10, nome: 'Advachiael', desc: "Tu sei il Sagittario, l'angelo della Ruota Advachiael ti segue e viene convocato a tua volontà." },
    ],
  },
  {
    id: 'capricorno', nome: 'Capricorno', elemento: 'terra', categoria: 'saggezza',
    abilita: [
      { soglia: 1, nome: 'Pietre Saltellanti', desc: 'Forza e velocità: +3 ai DADI nei tiri di difesa Corpo. Colpendo un nemico a mani nude infliggi 3 Danni Fisici.', dadi: { dadiDifFisica: 3 } },
      seg('terra'),
      { soglia: 4, nome: 'La Sacra Spada', costo: '5 Mente (lama di vento)', desc: "Hai sempre un'Arma anche quando non ne hai equipaggiata nessuna: le tue braccia tagliano come lame, infliggendo 5 Danni Fisici. Sferzando l'aria lanci una lama di vento: 5 Danni Magici." },
      { soglia: 6, nome: 'Sussurro di Pan', costo: '1 volta al giorno', desc: 'Consulti gli astri: 3 domande a cui il GM risponderà con sì o no.' },
      { soglia: 8, nome: 'Excalibur', costo: '15 Mente (a distanza) · 1 volta a Sessione', desc: "Richiami l'antica spada con tutto il tuo corpo, fendendo ogni cosa al movimento delle dita: 15 Danni PURI per 10 Round. Amplificando l'energia tagli anche dalla distanza: 30 Danni Magici." },
      { soglia: 10, nome: 'Hanael', desc: "Tu sei il Capricorno, l'angelo della Ruota Hanael ti segue e viene convocato a tua volontà." },
    ],
  },
  {
    id: 'acquario', nome: 'Acquario', elemento: 'aria', categoria: 'saggezza',
    abilita: [
      { soglia: 1, nome: 'Fredda Dama', costo: '3 Mente (arma) / 5 Mente (attacco)', desc: 'Controlli il ghiaccio: lo infondi sulle tue Armi (+2 Danni Magici) o scagli energia glaciale contro un avversario (5 Danni Magici).' },
      seg('aria'),
      { soglia: 4, nome: 'Tomba di Ghiaccio', costo: '10 Mente', desc: 'Imprigioni un bersaglio in una teca perfetta: resta congelato finché vuoi o finché qualcuno non riesce a rompere il ghiaccio.' },
      { soglia: 6, nome: 'Anfora Avida', costo: '1 volta al giorno', desc: "Richiami l'antica giara delle stelle per riempirla rubando a un bersaglio tutta la sua energia magica, dimezzandogli la vita. I punti accumulati vanno segnati e non possono superare 50." },
      { soglia: 8, nome: 'Zero Assoluto', costo: '10 Mente · 1 volta a Sessione', desc: "Svuoti la giara contro uno o più bersagli: subiscono tanti Danni Magici quanti i punti accumulati, poi la giara si svuota." },
      { soglia: 10, nome: 'Cambiael', desc: "Tu sei l'Acquario, l'angelo della Ruota Cambiael ti segue e viene convocato a tua volontà." },
    ],
  },
  {
    id: 'pesci', nome: 'Pesci', elemento: 'acqua', categoria: 'resistenza',
    abilita: [
      { soglia: 1, nome: 'Sangue Velenoso', costo: '5 Corpo e devi sanguinare', desc: "Il sangue di tutti i Risvegliati dei Pesci è velenoso per gli altri: se vieni ferito e qualcuno tocca il tuo sangue subisce 2 Danni Fisici. Puoi creare dal tuo sangue proiettili corrosivi: 5 Danni Fisici." },
      seg('acqua'),
      { soglia: 4, nome: 'Concerto Rosso Sangue', costo: '7 Mente', desc: 'Controlli la pressione del sangue di tanti bersagli quanti i tuoi punti in Arcano, per bloccarli o infliggere 7 Danni Magici.' },
      { soglia: 6, nome: 'Elisir dalle stelle', costo: '1 volta al giorno', desc: 'Crei dal tuo sangue tante pozioni quanti i tuoi punti in Corpo diviso 3: rosse (curano completamente), nere (avvelenano chi le inala, 5 Danni Magici ad area), bianche (raddoppiano gli Aureos cosparsi).' },
      { soglia: 8, nome: 'Rosa Bianca', desc: "L'antica maledizione dei Pesci: dal tuo sangue crei una rosa rosso sangue per 5 Round; se tocca la pelle di un bersaglio, questi muore dissanguato nel giro di 2 Round." },
      { soglia: 10, nome: 'Barchiael', desc: "Tu sei i Pesci, l'angelo della Ruota Barchiael ti segue e viene convocato a tua volontà." },
    ],
  },
]

export const OFIUCO = {
  nome: 'Ofiuco — 13° Costellazione',
  condizione: 'Almeno 1 punto in ogni costellazione.',
  effetto: 'Raddoppia tutte le tue caratteristiche (tranne gli Xp). Le tecniche sbloccate dalla Ruota non sono più disponibili e diventano:',
  abilita: [
    'Tutti i tuoi attacchi, con o senza Armi, infliggono sempre 15 Danni Fisici.',
    'Scagli una potente energia distruttiva contro un bersaglio: 30 Danni Magici (10 Mente).',
    'Evochi Asclepio, il primo portatore di serpenti: curi una persona da morte certa, avveleni un nemico che morirà per certo, evochi un serpente spettro di liv 6.',
    'Invochi Sabik e il suo terribile potere: manifesti il potere di una qualunque costellazione di Grado 8 (2 volte per Sessione).',
  ],
}

export const SEGNI_BY_ID = Object.fromEntries(SEGNI.map((s) => [s.id, s]))
export const SOGLIE = [1, 2, 4, 6, 8, 10]
