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

Si salva solo lo stato "grezzo": `rango`, `segni` (punti per segno), `bonusSegni` (es. Cinque Essenze), `scelte` (il "+1 a scelta" dei Segni), `corpo`/`mente` attuali (`null` = al massimo), `usati` (Fato/Sybil spesi), `extra` (correzioni manuali), `armorSplit`, `aureos`, `inventario [{id,qta,eq}]`, `bestiario {scoperti,rivelati}`, `abilita` (perenni delle armi S), `abilitaPers` (abilità scritte dal giocatore), `noteAbilita`, `log`.
Tutto il resto si ricalcola con `derive()` in `rules.js`, quindi non può disallinearsi. Aggiungere campi nuovi richiede di gestirli in `nuovaScheda()` e `normalizza()` per non rompere le schede già salvate.

## Regole implementate (da `rules.js`)

- Rango 1-12, solo in aumento. I punti Rango si spendono sui 12 segni (max 10 per segno). Per togliere punti serve la "modalità correzione".
- Categoria = somma dei due segni della coppia (Resistenza = Pesci+Ariete, Carisma = Toro+Gemelli, Forza = Cancro+Leone, Arcano = Vergine+Bilancia, Fortuna = Scorpione+Sagittario, Saggezza = Capricorno+Acquario). Gli oggetti possono aumentare le categorie oltre il Rango, ma non Rango né Costellazioni.
- Per punto: Resistenza +3 Corpo MAX +1 Armor; Carisma +3 dadi sociale +1 Sybil; Forza +3 dadi attacco fisico +1 danni fisici; Arcano +3 dadi attacco magico +1 danni magici; Fortuna +1 Fato +10% critico (parte da 1%); Saggezza +3 Mente MAX +1 Cura.
- Soglia 2 di ogni segno = "Segno" con bonus fissi + un +1 a scelta (Fuoco/Terra/Aria/Acqua).
- Ofiuco: se tutti e 12 i segni hanno almeno 1 punto, tutte le statistiche derivate raddoppiano.
- Armor: quella di base (Resistenza + Segni) si divide a mano tra Fisica e Magica con un cursore; gli oggetti aggiungono Fisica o Magica.
- Oggetti equipaggiati applicano `mods` (categorie e statistiche). I requisiti (`req`) bloccano l'equipaggiamento.
- Armi dello Zodiaco: con 5 punti nel segno si ottengono dalla tab Zodiaco. Armi dei 4 elementi: 1 punto in tutti e 3 i segni dell'elemento.
- Consumabili con effetto speciale: Anello della Stella Cadente (azzera i segni, Rango invariato), Cinque Essenze (+2 a una costellazione). Gli altri consumabili si consumano e l'effetto si applica a mano con le "correzioni manuali".
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

## Tavolo e Master (in costruzione)

SQL in `supabase/tavolo.sql` (tabelle `masters`, `tavolo`, `tavolo_codice`, `giocatori_tavolo`; funzione `entra_tavolo(codice, nome)`; Realtime). Hook `useTavolo` in `src/lib/tavolo.js`; viste `Tavolo.jsx` (giocatore) e `Master.jsx`. Fase 1: codice di accesso, giocatori in tempo reale, Round e turno. Prossime: azioni del Master (danni/oggetti, il giocatore conferma e l'Armor è già sottratta: fisico su Corpo, magico su Mente, puro a scelta), mostri in campo (i giocatori vedono solo l'immagine, i dettagli solo pagando 1 Sybil), abilità usate nello storico.
Regole del Master: l'Armor Fisica/Magica si sottrae ai danni dello stesso tipo, i danni puri la ignorano; il turno avanza con il tasto del Master.
