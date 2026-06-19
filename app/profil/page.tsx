'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, CalendarDays, LogOut, Save, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getClient, updateClient } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

function ProfilContent() {
  const router = useRouter()
  const { user, logout, login } = useAuth()

  const [tab, setTab]     = useState<'infos' | 'password'>('infos')
  const [form, setForm]   = useState({ nom: '', prenom: '', telephone: '' })
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!user) { router.push('/connexion'); return }
    getClient(user.clientId, user.token)
      .then(c => { setForm({ nom: c.nom, prenom: c.prenom, telephone: c.telephone ?? '' }) })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [user, router])

  function update(key: string, val: string) { setForm(f => ({ ...f, [key]: val })) }

  async function saveInfos(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!form.nom || !form.prenom) { setError('Nom et prénom obligatoires.'); return }
    setError(''); setSuccess(''); setLoading(true)
    try {
      const updated = await updateClient(user.clientId, { nom: form.nom, prenom: form.prenom, telephone: form.telephone || undefined }, user.token)
      login({ ...user, nom: updated.nom, prenom: updated.prenom })
      setSuccess('Informations mises à jour avec succès.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.')
    } finally {
      setLoading(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (pwForm.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    if (pwForm.password !== pwForm.confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setError(''); setSuccess(''); setLoading(true)
    try {
      await updateClient(user.clientId, { password: pwForm.password }, user.token)
      setSuccess('Mot de passe modifié avec succès.')
      setPwForm({ password: '', confirm: '' })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification.')
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

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f1', paddingTop: '7rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Page header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1rem' }}>
            <span style={{ width: 28, height: 1, background: '#c5985b', display: 'inline-block' }} />
            Espace client
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 400, color: '#212222', lineHeight: 1.15 }}>
            Bonjour, <em style={{ fontStyle: 'italic', color: '#c5985b' }}>{user.prenom}</em>
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#6b6c6c', marginTop: '0.5rem' }}>Gérez vos informations personnelles et vos réservations.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', alignItems: 'start' }} className="max-md:grid-cols-1">

          {/* Sidebar */}
          <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)' }}>
            {/* Avatar */}
            <div style={{ padding: '2rem', borderBottom: '1px solid rgba(33,34,34,0.09)', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#212222', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <User size={32} color="#c5985b" />
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#212222', marginBottom: '0.25rem' }}>{user.prenom} {user.nom}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b6c6c', wordBreak: 'break-all' }}>{user.email}</div>
            </div>

            {/* Nav */}
            <nav style={{ padding: '1rem 0' }}>
              {[
                { key: 'infos',    icon: <User size={15} />,         label: 'Mes informations' },
                { key: 'password', icon: <Lock size={15} />,         label: 'Mot de passe' },
              ].map(item => (
                <button key={item.key}
                  onClick={() => { setTab(item.key as 'infos' | 'password'); setError(''); setSuccess('') }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.85rem 1.4rem', background: tab === item.key ? '#f7f5f1' : 'transparent',
                    border: 'none', borderLeft: tab === item.key ? '2px solid #c5985b' : '2px solid transparent',
                    color: tab === item.key ? '#c5985b' : '#6b6c6c', fontSize: '0.82rem', fontWeight: 500,
                    letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    transition: 'all 0.2s', textAlign: 'left',
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              <div style={{ margin: '0.5rem 1.4rem', height: 1, background: 'rgba(33,34,34,0.09)' }} />

              <Link href="/mes-reservations"
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.4rem', color: '#6b6c6c', fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.06em', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c5985b')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b6c6c')}
              >
                <CalendarDays size={15} />
                Mes réservations
              </Link>

              <button onClick={logout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.4rem', background: 'transparent', border: 'none', color: '#6b6c6c', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'color 0.2s', textAlign: 'left' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e05555')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b6c6c')}
              >
                <LogOut size={15} />
                Déconnexion
              </button>
            </nav>
          </div>

          {/* Main panel */}
          <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '2.5rem' }} className="max-sm:px-5">
            {fetching ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: '#bbbcc1' }}>Chargement…</div>
            ) : tab === 'infos' ? (
              <>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: '#212222', marginBottom: '1.8rem' }}>Mes informations</h2>
                <form onSubmit={saveInfos} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }} className="max-sm:grid-cols-1">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={labelStyle}>Prénom *</label>
                      <input style={inputStyle} type="text" value={form.prenom} onChange={e => update('prenom', e.target.value)} required
                        onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={labelStyle}>Nom *</label>
                      <input style={inputStyle} type="text" value={form.nom} onChange={e => update('nom', e.target.value)} required
                        onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Email</label>
                    <input style={{ ...inputStyle, background: '#f7f5f1', color: '#bbbcc1', cursor: 'not-allowed' }} type="email" value={user.email} readOnly />
                    <span style={{ fontSize: '0.72rem', color: '#bbbcc1' }}>{"L'email ne peut pas être modifié."}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Téléphone</label>
                    <input style={inputStyle} type="tel" value={form.telephone} onChange={e => update('telephone', e.target.value)} placeholder="+225 01 50 67 86 95"
                      onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }} />
                  </div>

                  {error   && <div style={{ background: 'rgba(224,85,85,0.08)', borderLeft: '2px solid #e05555', padding: '0.7rem 0.9rem', fontSize: '0.84rem', color: '#c0392b' }}>{error}</div>}
                  {success && <div style={{ background: 'rgba(45,122,79,0.08)', borderLeft: '2px solid #2d7a4f', padding: '0.7rem 0.9rem', fontSize: '0.84rem', color: '#2d7a4f' }}>{success}</div>}

                  <button type="submit" disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.9rem 2rem', background: '#c5985b', color: '#fff', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.3s', alignSelf: 'flex-start' }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#8f6b36' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#c5985b' }}
                  >
                    <Save size={14} />
                    {loading ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: '#212222', marginBottom: '1.8rem' }}>Modifier le mot de passe</h2>
                <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Nouveau mot de passe *</label>
                    <input style={inputStyle} type="password" placeholder="••••••••" value={pwForm.password} onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))} required autoComplete="new-password"
                      onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Confirmer le mot de passe *</label>
                    <input style={inputStyle} type="password" placeholder="••••••••" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required autoComplete="new-password"
                      onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.12)'; e.target.style.boxShadow = 'none' }} />
                  </div>

                  {error   && <div style={{ background: 'rgba(224,85,85,0.08)', borderLeft: '2px solid #e05555', padding: '0.7rem 0.9rem', fontSize: '0.84rem', color: '#c0392b' }}>{error}</div>}
                  {success && <div style={{ background: 'rgba(45,122,79,0.08)', borderLeft: '2px solid #2d7a4f', padding: '0.7rem 0.9rem', fontSize: '0.84rem', color: '#2d7a4f' }}>{success}</div>}

                  <button type="submit" disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.9rem 2rem', background: '#c5985b', color: '#fff', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.3s', alignSelf: 'flex-start' }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#8f6b36' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#c5985b' }}
                  >
                    <Lock size={14} />
                    {loading ? 'Modification…' : 'Modifier le mot de passe'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilPage() {
  return (
    <>
      <Navbar />
      <ProfilContent />
      <Footer />
    </>
  )
}
