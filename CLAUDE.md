# Stars & Dungeons: contesto del progetto

Web app companion per un GDR da tavolo ideato dal cugino di Nicolò (il Master). Ogni giocatore ha un account e una scheda personaggio che resta per sempre e si aggiorna a ogni sessione (livello, acquisti, oggetti). Lingua dell'interfaccia e dei dati: italiano. Nicolò scrive in italiano, tono informale, preferisce risposte brevi e dirette.

La fonte delle regole è il documento Word "Word Nico Stars&Dungeons.docx" (nel Project claude.ai "ludo stars & dungeons"). I commenti del Master nel Word chiariscono molte regole: sono già stati recepiti nei dati.

## Stato attuale

Prima versione completa e funzionante in build (`npm run build` ok). I calcoli sono stati verificati con uno script su una scheda di prova, ma **l'interfaccia non è ancora stata provata a mano in un browser**: il primo giro di test dei flussi (crea scheda, assegna punti, compra, equipaggia, forgia, bestiario) è la prossima cosa da fare. Supabase non è ancora configurato: senza `.env` l'app gira in modalità locale (localStorage).

## Stack e comandi

React 18 + Vite 5, `@supabase/supabase-js` per auth e database. Deploy previsto su Netlify.

```
npm install
npm run dev      # http://localhost:5173
npm run build
npm run verifica # controlli automatici su calcoli e schermate: da lanciare prima di ogni push
```

Supabase: eseguire `supabase/schema.sql` (tabella `characters`, una riga per utente, jsonb `data`, RLS solo proprietario). Copiare `.env.example` in `.env` con `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Per i test disattivare "Confirm email" in Authentication.

## Struttura

```
src/App.jsx              sessione, caricamento/salvataggio (debounce 700 ms), tab
src/components/          Auth, Sheet (scheda), Zodiac (ruota), Shop, Inventory,
                         Bestiary, Craft, Receive, ItemCard
src/lib/rules.js         TUTTI i calcoli derivati + helper inventario + normalizza()
src/lib/store.js         Supabase o localStorage, export JSON
src/lib/supabase.js      client (null se env mancanti = modalità locale)
src/data/zodiac.js       12 segni, soglie 1/2/4/6/8/10, Ofiuco, categorie
src/data/items.js        armi e oggetti (C/B/A, speciali, S, zodiaco, elementi, craft)
src/data/craft.js        materiali per grado e ricette (armi A e S), Galaxis
src/data/monsters.js     bestiario in formato testo, una riga per mostro
src/data/ambienti.json   mappe e immagini luoghi per ambiente
public/images/monsters/<id>.webp          id = nome in minuscolo con trattini
public/images/ambienti/<ambiente>/        mappa.webp + luoghi
```

Gli id sono `slug(nome)` (vedi `craft.js`): ricette, bottino e inventario si legano tutti per id.

## Modello dati della scheda (salvata)

Si salva solo lo stato "grezzo": `rango`, `segni` (punti per segno), `bonusSegni` (es. Cinque Essenze), `scelte` (il "+1 a scelta" dei Segni), `corpo`/`mente` attuali (`null` = al massimo), `usati` (Fato/Sybil spesi), `extra` (correzioni manuali), `armorSplit`, `aureos`, `inventario [{id,qta,eq}]`, `bestiario {scoperti,rivelati}`, `noti` (oggetti i cui effetti si conoscono), `ricette` (scoperte), `abilita` (perenni delle armi S), `abilitaPers` (abilità scritte dal giocatore), `noteAbilita`, `log`.
Tutto il resto si ricalcola con `derive()` in `rules.js`, quindi non può disallinearsi. Aggiungere campi nuovi richiede di gestirli in `nuovaScheda()` e `normalizza()` per non rompere le schede già salvate.

## Regole implementate (da `rules.js`)

- Rango 1-12, solo in aumento. Si sale spendendo 3 XP (`saliRango`, pulsante "Sali di Rango"): gli XP li dà il Master dalle "Azioni…" (`supabase/tavolo7.sql`, togliere chiede conferma) e il Cosmo Liquido ne dà 2 da solo. Gli XP non raddoppiano con Ofiuco. I punti Rango si spendono sui 12 segni (max 10 per segno). Per togliere punti serve la "modalità correzione".
- Categoria = somma dei due segni della coppia (Resistenza = Pesci+Ariete, Carisma = Toro+Gemelli, Forza = Cancro+Leone, Arcano = Vergine+Bilancia, Fortuna = Scorpione+Sagittario, Saggezza = Capricorno+Acquario). Gli oggetti possono aumentare le categorie oltre il Rango, ma non Rango né Costellazioni.
- Per punto: Resistenza +3 Corpo MAX +1 Armor; Carisma +3 dadi sociale +1 Sybil; Forza +3 dadi attacco fisico +1 danni fisici; Arcano +3 dadi attacco magico +1 danni magici; Fortuna +1 Fato +10% critico (parte da 1%); Saggezza +3 Mente MAX +1 Cura.
- Soglia 2 di ogni segno = "Segno" con bonus fissi + un +1 a scelta (Fuoco/Terra/Aria/Acqua).
- Ofiuco: se tutti e 12 i segni hanno almeno 1 punto, tutte le statistiche derivate raddoppiano.
- Armor: quella di base (Resistenza + Segni) si divide a mano tra Fisica e Magica con un cursore; gli oggetti aggiungono Fisica o Magica.
- Oggetti equipaggiati applicano `mods` (categorie e statistiche). I requisiti (`req`) bloccano l'equipaggiamento.
- Armi dello Zodiaco: con 5 punti nel segno si ottengono dalla tab Zodiaco. Armi dei 4 elementi: 1 punto in tutti e 3 i segni dell'elemento.
- Consumabili con effetto speciale: Anello della Stella Cadente (azzera i segni, Rango invariato), Cinque Essenze (+2 a un segno: contano solo per le abilità di quel segno, NON per la Caratteristica né per il Rango). Gli altri consumabili si consumano e l'effetto si applica a mano con le "correzioni manuali".
- Materiali che si convertono subito in Aureos (Corazza aurea, Collana d'Oro: 50; Capelli d'Argento, Grumo d'oro, Criniera d'oro, Corona gemmata, Nucleo di Luce, Artiglio dell'Alfa: 150).
- Craft: armi A = 1 materiale E + 1 D + 1 C diversi; armi S = 2 materiali B diversi, danno anche un'abilità perenne. Galaxis non si forgia: la assegna il Master.
- Bestiario: l'immagine compare quando il giocatore segna il mostro come incontrato; "Paga Sybil" rivela PV, dado minimo per colpire, il primo attacco, Aureos e bottino. Tab "Ricevi" ha "Mostro sconfitto" (Aureos, raddoppiati con Anello d'Oro equipaggiato, e materiali).

## Decisioni prese con Nicolò

- Stack: React + Vite + Supabase, deploy Netlify.
- Vista Master e Tavolo (partita condivisa) in costruzione a fasi; un solo Master, scelto a mano nella tabella `masters`. Le schede dei giocatori non vengono mai toccate dal tavolo.
- Prima versione con tutte le sezioni: Scheda + Zodiaco, Negozio + Inventario, Bestiario, Craft + Ricevi.
- Le foto di mostri e luoghi vengono dalla cartella `dungeon_luoghi-mostri` (convertite in webp, max 640 px per i mostri).

## Risposte del Master (già applicate)

- Studiare un mostro costa 1 Sybil per tutti (`SYBIL_COSTO = 1`).
- Armor: dipende dal tipo di oggetto (fisica o magica); quella da Resistenza/Segni resta divisibile a mano con il cursore.
- Boss A+ (Urabrask, Sheoldred, Vorinclex, Elesh-Norn, Jin-Gitaxias, HollowKing): solo immagine, volutamente illeggibili. Sono in "Boss e Missioni" con `illeggibile`, senza pulsante Studia.
- Il nome giusto è "Altopiani Cristallini" (rinominati dati e cartella immagini).
- Chaos Mostri, Mastini e Monarchi S: fuori dall'app, i giocatori non li vedono.

- Mappatura Armi dello Zodiaco: confermata.
- Aureos: Triala 7, Kaiju 150. I mostri B+ restano senza ambiente (voluto).
- Gemma eterna: si ottiene sconfiggendo i B+ in missioni speciali; non va legata a nessun drop.
- Cacciatore: niente statistiche (cambia in base alla missione), non è nel Bestiario.
- Requisiti delle armi: si contano sempre sui valori MAX (come implementato).

## Domande ancora aperte

Nessuna.

## Cose da fare / idee

- Provare a mano tutti i flussi nel browser e sistemare i bug.
- Configurare Supabase e testare registrazione/login da due dispositivi.
- Deploy su Netlify con le variabili d'ambiente.
- Eventuale PWA per usarla da telefono come app.
- Gli effetti dei consumabili (Tonico, Cosmo Liquido ecc.) sono manuali: si possono automatizzare.
- Requisiti delle armi: "Corpo 21" e simili sono controllati sul MAX derivato; chiedere al Master se è quello che intende.

## Convenzioni

- Niente logica di gioco nei componenti: va in `rules.js`.
- Dati di gioco solo in `src/data/*`, modificabili senza toccare la UI.
- Modificare lo stato sempre con `up(fn)` (aggiorna e salva); usare `conLog` per registrare le azioni nello storico.

## Abilità

`Abilities.jsx` (nella Scheda) elenca con `abilitaScheda(c)` in `rules.js`: abilità Zodiaco sbloccate, armi/oggetti equipaggiati, abilità uniche (mostri A) in inventario, perenni (armi S) e quelle scritte dal giocatore. I costi in Mente/Corpo sono letti dal testo con `parseCosti` e il bottone "Usa −N" li toglie dalla riserva; i costi variabili ("quanti Corpo vuoi") restano manuali con i +/− delle Riserve.

## Tavolo e Master

SQL in `supabase/tavolo.sql` (fase 1: `masters`, `tavolo`, `tavolo_codice`, `giocatori_tavolo`, `entra_tavolo(codice, nome)`, Realtime), `supabase/tavolo2.sql` (fase 2: `azioni`, `eventi`) `supabase/tavolo3.sql` (il Master legge in sola lettura le schede dei giocatori al tavolo) `supabase/tavolo4.sql` (azioni Sybil e punti Cura) e `supabase/tavolo5.sql` e `supabase/tavolo6.sql` (mostri in campo), `supabase/tavolo7.sql` (azione XP) `supabase/tavolo8.sql` (studio condiviso) e `supabase/tavolo9.sql` (incontrato condiviso). Si eseguono in ordine dopo `schema.sql`. Il Master si sceglie a mano: `insert into public.masters (user_id) select id from auth.users where email = '...'`.
Hook `useTavolo` in `src/lib/tavolo.js`; viste `Tavolo.jsx` (giocatore), `Master.jsx`, `MasterAzioni.jsx`, `RichiesteMaster.jsx` (giocatore: danni da confermare e doni automatici), `Compagni.jsx`, `Storico.jsx`.
Il Master vede la scheda intera di un giocatore con "Vedi scheda" (`SchedaMaster.jsx`, sola lettura).
Principio: il Master non scrive mai nella scheda di un giocatore. Manda un'azione (`azioni`) e l'app del giocatore la applica alla propria scheda, "prenotandola" prima (`rispondiAzione`) così non si applica due volte.
Regole: Armor Fisica/Magica si sottrae ai danni dello stesso tipo (minimo 0), i puri la ignorano e il giocatore sceglie Corpo o Mente; fisico = Corpo, magico = Mente. Danni = conferma del giocatore (può correggere il numero); cure, oggetti, Rango +1, bottino e Aureos/Sybil/punti Cura in più si applicano da soli; togliere Aureos, Sybil o punti Cura chiede conferma. Calcoli in `rules.js` (`dannoNetto`, `conDanno`, `conCura`, `applicaBottino`, `riceviOggetto`).
Decisione del Master: la tab "Ricevi" resta ai giocatori (si segnano da soli Aureos, oggetti e bottino per risparmiare tempo); il Master può comunque dare le cose dalla sua vista.
Decisione del Master sulla fase 3: NIENTE combattimento sul tavolo (PV e azioni dei mostri restano su carta, per lasciare spazio al gioco di ruolo). C'è solo l'elenco leggero dei mostri in campo (`tavolo.mostri` = [{id, qta}], `supabase/tavolo6.sql`; es. 3× Midas): lo sceglie solo il Master e i giocatori vedono foto e quantità (il nome solo se il mostro è già nel loro Bestiario), mai i PV.

## Segreti e scoperte (richieste del Master)

- Ofiuco è segreto: nessun indizio nell'interfaccia finché non è sbloccato.
- Effetti e abilità di armi e oggetti sono nascosti nel Negozio finché il giocatore non paga 1 Sybil (`studiaOggetto`, `STUDIO_SYBIL`) o non li ottiene (comprati, ricevuti, forgiati: `conAggiunta` segna l'oggetto in `noti`). Restano visibili nome, grado, prezzo e requisiti.
- Craft a tentativi: nessun elenco di ricette. Il giocatore sceglie i materiali e tenta (`tentaCraft`): se la combinazione è esatta i materiali si consumano e ottiene l'arma (e la ricetta si scopre), se è sbagliata non perde niente.
- Ricette da comprare (tab Craft): ricetta a caso di un'arma A = 1 Sybil, di un'arma S = 5 Sybil (`COSTO_RICETTA`, `compraRicetta`); mai una ricetta già scoperta o di un'arma già posseduta.
- Sybil e Cura si modificano liberamente (anche oltre la base), perché il Master li dà come premio: `usati.sybil` e `usati.cura` possono essere negativi.

## Altre richieste del Master (applicate)

- Corpo e Mente: il massimo si modifica a mano (`conMax`, punti bonus di creazione; raddoppiati da Ofiuco) e l'attuale non supera mai il massimo. Fato, Sybil e Cura sono contatori liberi. Il campo Aureos si può svuotare.
- Le abilità dello Zodiaco non ancora sbloccate sono nascoste (nessuna soglia mostrata).
- Bonus ai dadi: oltre all'Attacco ci sono Difesa fisica e Difesa magica. Vengono da `mods` degli oggetti (`dadiDifFisica`, `dadiDifMagica`, `dadiFisico`, `dadiMagico`, `dadiSociale`) e da `dadi` nelle abilità Zodiaco sbloccate.
- Foto del personaggio (`immagine` nella scheda, ridotta a 256 px in `src/lib/immagine.js`), visibile al Master in "Vedi scheda".
- Immagini di armi e oggetti: file `public/images/oggetti/<id>.webp` e id elencato in `src/data/immagini-oggetti.json` (la scheda dell'oggetto mostra l'immagine solo se l'id è in elenco).
- Immagini di armi e oggetti: 166 file in `public/images/oggetti/<id>.webp` (dalle cartelle Oggetti e Armi del Master), elencati in `src/data/immagini-oggetti.json`. Fuori dall'app per ora, per decisione del Master: le 12 Armi Jade, le 6 armi "Caratteristiche", "Mappa" e "Chiave del Mondo".
- I nomi giusti sono quelli delle immagini: Daga della Corrosione, Astuzie di Jin-Gitaxis, Pozione del Veleno, The dei Dieci Sapori e le armi Craft con il nome completo (Levin Lance, Onix Digger, Green Rings, Sleeping Iguana, Dry Chalice, Amber Sword, Volcano Forgid, Springtide Glass, Phantom Needle, Holy Defender). La Pozione Rossa resta Pozione Rossa.
- Rinominare un oggetto cambia il suo id: aggiungere la coppia vecchio nome → nuovo in `RINOMINATI` (`items.js`), così `normalizza()` aggiorna le schede già salvate.
- Pergamena: i mostri non la lasciano più, la dà il Master a caso ("Azioni… → Oggetto") o il giocatore dalla tab Ricevi. Quando la si ottiene (`riceviOggetto`) si trasforma subito in una delle 6 estratte a caso: Fortuna (+1 Fato, +100% critico alla prossima azione), Analisi (+1 Sybil), Difesa (eviti un attacco), Scovare (un oggetto craft da grado C in su), Colpo avverso (Danni pari ai Danni subiti da una Riserva), Cura (cura completamente una Riserva). Sono consumabili e l'effetto lo applica il giocatore a mano (decisione del Master), tranne Scovare, che è automatica: usandola l'app dà un materiale di craft a caso di grado C o B (`scovaMateriale`, esclusi quelli che si convertono in Aureos).

## Manutenzione

- `supabase/keepalive.sql` + `.github/workflows/keepalive.yml`: una chiamata a `ping()` lunedì e giovedì tiene sveglio il progetto Supabase gratuito (si ferma dopo 7 giorni senza richieste). GitHub disattiva i workflow programmati dopo 60 giorni senza attività nel repository: se succede, basta un push o riattivarlo dalla tab Actions.
- Promemoria del backup nella Scheda (`serveBackup`, ogni 30 giorni; campi `creata`, `ultimoBackup`, `backupRimandato`). Il piano gratuito di Supabase non fa backup automatici.
- `npm run verifica` prima di ogni push.
- `.github/workflows/attivita-mensile.yml`: il 1° di ogni mese un commit automatico (`.github/ultimo-controllo.txt`) tiene attivo il repository, così GitHub non disattiva i workflow programmati. Quel commit non fa ripartire il deploy. In Fork compare come "1 commit indietro": basta un Pull.
- Test nel browser vero (Playwright, in modalità locale, senza toccare Supabase): `cd e2e && npm install && npx playwright install chromium` la prima volta, poi `cd e2e && npx playwright test`. Coprono creazione, assegnazione punti, Aureos/Fato/Sybil/Cura, massimi, Zodiaco nascosto, Negozio (studio, acquisto, equipaggiamento), Craft, Pergamena, foto, eliminazione. Non coprono Tavolo e Master (richiedono Supabase).

## Richieste del Master dopo la prima partita (applicate)

- Equipaggiamento: al massimo 1 Anello, 1 Amuleto e 1 Item aggiuntivo (`slot` degli oggetti in `items.js`, `controllaEquip`); i consumabili non si equipaggiano. Armi: due mani + una mano dà errore (si può forzare per abilità speciali). Le armi SS contano come a due mani.
- Negozio diviso in Armi, Anelli, Amuleti, Item agg, Consumabili. Gli oggetti equipaggiati compaiono tutti nelle Abilità, anche senza costo.
- Armor Fisica e Magica modificabili a mano (`extra.armorFisica`, `extra.armorMagica`, `conArmor`), oltre agli oggetti. Rango: si può scendere (`togliRango`) solo se c'è un punto Rango non assegnato.
- Bestiario: "Nascondi di nuovo" toglie un mostro dagli incontrati.
- Danni delle armi equipaggiate con i bonus (`dannoArma`, `testoDanno`, `DanniArmi.jsx`): nella Scheda e nello scontro del Tavolo. Es. "5 +3 fisici +2 magici = 10". Armi "Fisico o Magico": mostra i due casi.
- Bottino del Master: Aureos a tutti i giocatori scelti, ogni materiale a un giocatore solo (azione `bottino` con `soloAureos` + azioni `oggetto`).
- Forma dell'Equilibrio: solo con Bilancia ≥ 1 il danno (dopo l'Armor) si può togliere a Corpo o Mente a scelta; altrimenti fisico = Corpo e magico = Mente. I danni puri si scelgono sempre.
- Studio condiviso (`supabase/tavolo8.sql`, `src/lib/studi.js`): quando un giocatore studia un oggetto/arma (1 Sybil) o un mostro, lo vedono tutti i giocatori (tabella `studi_condivisi`; il Master può svuotarla). In modalità locale è solo per il giocatore.
- I mostri restano su carta (niente PV né danni ai mostri sul tavolo).
- Materiali che si convertono in Aureos (es. Capelli d'Argento dell'Elfo = 150 Aureos): un avviso lo dice nella tab Ricevi, nell'avviso del dono del Master e nella schermata del bottone del Master. Il Master vede "diventa N Aureos" accanto all'oggetto.
- Bestiario: per ogni ambiente si vede solo la mappa (ingrandibile). Le altre immagini dei luoghi restano in `src/data/ambienti.json` e `public/images/ambienti/` per la futura sezione "Missione" (da definire con il Master).
- "Incontrato" in comune (`supabase/tavolo9.sql`, tipo `incontrato` in `studi_condivisi`): un mostro segnato come incontrato da un giocatore, o messo in campo dal Master, lo vedono incontrato tutti (nome e immagine nel Bestiario e nei Mostri in campo). "Nascondi di nuovo" funziona solo sul proprio segno personale; il Master con "Nascondi a tutti" lo toglie per tutti.
- Bestiario online: l'"incontrato" e le statistiche studiate sono SOLO in comune (`studi_condivisi`); i giocatori non hanno pulsanti per nascondere, solo il Master ha "Nascondi a tutti". In modalità locale resta personale. Il Master ha "Azzera Bestiario e studi di tutti" (tab Master) per ripartire da zero; le schede non si toccano (ogni giocatore usa "Elimina personaggio").
- Tavolo: oltre al tempo reale c'è un piano B che non dipende da Supabase Realtime: le richieste del Master si rileggono ogni 5 secondi e tutto il tavolo ogni 20 (`caricaAzioni` in `src/lib/tavolo.js`); gli studi condivisi ogni 15 secondi (`src/lib/studi.js`).
- Atmosfera grafica: cielo stellato di sfondo (`CieloStellato.jsx`, canvas leggero, si ferma se l'app non è visibile e rispetta "riduci animazioni"); costellazioni dei 12 segni (`src/data/costellazioni.js`, `Costellazione.jsx`: più punti = più stelle accese, le abilità sbloccate le fanno brillare) nella tab Zodiaco; rivelazione animata di Ofiuco (`OfiucoRivelazione.jsx`) una volta sola per personaggio (`ofiucoRivelato`).
- Zodiaco senza ruota (idea del Master): intestazione con il Rango (rombi e punti da assegnare) e griglia delle 12 costellazioni; ogni riquadro ha l'icona dell'elemento (fuoco, terra, aria, acqua: `IconaElemento.jsx`), il livello del segno e 10 puntini. Toccando un riquadro si scende alla scheda del segno con le abilità.
