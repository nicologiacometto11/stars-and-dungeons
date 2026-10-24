import { defineConfig } from '@playwright/test'

// I test girano in modalità locale (senza Supabase): non toccano mai i dati veri.
export default defineConfig({
  testDir: './tests',
  timeout: 40000,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:5199', headless: true, viewport: { width: 420, height: 900 } },
  webServer: {
    command: 'npx vite --port 5199 --strictPort',
    cwd: '..',
    url: 'http://localhost:5199',
    reuseExistingServer: false,
    env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
  },
})
