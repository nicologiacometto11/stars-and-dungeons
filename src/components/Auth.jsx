import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const traduci = (m = '') => {
  if (/invalid login/i.test(m)) return 'Email o password errate.'
  if (/already registered/i.test(m)) return 'Esiste già un account con questa email: accedi.'
  if (/password/i.test(m) && /6/.test(m)) return 'La password deve avere almeno 6 caratteri.'
  if (/email not confirmed/i.test(m)) return 'Conferma prima la tua email (controlla la posta).'
  return m
}

export default function Auth() {
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function invia(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const { data, error } =
      modo === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (error) return setMsg(traduci(error.message))
    if (modo === 'registra' && !data.session) setMsg('Account creato: conferma la tua email e poi accedi.')
  }

  async function google() {
    setMsg('')
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } })
    if (error) setMsg(traduci(error.message))
  }

  async function recupera() {
    if (!email) return setMsg("Scrivi la tua email e poi premi di nuovo 'Password dimenticata?'.")
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + window.location.pathname })
    setBusy(false)
    setMsg(error ? traduci(error.message) : 'Ti ho mandato una mail con il link per scegliere una nuova password.')
  }

  return (
    <div className="centro">
      <form className="card auth" onSubmit={invia}>
        <h1>Stars &amp; Dungeons</h1>
        <p className="muted">{modo === 'login' ? 'Accedi per ritrovare la tua scheda.' : 'Crea il tuo account: la scheda resterà tua per sempre.'}</p>
        <button type="button" onClick={google}>Continua con Google</button>
        <div className="muted centrato"><small>oppure con email</small></div>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={modo === 'login' ? 'current-password' : 'new-password'} />
        {msg && <div className="msg">{msg}</div>}
        <button className="primary" disabled={busy}>{modo === 'login' ? 'Accedi' : 'Registrati'}</button>
        {modo === 'login' && <button type="button" className="ghost" disabled={busy} onClick={recupera}>Password dimenticata?</button>}
        <button type="button" className="ghost" onClick={() => { setModo(modo === 'login' ? 'registra' : 'login'); setMsg('') }}>
          {modo === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
        </button>
      </form>
    </div>
  )
}

export function NuovaPassword({ onFatto }) {
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function salva(e) {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) return setMsg(traduci(error.message))
    onFatto()
  }

  return (
    <div className="centro">
      <form className="card auth" onSubmit={salva}>
        <h1>Nuova password</h1>
        <input type="password" placeholder="Nuova password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" autoFocus />
        {msg && <div className="msg">{msg}</div>}
        <button className="primary" disabled={busy}>Salva</button>
      </form>
    </div>
  )
}
