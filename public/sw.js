// Service worker: l'app si apre anche con poca o nessuna connessione.
// - pagina (index.html): prima la rete, così le novità arrivano subito; se offline, la copia salvata
// - file dell'app e immagini: dalla copia salvata, aggiornata in background
// - Supabase e altri siti: mai toccati (i dati della scheda passano sempre dalla rete)
const CACHE = 'sd-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((chiavi) => Promise.all(chiavi.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone()
          caches.open(CACHE).then((c) => c.put('./', copia))
          return res
        })
        .catch(() => caches.match('./')),
    )
    return
  }

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const salvata = await cache.match(req)
      const rete = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone())
          return res
        })
        .catch(() => salvata)
      return salvata || rete
    }),
  )
})
