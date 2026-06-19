'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Star, Coffee, MapPin, User, LogOut,
  ChevronRight, CheckCircle2, Clock, XCircle, Bed,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { MOCK_RESERVATIONS, type MockReservation } from '@/lib/mock-data'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

const statusConfig = {
  CONFIRMEE: { label: 'Confirmée',  icon: <CheckCircle2 size={13} />, bg: 'rgba(74,180,74,0.1)',  color: '#2e8b2e' },
  TERMINEE:  { label: 'Terminée',   icon: <Clock size={13} />,        bg: 'rgba(107,108,108,0.1)', color: '#6b6c6c' },
  ANNULEE:   { label: 'Annulée',    icon: <XCircle size={13} />,      bg: 'rgba(224,85,85,0.1)',  color: '#c0392b' },
}

function ReservationCard({ r }: { r: MockReservation }) {
  const s = statusConfig[r.statut]
  const firstLine = r.lignes[0]
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.4rem 1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: 220 }}>
        <div style={{ width: 56, height: 56, flexShrink: 0, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={firstLine.photo} alt={firstLine.type_chambre}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', marginBottom: 2 }}>
            {r.reference}
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#212222' }}>
            {r.lignes.length > 1 ? `${r.lignes.length} hébergements` : firstLine.type_chambre}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b6c6c', marginTop: 2 }}>
            {formatDate(firstLine.check_in)} → {formatDate(firstLine.check_out)}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#212222' }}>
          {formatPrice(r.prix_total)}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.7rem', fontSize: '0.72rem', fontWeight: 600, background: s.bg, color: s.color }}>
          {s.icon}
          {s.label}
        </span>
        <Link href={`/reservations/${r.reference}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#c5985b', textDecoration: 'none', whiteSpace: 'nowrap' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          Voir <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}

type FilterType = 'TOUTES' | 'CONFIRMEE' | 'TERMINEE' | 'ANNULEE'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [filter, setFilter] = useState<FilterType>('TOUTES')

  if (!user) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#6b6c6c', marginBottom: '1.5rem' }}>Vous devez être connecté pour accéder à votre espace.</p>
            <Link href="/connexion" style={{ background: '#c5985b', color: '#fff', padding: '0.85rem 2rem', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Se connecter
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const filtered = filter === 'TOUTES' ? MOCK_RESERVATIONS : MOCK_RESERVATIONS.filter(r => r.statut === filter)
  const confirmed = MOCK_RESERVATIONS.filter(r => r.statut === 'CONFIRMEE')
  const nextStay = confirmed[0]?.lignes[0]

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#f7f5f1', paddingTop: '6rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Welcome */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.5rem' }}>
                <LayoutDashboard size={11} style={{ display: 'inline', marginRight: 6 }} />
                Espace Client
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: '#212222', margin: 0 }}>
                Bienvenue, {user.prenom}
              </h1>
            </div>
            <button onClick={() => { logout(); router.push('/') }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid rgba(33,34,34,0.15)', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.75rem', color: '#6b6c6c', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c5985b'; e.currentTarget.style.color = '#c5985b' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(33,34,34,0.15)'; e.currentTarget.style.color = '#6b6c6c' }}>
              <LogOut size={14} />
              Déconnexion
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Réservations', value: MOCK_RESERVATIONS.length, icon: <Calendar size={20} />, sub: 'au total' },
              { label: 'Séjours à venir', value: confirmed.length, icon: <Bed size={20} />, sub: 'confirmé' + (confirmed.length > 1 ? 's' : '') },
              { label: 'Sweet Points', value: '2 450', icon: <Star size={20} />, sub: 'points fidélité' },
            ].map(item => (
              <div key={item.label} style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.4rem 1.6rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(197,152,91,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5985b', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 400, color: '#212222', lineHeight: 1 }}>{item.value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6b6c6c', marginTop: 3 }}>{item.label}</div>
                  <div style={{ fontSize: '0.68rem', color: '#bbbcc1' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Prochain séjour */}
          {nextStay && (
            <div style={{ background: 'linear-gradient(135deg, #212222 0%, #3a3b3b 100%)', padding: '1.8rem 2rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.5rem' }}>
                  Prochain séjour
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: '#fff', marginBottom: '0.4rem' }}>
                  {nextStay.type_chambre} — Ch. {nextStay.chambre_numero}
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                  {formatDate(nextStay.check_in)} → {formatDate(nextStay.check_out)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <Link href={`/check-in/${MOCK_RESERVATIONS[0].reference}`}
                  style={{ background: '#c5985b', color: '#fff', padding: '0.75rem 1.4rem', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Check-in en ligne <ChevronRight size={13} />
                </Link>
                <Link href="/room-service"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '0.75rem 1.4rem', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
                  Room Service
                </Link>
              </div>
            </div>
          )}

          {/* Shortcuts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {[
              { href: '/room-service',  icon: <Coffee size={18} />,  label: 'Room Service',    sub: 'Commander en chambre' },
              { href: '/conciergerie', icon: <MapPin size={18} />,   label: 'Conciergerie',    sub: 'Assistance & activités' },
              { href: '/profil',       icon: <User size={18} />,     label: 'Mon Profil',      sub: 'Modifier mes infos' },
              { href: '/recherche',    icon: <Calendar size={18} />, label: 'Nouvelle résa',   sub: 'Réserver une chambre' },
            ].map(s => (
              <Link key={s.href} href={s.href}
                style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', textDecoration: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c5985b'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(197,152,91,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(33,34,34,0.09)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ color: '#c5985b' }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#212222' }}>{s.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#bbbcc1', marginTop: 2 }}>{s.sub}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Reservations */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem', flexWrap: 'wrap', gap: '0.8rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: '#212222', margin: 0 }}>
                Mes réservations
              </h2>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {(['TOUTES', 'CONFIRMEE', 'TERMINEE', 'ANNULEE'] as FilterType[]).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{
                      padding: '0.4rem 0.9rem', background: filter === f ? '#c5985b' : 'transparent',
                      border: `1px solid ${filter === f ? '#c5985b' : 'rgba(33,34,34,0.15)'}`,
                      color: filter === f ? '#fff' : '#6b6c6c',
                      fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em',
                      cursor: 'pointer', transition: 'all 0.2s',
                      textTransform: f === 'TOUTES' ? 'capitalize' : 'capitalize',
                    }}>
                    {f === 'TOUTES' ? 'Toutes' : statusConfig[f as keyof typeof statusConfig].label}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: '#bbbcc1', fontSize: '0.9rem' }}>Aucune réservation dans cette catégorie.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {filtered.map(r => <ReservationCard key={r.id} r={r} />)}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
