'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Info } from 'lucide-react'
import { useAuth, mockLogin } from '@/lib/auth-context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Suspense } from 'react'

const DEMO_ACCOUNTS = [
  { role: 'Client',          email: 'client@sra-hotel.com',    password: 'Client2024!',    redirect: '/dashboard' },
  { role: 'Administrateur',  email: 'admin@sra-hotel.com',     password: 'Admin2024!',     redirect: '/dashboard/admin' },
  { role: 'Réception',       email: 'reception@sra-hotel.com', password: 'Reception2024!', redirect: '/dashboard/reception' },
  { role: 'Ménage',          email: 'menage@sra-hotel.com',    password: 'Menage2024!',    redirect: '/dashboard/menage' },
]

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const { login } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showDemo, setShowDemo] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return }
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600)) // simulate network
    const user = mockLogin(email, password)
    if (user) {
      login(user)
      const dest = redirect !== '/'
        ? redirect
        : user.role === 'CLIENT' ? '/dashboard'
        : user.role === 'ADMIN' ? '/dashboard/admin'
        : user.role === 'RECEPTION' ? '/dashboard/reception'
        : '/dashboard/menage'
      router.push(dest)
    } else {
      setError('Identifiants incorrects. Utilisez un des comptes de démo ci-dessous.')
    }
    setLoading(false)
  }

  function fillDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  const inputStyle: React.CSSProperties = {
    background: '#fff', border: '1px solid rgba(33,34,34,0.12)',
    fontFamily: 'var(--font-sans)', fontSize: '0.92rem', fontWeight: 300,
    color: '#212222', padding: '0.9rem 1.1rem', outline: 'none', width: '100%',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7rem 1.5rem 4rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://sra-hotel.com/media/logo-SweetRestAparthotel_color.png" alt="Sweet Rest Aparthotel" style={{ maxWidth: 160, margin: '0 auto 1.2rem' }} />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: '#212222', marginBottom: '0.4rem' }}>
            Bon retour parmi nous
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#6b6c6c', lineHeight: 1.6 }}>Connectez-vous à votre espace client</p>
        </div>

        {/* Demo banner */}
        <div style={{ background: 'rgba(197,152,91,0.08)', border: '1px solid rgba(197,152,91,0.3)', marginBottom: '1.4rem', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setShowDemo(v => !v)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer', gap: '0.6rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', color: '#c5985b', textTransform: 'uppercase' }}>
              <Info size={14} />
              Comptes de démonstration
            </span>
            <span style={{ fontSize: '0.7rem', color: '#c5985b' }}>{showDemo ? '▲' : '▼'}</span>
          </button>
          {showDemo && (
            <div style={{ borderTop: '1px solid rgba(197,152,91,0.2)', padding: '0.8rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {DEMO_ACCOUNTS.map(a => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => fillDemo(a)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.8rem', background: '#fff', border: '1px solid rgba(33,34,34,0.1)', cursor: 'pointer', transition: 'border-color 0.2s', textAlign: 'left', gap: '1rem' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#c5985b')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(33,34,34,0.1)')}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#212222' }}>{a.role}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b6c6c', marginTop: 2 }}>{a.email}</div>
                  </div>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#c5985b', whiteSpace: 'nowrap' }}>{a.password}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '2.8rem 2.5rem 2.4rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b' }}>Email *</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="contact@email.com" autoComplete="email" required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b' }}>Mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password" required
                  style={{ ...inputStyle, paddingRight: '3rem' }}
                  onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6c6c', display: 'flex', alignItems: 'center' }}
                  aria-label={showPw ? 'Masquer' : 'Afficher'}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

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
              onMouseLeave={e => { e.currentTarget.style.background = '#c5985b' }}>
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.6rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(33,34,34,0.09)' }} />
            <span style={{ fontSize: '0.72rem', color: '#bbbcc1', letterSpacing: '0.1em' }}>OU</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(33,34,34,0.09)' }} />
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#6b6c6c' }}>
            Pas encore de compte ?{' '}
            <Link href="/inscription" style={{ color: '#c5985b', fontWeight: 500 }}>Créer un compte</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" style={{ fontSize: '0.78rem', color: '#bbbcc1', letterSpacing: '0.05em', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c5985b')}
            onMouseLeave={e => (e.currentTarget.style.color = '#bbbcc1')}>
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ConnexionPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div />}>
        <LoginForm />
      </Suspense>
      <Footer />
    </>
  )
}
