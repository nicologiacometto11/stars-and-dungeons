// Persistenza della scheda: Supabase (online, per account) oppure localStorage (modalità locale).
import { supabase } from './supabase.js'
import { normalizza } from './rules.js'

const LOCAL_KEY = 'stars-and-dungeons:scheda'

export async function caricaScheda(userId) {
  if (supabase && userId) {
    const { data, error } = await supabase.from('characters').select('data').eq('user_id', userId).maybeSingle()
    if (error) throw error
    return data?.data && Object.keys(data.data).length ? normalizza(data.data) : null
  }
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? normalizza(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export async function salvaScheda(userId, scheda) {
  if (supabase && userId) {
    const { error } = await supabase
      .from('characters')
      .upsert({ user_id: userId, data: scheda, updated_at: new Date().toISOString() })
    if (error) throw error
    return
  }
  localStorage.setItem(LOCAL_KEY, JSON.stringify(scheda))
}

export function esportaJSON(scheda) {
  const blob = new Blob([JSON.stringify(scheda, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${(scheda.nome || 'personaggio').replace(/\s+/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}
