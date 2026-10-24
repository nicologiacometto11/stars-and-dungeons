// Materiali di CRAFT e ricette. Le ricette dei materiali usano i nomi esatti dei materiali.

export const MATERIALI = {
  E: [
    "Fibra d'Acqua", 'Piuma Arcobaleno', 'Scheggia di Tuono', 'Fibra di Metallo', 'Cristallo', 'Chiave della Città',
    'Tela di Seta', 'Corteccia magica', 'Tossina pura', 'Vertebra morbida', 'Dente di sabbia', 'Ali di Manticora',
    'Inchiostro vivo', 'Goccia di Resina', 'Ferro Etereo', 'Pelliccia Rosa', 'Maschera di Ossa', 'Grasso Spesso',
  ],
  D: [
    'Pelliccia bestia', 'Zanna selvaggia', 'Bende fantasma', 'Zanna Antica', 'Proboscide Forte', 'Zampa recisa',
    'Giudizio in bottiglia', 'Bava aliena', 'Scaglia chimerica', 'Coda a scaglie', 'Roccia di Malachite',
    'Corno del Demone', 'Scaglia Nera', 'Anello arcano', 'Placca arcana', 'Chiave del Sistema',
    'Pelliccia di Lupo', 'Zanna della Luna',
  ],
  C: [
    'Corazza animale', 'Collana del Sole', 'Antica Roccia', 'Carbone rovente', 'Ali spettrali', 'Lingua di Drago',
    'Cuore Marcio', 'Occhio Malvagio', 'Zampa Esecutrice', 'Clorofilla', 'Guscio Titanico', 'Squame arcane',
    'Schegge di cristallo', 'Piuma Celeste', 'Becco di Ghiaccio', 'Lingua d\'Ebano', 'Coda concussiva', 'Mine animali',
  ],
  B: [
    'Scalpo dei Re', 'Cometa glaciale', 'Artigli del Male', 'Antica Anima Samurai', 'Ago Dolorante', 'Ali a crisalide',
    'Staffa da strega', 'Pelle acida', 'Blob in fialetta', 'Nucleo Dragonico', 'Pelliccia Mistica', 'Piume eteree',
  ],
}

// Materiali che NON si combinano: appena ottenuti convertono in Aureos
export const MATERIALI_AUREOS = {
  'Corazza aurea': 50,
  "Collana d'Oro": 50,
  "Capelli d'Argento": 150,
  "Grumo d'oro": 150,
  "Criniera d'oro": 150,
  'Corona gemmata': 150,
  'Nucleo di Luce': 150,
  "Artiglio dell'Alfa": 150,
}

export const ALTRI_MATERIALI = [
  'Pergamena',
  'Frammento Gemma Dimensionale C',
  'Frammento Gemma Dimensionale B',
  'Frammento Gemma Dimensionale A',
  'Gemma animale',
  'Gemma morente',
  'Gemma eterna',
  'Gemma assoluta',
  'Gemma spirituale',
  'Gemma della rinascita',
  'Dono dei Pretori',
]

// Armi A (10 Danni, una mano): 1 materiale E + 1 D + 1 C, tutti diversi
export const ARMI_CRAFT_A = [
  { nome: 'Verglas', tipo: 'Magico', ing: ["Fibra d'Acqua", 'Zanna selvaggia', 'Becco di Ghiaccio'], abilita: 'Se ottieni un 20 puoi congelare un bersaglio che subirà 15 Danni Magici.' },
  { nome: 'Luminosity', tipo: 'Magico', ing: ['Piuma Arcobaleno', 'Zanna della Luna', 'Piuma Celeste'], abilita: 'Puoi colpire 4 bersagli che subiscono 8 Danni Magici (10 Mente).' },
  { nome: 'Levin Lance', tipo: 'Magico', ing: ['Scheggia di Tuono', 'Giudizio in bottiglia', 'Zampa Esecutrice'], abilita: 'Puoi evocare una tempesta di fulmini per 3 Round che colpirà tutti per 8 Danni Magici (Diff 6).' },
  { nome: 'Onix Digger', tipo: 'Fisico', ing: ['Fibra di Metallo', 'Roccia di Malachite', 'Guscio Titanico'], abilita: 'Puoi distruggere un tuo oggetto per far guadagnare a questa Arma +5 Danni per 3 Round (cumulativo).' },
  { nome: 'Fragility', tipo: 'Fisico', ing: ['Cristallo', 'Anello arcano', 'Schegge di cristallo'], abilita: 'Quando ottieni un Critico la spada risuona infliggendo a tutti i nemici 8 Danni Fisici.' },
  { nome: 'Sanguis', tipo: 'Fisico', ing: ['Chiave della Città', 'Chiave del Sistema', 'Cuore Marcio'], abilita: 'Puoi pagare quanti punti Corpo vuoi: due bersagli subiscono altrettanti Danni (non devi tirare).' },
  { nome: 'Ripper', tipo: 'Puro', ing: ['Tela di Seta', 'Pelliccia di Lupo', 'Antica Roccia'], abilita: 'Ignori Armor con questa Arma. Quando colpisci lo stesso bersaglio con successo +3 Danni al prossimo attacco (cumulativo).' },
  { nome: 'Arboretum', tipo: 'Magico', ing: ['Corteccia magica', 'Zanna Antica', 'Collana del Sole'], abilita: 'Puoi curare fino a 2 bersagli (escluso te stesso) come se avessi Sagg 3 (5 Mente).' },
  { nome: 'Green Rings', tipo: 'Magico', ing: ['Tossina pura', 'Scaglia chimerica', 'Mine animali'], abilita: 'Hai il 100% di Veleno, ogni Danno Veleno +2. Sei immune al Veleno.' },
  { nome: 'Sleeping Iguana', tipo: 'Fisico', ing: ['Vertebra morbida', 'Zampa recisa', 'Coda concussiva'], abilita: 'Evoca Iguana che combatte al tuo fianco.' },
  { nome: 'Dry Chalice', tipo: 'Fisico', ing: ['Dente di sabbia', 'Proboscide Forte', "Lingua d'Ebano"], abilita: 'Tutti i bersagli intorno a te subiscono 8 Danni Fisici (8 Corpo).' },
  { nome: 'Opulence', tipo: 'Magico', ing: ['Ali di Manticora', 'Placca arcana', 'Squame arcane'], abilita: 'Puoi pagare tanti Aureos (10x) per +1 Danni a quest\'Arma. Se non hai Aureos +20 Danni al prossimo attacco.' },
  { nome: 'Witness', tipo: 'Magico', ing: ['Inchiostro vivo', 'Scaglia Nera', 'Occhio Malvagio'], abilita: 'Puoi riflettere, una volta ogni 4 Round, un Danno Magico che stai per subire.' },
  { nome: 'Amber Sword', tipo: 'Magico', ing: ['Goccia di Resina', 'Bava aliena', 'Lingua di Drago'], abilita: 'Blocchi un bersaglio sul posto: non potrà agire né difendersi per il prossimo Round (10 Mente).' },
  { nome: 'Volcano Forgid', tipo: 'Fisico', ing: ['Ferro Etereo', 'Corno del Demone', 'Carbone rovente'], abilita: "Se hai equipaggiati sia l'Anello del Calore che l'Amuleto di Fuoco, si attivano sempre senza usare Azioni. Puoi infliggere tanti Danni a 3 bersagli (10 Corpo)." },
  { nome: 'Springtide Glass', tipo: 'Magico', ing: ['Pelliccia Rosa', 'Pelliccia bestia', 'Clorofilla'], abilita: 'Puoi incantare un bersaglio a combattere al tuo fianco per 1 Round (10 Mente).' },
  { nome: 'Phantom Needle', tipo: 'Fisico', ing: ['Maschera di Ossa', 'Bende fantasma', 'Ali spettrali'], abilita: 'Ogni volta che elimini un nemico, questo diventa uno Spettro che combatterà al tuo fianco.' },
  { nome: 'Holy Defender', tipo: 'Puro', ing: ['Grasso Spesso', 'Coda a scaglie', 'Corazza animale'], abilita: 'Hai +2 Armor e +2 Magico. Questa Arma infligge Danni pari al tuo Armor + Magico x2.' },
]

// Armi S (12 Danni, una mano): 2 materiali B diversi. Danno anche una nuova Abilità perenne.
export const ARMI_CRAFT_S = [
  { nome: 'Scythice', tipo: 'Magico', ing: ['Scalpo dei Re', 'Cometa glaciale'], abilita: 'Tutti i risultati che colpiscono il bersaglio hanno 40% di far saltare un turno.', perenne: 'Tormenta siderale (10M a due bersagli)' },
  { nome: 'Voidcleaner', tipo: 'Fisico', ing: ['Artigli del Male', 'Antica Anima Samurai'], abilita: 'Ignora Armor di qualsiasi tipo.', perenne: '30% instant kill di un nemico' },
  { nome: 'Springow', tipo: 'Fisico', ing: ['Ali a crisalide', 'Ago Dolorante'], abilita: 'Ogni colpo a segno infligge uno status casuale tra Paralisi, Veleno, Fatica o Sonno.', perenne: 'Per ogni status attuale infliggi 5M' },
  { nome: 'Kingfang', tipo: 'Puro', ing: ['Staffa da strega', 'Pelle acida'], abilita: 'Tutti i risultati con il dado di 1 o 2 contano come 18 (dovrai poi subire la ripercussione).', perenne: 'Blocca un buff a scelta di un nemico' },
  { nome: 'Rebornblade', tipo: 'Magico', ing: ['Piume eteree', 'Pelliccia Mistica'], abilita: 'Ogni colpo a segno infligge un danno elementale a scelta tra Tuono, Fuoco, Ghiaccio, Pietra.', perenne: 'Hai una riserva aggiuntiva di 30 punti utilizzabile solo per i Danni' },
]

// Galaxis non è nel CRAFT automatico: lo assegna il Master quando succede l'occasione.
export const GALAXIS = {
  nome: 'Galaxis',
  ing: ['Gemma animale', 'Gemma morente', 'Gemma eterna', 'Gemma assoluta', 'Gemma spirituale'],
  tipo: 'Puro',
  abilita: 'Hai il 50% di dimezzare i PV di un bersaglio.',
}

export const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim()
export const slug = (s) =>
  norm(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
