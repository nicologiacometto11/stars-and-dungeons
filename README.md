# Stars & Dungeons

Companion web app per il GDR: scheda personaggio, Ruota dello Zodiaco, Negozio, Inventario, Bestiario, Craft e Ricevi.
Ogni giocatore ha un account e una scheda che resta salvata per sempre e si aggiorna a ogni sessione.

## Avvio in locale

```bash
npm install
npm run dev
```

Senza configurare Supabase l'app parte in **modalità locale**: la scheda è salvata nel browser (utile per provare).

## Salvataggio online (Supabase)

1. Crea un progetto su https://supabase.com
2. SQL Editor → incolla ed esegui `supabase/schema.sql`
3. Authentication → Providers → Email: attivo. Per i test puoi disattivare "Confirm email".
4. Copia `.env.example` in `.env` e inserisci Project URL e anon key (Project Settings → API)
5. `npm run dev`

Ogni account vede e modifica solo la propria scheda (Row Level Security).

## Deploy (Netlify)

Build command `npm run build`, publish directory `dist`. Aggiungi le due variabili `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nelle impostazioni del sito.

## Dove si modificano i dati di gioco

| File | Contenuto |
| --- | --- |
| `src/data/zodiac.js` | Segni, soglie, abilità, Ofiuco |
| `src/data/items.js` | Armi e oggetti (prezzi, requisiti, bonus) |
| `src/data/craft.js` | Materiali e ricette di Craft |
| `src/data/monsters.js` | Bestiario: una riga per mostro, costi in Sybil |
| `src/data/ambienti.json` | Mappe e immagini dei luoghi |

Immagini mostri: `public/images/monsters/<id>.webp` (id = nome del mostro in minuscolo con i trattini).
Immagini luoghi e mappe: `public/images/ambienti/<ambiente>/`.

## Come funzionano i calcoli

Si salvano solo Rango, punti sui 12 segni, inventario, Aureos e riserve spese.
Categorie, Corpo/Mente MAX, Armor, Fato, Sybil, Cura, bonus ai dadi e Ofiuco si ricalcolano in `src/lib/rules.js`.
