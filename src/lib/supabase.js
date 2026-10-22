import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Se le variabili non sono configurate l'app funziona in modalità locale (dati nel browser).
export const supabase = url && key && !url.includes('xxxx') ? createClient(url, key) : null
export const modalitaOnline = !!supabase
