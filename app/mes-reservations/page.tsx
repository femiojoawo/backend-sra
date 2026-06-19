'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarDays, Clock, X, ChevronRight, Plus, CheckCircle2, XCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { MOCK_RESERVATIONS, type MockReservation } from '@/lib/mock-data'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ── Mock API skeleton ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _apiCancelReservation(_id: number, _token: string): Promise<void> {
  // PUT /api/reservations/{id} with { statut: 'ANNULEE' }
  await new Promise(r => setTimeout(r, 600))
}

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function diffNights(a: string, b: string) {
  if (!a || !b) return 0
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

const statusConfig = {
  CONFIRMEE: { label: 'Confirmée',  icon: <CheckCircle2 size={12} />, bg: 'rgba(74,180,74,0.08)',   color: '#2e8b2e',  border: 'rgba(74,180,74,0.3)' },
  TERMINEE:  { label: 'Terminée',   icon: <Clock size={12} />,        bg: 'rgba(33,34,34,0.06)',    color: '#6b6c6c',  border: 'rgba(33,34,34,0.2)' },
  ANNULEE:   { label: 'Annulée',    icon: <XCircle size={12} />,      bg: 'rgba(224,85,85,0.08)',   color: '#c0392b',  border: 'rgba(224,85,85,0.3)' },
}

const TABS = [
  { key: 'TOUTES',    label: 'Toutes' },
  { key: 'CONFIRMEE', label: 'Confirmées' },
  { key: 'TERMINEE',  label: 'Passées' },
  { key: 'ANNULEE',   label: 'Annulées' },
] as const
type TabKey = (typeof TABS)[number]['key']

function ReservationCard({
  resa,
  onCancel,
}: {
  resa: MockReservation
  onCancel: (id: number) => void
}) {
  const firstLine = resa.lignes[0]
  const nights = diffNights(firstLine.check_in, firstLine.check_out)
  const s = statusConfig[resa.statut]

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', overflow: 'hidden', transition: 'box-shadow 0.3s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(33,34,34,0.10)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.8rem', borderBottom: '1px solid rgba(33,34,34,0.07)', background: '#f7f5f1', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, overflow: 'hidden', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={firstLine.photo} alt={firstLine.type_chambre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b' }}>
              {resa.reference}
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#212222' }}>
              {resa.lignes.length > 1 ? `${resa.lignes.length} hébergements` : firstLine.type_chambre}
            </div>
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', border: `1px solid ${s.border}`, background: s.bg, color: s.color, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {s.icon} {s.label}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '1.4rem 1.8rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CalendarDays size={10} /> Arrivée
            </div>
            <div style={{ fontSize: '0.9rem', color: '#212222' }}>{formatDate(firstLine.check_in)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CalendarDays size={10} /> Départ
            </div>
            <div style={{ fontSize: '0.9rem', color: '#212222' }}>{formatDate(firstLine.check_out)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={10} /> Durée
            </div>
            <div style={{ fontSize: '0.9rem', color: '#212222' }}>{nights} nuit{nights > 1 ? 's' : ''}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.35rem' }}>
              Total
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#212222' }}>
              {resa.prix_total.toLocaleString('fr-FR')} FCFA
            </div>
          </div>
        </div>

        {resa.demandes_speciales && (
          <div style={{ marginBottom: '1rem', padding: '0.7rem 1rem', background: '#f7f5f1', borderLeft: '2px solid rgba(197,152,91,0.4)', fontSize: '0.82rem', color: '#6b6c6c', lineHeight: 1.6 }}>
            {resa.demandes_speciales}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.7rem', paddingTop: '1rem', borderTop: '1px solid rgba(33,34,34,0.07)' }}>
          <Link href={`/reservations/${resa.reference}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600, color: '#c5985b', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Voir le détail <ChevronRight size={13} />
          </Link>
          {resa.statut === 'CONFIRMEE' && (
            <button onClick={() => onCancel(resa.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c0392b', background: 'none', border: '1px solid rgba(224,85,85,0.3)', padding: '0.5rem 1rem', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(224,85,85,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <X size={12} /> Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MesReservationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [reservations, setReservations] = useState<MockReservation[]>(MOCK_RESERVATIONS)
  const [tab, setTab] = useState<TabKey>('TOUTES')
  const [cancelling, setCancelling] = useState<number | null>(null)

  if (!user) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#6b6c6c', marginBottom: '1.5rem' }}>Vous devez être connecté.</p>
            <Link href="/connexion" style={{ background: '#c5985b', color: '#fff', padding: '0.85rem 2rem', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Se connecter
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  async function handleCancel(id: number) {
    if (!window.confirm("Confirmer l'annulation de cette réservation ?")) return
    setCancelling(id)
    await _apiCancelReservation(id, user!.token)
    setReservations(prev => prev.map(r => r.id === id ? { ...r, statut: 'ANNULEE' as const } : r))
    setCancelling(null)
  }

  const filtered = tab === 'TOUTES' ? reservations : reservations.filter(r => r.statut === tab)

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#f7f5f1', paddingTop: '7rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.8rem' }}>
                <span style={{ width: 28, height: 1, background: '#c5985b', display: 'inline-block' }} />
                Espace client
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 400, color: '#212222', lineHeight: 1.15 }}>
                Mes <em style={{ fontStyle: 'italic', color: '#c5985b' }}>réservations</em>
              </h1>
            </div>
            <Link href="/reservation"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '0.75rem 1.6rem', background: '#c5985b', color: '#fff', textDecoration: 'none', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              <Plus size={13} /> Nouvelle réservation
            </Link>
          </div>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', fontSize: '0.78rem', color: '#bbbcc1' }}>
            <Link href="/dashboard" style={{ color: '#bbbcc1', transition: 'color 0.2s', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c5985b')}
              onMouseLeave={e => (e.currentTarget.style.color = '#bbbcc1')}>
              Mon espace
            </Link>
            <ChevronRight size={13} />
            <span style={{ color: '#212222' }}>Mes réservations</span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(33,34,34,0.09)', marginBottom: '2rem' }}>
            {TABS.map(t => {
              const count = t.key === 'TOUTES' ? reservations.length : reservations.filter(r => r.statut === t.key).length
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{
                    padding: '0.75rem 1.2rem', background: 'none', border: 'none',
                    borderBottom: tab === t.key ? '2px solid #c5985b' : '2px solid transparent',
                    fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: 'pointer', color: tab === t.key ? '#c5985b' : '#6b6c6c',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                  {t.label}
                  {count > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: tab === t.key ? '#c5985b' : 'rgba(33,34,34,0.1)', color: tab === t.key ? '#fff' : '#6b6c6c', fontSize: '0.58rem', fontWeight: 700 }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff', border: '1px solid rgba(33,34,34,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CalendarDays size={24} color="#c5985b" />
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#212222', marginBottom: '0.5rem' }}>
                Aucune réservation
              </div>
              <p style={{ fontSize: '0.9rem', color: '#6b6c6c', lineHeight: 1.7, maxWidth: 340, margin: '0 auto 2rem' }}>
                Aucune réservation dans cette catégorie.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {filtered.map(r => (
                <div key={r.id} style={{ opacity: cancelling === r.id ? 0.6 : 1, transition: 'opacity 0.3s' }}>
                  <ReservationCard resa={r} onCancel={handleCancel} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
