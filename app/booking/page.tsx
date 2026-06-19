'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar, Users, CheckCircle2, X, Eye, EyeOff, ChevronRight, Lock,
} from 'lucide-react'
import { useAuth, mockLogin } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}
function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}
function diffNights(a: string, b: string) {
  if (!a || !b) return 0
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { login } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputStyle: React.CSSProperties = {
    background: '#fff', border: '1px solid rgba(33,34,34,0.12)',
    fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 300,
    color: '#212222', padding: '0.75rem 1rem', outline: 'none', width: '100%',
    transition: 'border-color 0.3s',
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 600))
    const user = mockLogin(email, password)
    if (user) {
      login(user)
      onSuccess()
    } else {
      setError('Identifiants incorrects. Essayez client@sra-hotel.com / Client2024!')
    }
    setLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 800))
    // Mock: auto-login with client credentials
    const user = mockLogin('client@sra-hotel.com', 'Client2024!')
    if (user) {
      login({ ...user, nom, prenom, email })
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 460, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Close */}
        <button onClick={onClose} aria-label="Fermer"
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#bbbcc1', display: 'flex' }}>
          <X size={20} />
        </button>

        <div style={{ padding: '2rem 2.2rem 2.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Lock size={14} style={{ color: '#c5985b' }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b' }}>
              Authentification requise
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: '#212222', marginBottom: '1.4rem' }}>
            {tab === 'login' ? 'Connectez-vous pour finaliser' : 'Créer votre compte'}
          </h2>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(33,34,34,0.1)', marginBottom: '1.6rem' }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                style={{
                  padding: '0.6rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em',
                  color: tab === t ? '#c5985b' : '#bbbcc1',
                  borderBottom: tab === t ? '2px solid #c5985b' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.2s',
                }}>
                {t === 'login' ? 'Se connecter' : 'Créer un compte'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#c5985b')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')} />
              </div>
              <div>
                <label style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', display: 'block', marginBottom: '0.4rem' }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ ...inputStyle, paddingRight: '2.8rem' }}
                    onFocus={e => (e.target.style.borderColor = '#c5985b')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6c6c', display: 'flex' }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {error && <div style={{ background: 'rgba(224,85,85,0.08)', borderLeft: '2px solid #e05555', padding: '0.6rem 0.8rem', fontSize: '0.82rem', color: '#c0392b' }}>{error}</div>}
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '0.9rem', background: '#c5985b', color: '#fff', border: 'none', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.2rem' }}>
                {loading ? 'Connexion…' : 'Se connecter et finaliser'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', display: 'block', marginBottom: '0.4rem' }}>Nom</label>
                  <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Traoré" required style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#c5985b')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')} />
                </div>
                <div>
                  <label style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', display: 'block', marginBottom: '0.4rem' }}>Prénom</label>
                  <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Ibrahima" required style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#c5985b')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#c5985b')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')} />
              </div>
              <div>
                <label style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', display: 'block', marginBottom: '0.4rem' }}>Téléphone</label>
                <input value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+225 07 00 00 00" required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#c5985b')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')} />
              </div>
              <div>
                <label style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', display: 'block', marginBottom: '0.4rem' }}>Mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#c5985b')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')} />
              </div>
              {error && <div style={{ background: 'rgba(224,85,85,0.08)', borderLeft: '2px solid #e05555', padding: '0.6rem 0.8rem', fontSize: '0.82rem', color: '#c0392b' }}>{error}</div>}
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '0.9rem', background: '#c5985b', color: '#fff', border: 'none', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.2rem' }}>
                {loading ? 'Création du compte…' : 'Créer et finaliser'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Booking Page ──────────────────────────────────────────────────────────────
export default function BookingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { lines, total, clearCart } = useCart()

  const [nom, setNom] = useState(user?.nom ?? '')
  const [prenom, setPrenom] = useState(user?.prenom ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [telephone, setTelephone] = useState('')
  const [demandes, setDemandes] = useState('')
  const [cgv, setCgv] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [refNumber] = useState(`SRA-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*900)+100)}`)
  const [error, setError] = useState('')

  const inputStyle: React.CSSProperties = {
    background: '#fff', border: '1px solid rgba(33,34,34,0.12)',
    fontFamily: 'var(--font-sans)', fontSize: '0.92rem', fontWeight: 300,
    color: '#212222', padding: '0.9rem 1.1rem', outline: 'none', width: '100%',
    transition: 'border-color 0.3s',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: '#c5985b', display: 'block', marginBottom: '0.45rem',
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cgv) { setError('Veuillez accepter les conditions générales.'); return }
    if (!nom || !prenom || !email || !telephone) { setError('Veuillez remplir tous les champs obligatoires.'); return }
    setError('')
    if (!user) {
      setShowAuthModal(true)
      return
    }
    finalize()
  }

  function finalize() {
    // Mock: simply confirm
    setConfirmed(true)
    clearCart()
    setShowAuthModal(false)
  }

  if (lines.length === 0 && !confirmed) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#6b6c6c', marginBottom: '1.5rem' }}>Votre panier est vide.</p>
            <Link href="/recherche" style={{ color: '#c5985b', fontWeight: 600 }}>Voir les chambres</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (confirmed) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7rem 1.5rem 4rem' }}>
          <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(74,180,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.8rem' }}>
              <CheckCircle2 size={36} style={{ color: '#4ab44a' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: '#212222', marginBottom: '0.8rem' }}>
              Réservation confirmée !
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#6b6c6c', lineHeight: 1.7, marginBottom: '0.5rem' }}>
              Votre réservation a bien été enregistrée.
            </p>
            <div style={{ display: 'inline-block', background: 'rgba(197,152,91,0.08)', border: '1px solid rgba(197,152,91,0.25)', padding: '0.6rem 1.4rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#c5985b', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Référence :</span>
              <span style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#212222', letterSpacing: '0.08em' }}>{refNumber}</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#6b6c6c', marginBottom: '2rem' }}>
              Un email de confirmation a été envoyé à <strong>{email}</strong>
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/dashboard"
                style={{ background: '#c5985b', color: '#fff', padding: '0.85rem 2rem', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
                Mon espace client
              </Link>
              <Link href="/"
                style={{ background: 'transparent', border: '1px solid rgba(33,34,34,0.2)', color: '#212222', padding: '0.85rem 2rem', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const totalNuits = lines.reduce((acc, l) => acc + diffNights(l.check_in, l.check_out), 0)

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#f7f5f1', paddingTop: '6rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 1.5rem' }}>

          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.6rem' }}>
              Étape finale
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 400, color: '#212222', margin: 0 }}>
              Finaliser votre réservation
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
              {/* Section: Contact */}
              <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 400, color: '#212222', marginBottom: '1.4rem' }}>
                  Vos coordonnées
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Nom *</label>
                    <input value={nom} onChange={e => setNom(e.target.value)} required placeholder="Traoré" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = '#c5985b')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Prénom *</label>
                    <input value={prenom} onChange={e => setPrenom(e.target.value)} required placeholder="Ibrahima" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = '#c5985b')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="votre@email.com" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = '#c5985b')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Téléphone *</label>
                    <input value={telephone} onChange={e => setTelephone(e.target.value)} required placeholder="+225 07 00 00 00" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = '#c5985b')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')} />
                  </div>
                </div>
              </div>

              {/* Section: Demandes */}
              <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 400, color: '#212222', marginBottom: '1.4rem' }}>
                  Demandes spéciales
                </h2>
                <label style={labelStyle}>Informations supplémentaires (optionnel)</label>
                <textarea value={demandes} onChange={e => setDemandes(e.target.value)}
                  placeholder="Ex: chambre haute, lit bébé, allergie alimentaire…"
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                  onFocus={e => (e.target.style.borderColor = '#c5985b')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')} />
                <p style={{ fontSize: '0.75rem', color: '#bbbcc1', marginTop: '0.5rem' }}>
                  Les demandes spéciales ne sont pas garanties et restent soumises à disponibilité.
                </p>
              </div>

              {/* CGV + errors */}
              <div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={cgv} onChange={e => setCgv(e.target.checked)}
                    style={{ marginTop: '0.2rem', accentColor: '#c5985b' }} />
                  <span style={{ fontSize: '0.84rem', color: '#6b6c6c', lineHeight: 1.6 }}>
                    J&apos;accepte les{' '}
                    <Link href="#" style={{ color: '#c5985b' }}>conditions générales de vente</Link>
                    {' '}et la{' '}
                    <Link href="#" style={{ color: '#c5985b' }}>politique d&apos;annulation</Link>
                    {' '}du Sweet Rest Aparthotel.
                  </span>
                </label>
                {error && (
                  <div style={{ background: 'rgba(224,85,85,0.08)', borderLeft: '2px solid #e05555', padding: '0.7rem 0.9rem', fontSize: '0.84rem', color: '#c0392b', marginTop: '1rem' }}>
                    {error}
                  </div>
                )}
              </div>

              <button type="submit"
                style={{
                  width: '100%', padding: '1.1rem', background: '#c5985b', color: '#fff', border: 'none',
                  fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.2em',
                  textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#8f6b36')}
                onMouseLeave={e => (e.currentTarget.style.background = '#c5985b')}>
                {!user && <Lock size={14} />}
                Confirmer la réservation
                <ChevronRight size={14} />
              </button>
              {!user && (
                <p style={{ fontSize: '0.78rem', color: '#bbbcc1', textAlign: 'center', marginTop: '-0.5rem' }}>
                  Une connexion sera requise pour finaliser
                </p>
              )}
            </form>

            {/* Summary */}
            <div style={{ position: 'sticky', top: '5.5rem' }}>
              <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.8rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 400, color: '#212222', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(33,34,34,0.08)' }}>
                  Récapitulatif
                </h2>

                {lines.map(line => {
                  const nights = diffNights(line.check_in, line.check_out)
                  return (
                    <div key={line.key} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(33,34,34,0.06)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#212222', marginBottom: '0.3rem' }}>{line.room_nom}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: '#6b6c6c', marginBottom: '0.2rem' }}>
                        <Calendar size={12} />
                        <span>{formatDate(line.check_in)} – {formatDate(line.check_out)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: '#6b6c6c', marginBottom: '0.4rem' }}>
                        <Users size={12} />
                        <span>{line.adultes} adulte{line.adultes > 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: '#6b6c6c' }}>{nights} nuit{nights > 1 ? 's' : ''}</span>
                        <span style={{ color: '#212222', fontWeight: 500 }}>{formatPrice(line.prix_total_ligne)}</span>
                      </div>
                    </div>
                  )
                })}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.6rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#6b6c6c' }}>Total ({totalNuits} nuit{totalNuits > 1 ? 's' : ''})</span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#212222' }}>{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/panier"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginTop: '0.8rem', fontSize: '0.78rem', color: '#bbbcc1', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c5985b')}
                onMouseLeave={e => (e.currentTarget.style.color = '#bbbcc1')}>
                ← Modifier le panier
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={finalize} />
      )}
    </>
  )
}
