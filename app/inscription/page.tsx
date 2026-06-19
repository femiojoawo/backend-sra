'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ── Mock API skeletons ────────────────────────────────────────────────────────
async function _apiCreateClient(_payload: { prenom: string; nom: string; email: string; telephone?: string; password: string }) {
  // POST /api/auth/register
  await new Promise(r => setTimeout(r, 600))
}
async function _apiLogin(_payload: { email: string; password: string }) {
  // POST /api/auth/login
  await new Promise(r => setTimeout(r, 400))
  return { client_id: 4, access_token: 'mock-client-token' }
}

function RegisterForm() {
  const router = useRouter()
  const { login } = useAuth()

  const [form, setForm] = useState({ prenom: '', nom: '', email: '', telephone: '', password: '', confirm: '' })
  const [showPw, setShowPw]     = useState(false)
  const [showCf, setShowCf]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  function update(key: string, val: string) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { prenom, nom, email, password, confirm, telephone } = form
    if (!prenom || !nom || !email || !password) { setError('Veuillez remplir tous les champs obligatoires.'); return }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setError('')
    setLoading(true)
    try {
      await _apiCreateClient({ prenom, nom, email, telephone: telephone || undefined, password })
      const auth = await _apiLogin({ email, password })
      login({ clientId: auth.client_id, token: auth.access_token, nom, prenom, email, role: 'CLIENT' })
      router.push('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la création du compte."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: '#fff', border: '1px solid rgba(33,34,34,0.12)',
    fontFamily: 'var(--font-sans)', fontSize: '0.92rem', fontWeight: 300,
    color: '#212222', padding: '0.9rem 1.1rem', outline: 'none', width: '100%',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b',
  }

  const strengths = [
    { label: 'Au moins 6 caractères', ok: form.password.length >= 6 },
    { label: 'Contient un chiffre',   ok: /\d/.test(form.password) },
    { label: 'Mots de passe identiques', ok: form.confirm.length > 0 && form.password === form.confirm },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7rem 1.5rem 4rem' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://sra-hotel.com/media/logo-SweetRestAparthotel_color.png" alt="Sweet Rest Aparthotel" style={{ maxWidth: 160, margin: '0 auto 1.2rem' }} />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: '#212222', marginBottom: '0.4rem' }}>
            Créer votre compte
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#6b6c6c', lineHeight: 1.6 }}>Rejoignez Sweet Rest Aparthotel</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '2.8rem 2.5rem 2.4rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }} className="max-sm:grid-cols-1">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Prénom *</label>
                <input style={inputStyle} type="text" placeholder="Jean-Marc" value={form.prenom} onChange={e => update('prenom', e.target.value)} required autoComplete="given-name"
                  onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Nom *</label>
                <input style={inputStyle} type="text" placeholder="Kouassi" value={form.nom} onChange={e => update('nom', e.target.value)} required autoComplete="family-name"
                  onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }} />
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={labelStyle}>Email *</label>
              <input style={inputStyle} type="email" placeholder="contact@email.com" value={form.email} onChange={e => update('email', e.target.value)} required autoComplete="email"
                onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }} />
            </div>

            {/* Phone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={labelStyle}>Téléphone</label>
              <input style={inputStyle} type="tel" placeholder="+225 01 50 67 86 95" value={form.telephone} onChange={e => update('telephone', e.target.value)} autoComplete="tel"
                onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }} />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={labelStyle}>Mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inputStyle, paddingRight: '3rem' }} type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} required autoComplete="new-password"
                  onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }} />
                <button type="button" onClick={() => setShowPw(v => !v)} aria-label="Afficher le mot de passe"
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6c6c', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={labelStyle}>Confirmer le mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inputStyle, paddingRight: '3rem' }} type={showCf ? 'text' : 'password'} placeholder="••••••••" value={form.confirm} onChange={e => update('confirm', e.target.value)} required autoComplete="new-password"
                  onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }} />
                <button type="button" onClick={() => setShowCf(v => !v)} aria-label="Afficher la confirmation"
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6c6c', display: 'flex', alignItems: 'center' }}>
                  {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password strength hints */}
            {form.password.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.8rem 1rem', background: '#f7f5f1', borderLeft: '2px solid rgba(197,152,91,0.4)' }}>
                {strengths.map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: s.ok ? '#2d7a4f' : '#6b6c6c' }}>
                    <CheckCircle size={13} style={{ color: s.ok ? '#2d7a4f' : '#d0d0d0' }} />
                    {s.label}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(224,85,85,0.08)', borderLeft: '2px solid #e05555', padding: '0.7rem 0.9rem', fontSize: '0.84rem', color: '#c0392b' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '1rem', background: '#c5985b', color: '#fff', border: 'none',
                fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'all 0.3s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#8f6b36' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#c5985b' }}
            >
              {loading ? 'Création du compte…' : 'Créer mon compte'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.6rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(33,34,34,0.09)' }} />
            <span style={{ fontSize: '0.72rem', color: '#bbbcc1', letterSpacing: '0.1em' }}>OU</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(33,34,34,0.09)' }} />
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#6b6c6c' }}>
            Déjà un compte ?{' '}
            <Link href="/connexion" style={{ color: '#c5985b', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Se connecter
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" style={{ fontSize: '0.78rem', color: '#bbbcc1', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c5985b')}
            onMouseLeave={e => (e.currentTarget.style.color = '#bbbcc1')}
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function InscriptionPage() {
  return (
    <>
      <Navbar />
      <RegisterForm />
      <Footer />
    </>
  )
}
