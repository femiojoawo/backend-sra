'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Bell, BedDouble, Users, LogOut, CheckCircle2,
  Clock, ChevronDown, CalendarDays, Coffee, Package,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { MOCK_ARRIVEES, MOCK_DEPARTS, MOCK_CHAMBRES, type MockArrivee } from '@/lib/mock-data'
import Navbar from '@/components/layout/Navbar'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const ROOMS_AVAILABLE = MOCK_CHAMBRES.filter(c => c.statut_menage === 'PROPRE' && c.est_active && !c.occupee)

function ArriveeRow({ a }: { a: MockArrivee }) {
  const [statut, setStatut] = useState(a.statut_checkin)
  const [chambre, setChambre] = useState(a.chambre_attribuee || '')

  return (
    <tr style={{ borderBottom: '1px solid rgba(33,34,34,0.07)' }}>
      <td style={{ padding: '1rem', fontSize: '0.82rem', fontWeight: 600, color: '#c5985b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
        {a.reference}
      </td>
      <td style={{ padding: '1rem', fontSize: '0.86rem', color: '#212222' }}>{a.client_nom}</td>
      <td style={{ padding: '1rem', fontSize: '0.82rem', color: '#6b6c6c' }}>{a.type_chambre}</td>
      <td style={{ padding: '1rem', fontSize: '0.82rem', color: '#6b6c6c' }}>
        {formatDate(a.check_in)} → {formatDate(a.check_out)}
      </td>
      <td style={{ padding: '1rem', fontSize: '0.82rem', color: '#6b6c6c' }}>
        {a.adultes} adulte{a.adultes > 1 ? 's' : ''}{a.enfants ? ` + ${a.enfants} enf.` : ''}
      </td>
      <td style={{ padding: '1rem' }}>
        <select value={chambre} onChange={e => setChambre(e.target.value)}
          style={{ border: '1px solid rgba(33,34,34,0.15)', padding: '0.4rem 0.6rem', fontSize: '0.82rem', background: '#fff', color: chambre ? '#212222' : '#bbbcc1', cursor: 'pointer', outline: 'none' }}>
          <option value="">— Attribuer —</option>
          {ROOMS_AVAILABLE.map(r => (
            <option key={r.id} value={r.numero}>{r.numero} — {r.type}</option>
          ))}
          {chambre && !ROOMS_AVAILABLE.find(r => r.numero === chambre) && (
            <option value={chambre}>{chambre}</option>
          )}
        </select>
      </td>
      <td style={{ padding: '1rem' }}>
        {statut === 'EFFECTUE' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600, color: '#2e8b2e', background: 'rgba(74,180,74,0.1)', padding: '0.3rem 0.7rem' }}>
            <CheckCircle2 size={12} /> Check-in fait
          </span>
        ) : (
          <button onClick={() => { if (chambre) setStatut('EFFECTUE') }}
            disabled={!chambre}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.4rem 0.9rem', background: chambre ? '#c5985b' : 'rgba(33,34,34,0.08)',
              color: chambre ? '#fff' : '#bbbcc1', border: 'none',
              fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: chambre ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
            }}>
            <CheckCircle2 size={12} />
            Check-in
          </button>
        )}
      </td>
    </tr>
  )
}

function DepartRow({ a }: { a: MockArrivee }) {
  const [done, setDone] = useState(false)
  return (
    <tr style={{ borderBottom: '1px solid rgba(33,34,34,0.07)' }}>
      <td style={{ padding: '1rem', fontSize: '0.82rem', fontWeight: 600, color: '#c5985b', fontFamily: 'monospace' }}>{a.reference}</td>
      <td style={{ padding: '1rem', fontSize: '0.86rem', color: '#212222' }}>{a.client_nom}</td>
      <td style={{ padding: '1rem', fontSize: '0.82rem', color: '#6b6c6c' }}>{a.chambre_attribuee}</td>
      <td style={{ padding: '1rem', fontSize: '0.82rem', color: '#6b6c6c' }}>{formatDate(a.check_in)} → {formatDate(a.check_out)}</td>
      <td style={{ padding: '1rem' }}>
        {done ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600, color: '#6b6c6c', background: 'rgba(107,108,108,0.1)', padding: '0.3rem 0.7rem' }}>
            <Clock size={12} /> Check-out fait
          </span>
        ) : (
          <button onClick={() => setDone(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.9rem', background: '#212222', color: '#fff', border: 'none', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            <ArrowRight size={12} /> Check-out
          </button>
        )}
      </td>
    </tr>
  )
}

const sideLinks = [
  { href: '/dashboard/reception', label: 'Réception' },
  { href: '/dashboard/commandes', label: 'Commandes' },
  { href: '/dashboard/menage', label: 'Ménage' },
  { href: '/dashboard/admin', label: 'Administration' },
]

export default function ReceptionDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<'arrivees' | 'departs'>('arrivees')

  if (!user || (user.role !== 'RECEPTION' && user.role !== 'ADMIN')) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b6c6c', marginBottom: '1rem' }}>Accès non autorisé.</p>
          <Link href="/connexion" style={{ color: '#c5985b' }}>Se connecter</Link>
        </div>
      </div>
    )
  }

  const occupancy = Math.round((MOCK_CHAMBRES.filter(c => c.occupee).length / MOCK_CHAMBRES.filter(c => c.est_active).length) * 100)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f5f1' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#212222', flexShrink: 0, display: 'flex', flexDirection: 'column', paddingTop: '1.5rem' }}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://sra-hotel.com/media/logo-SweetRestAparthotel.png" alt="SRA" style={{ height: 36, marginBottom: '1.2rem' }} />
          <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.3rem' }}>
            Back-Office
          </div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>{user.prenom} {user.nom}</div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{user.role}</div>
        </div>
        <nav style={{ padding: '1rem 0', flex: 1 }}>
          {sideLinks.map(l => (
            <Link key={l.href} href={l.href}
              style={{
                display: 'block', padding: '0.75rem 1.5rem', fontSize: '0.8rem',
                color: l.href.includes('reception') ? '#c5985b' : 'rgba(255,255,255,0.55)',
                background: l.href.includes('reception') ? 'rgba(197,152,91,0.1)' : 'none',
                borderLeft: l.href.includes('reception') ? '2px solid #c5985b' : '2px solid transparent',
                textDecoration: 'none', transition: 'all 0.2s', letterSpacing: '0.05em',
              }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button onClick={() => { logout(); router.push('/') }}
          style={{ margin: '0 1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid rgba(255,255,255,0.15)', padding: '0.6rem 1rem', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', transition: 'all 0.2s' }}>
          <LogOut size={14} /> Déconnexion
        </button>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(33,34,34,0.09)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: '#212222', margin: 0 }}>
            Dashboard Réception
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#6b6c6c' }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6c6c', display: 'flex' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: '#c5985b' }} />
            </button>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Arrivées aujourd\'hui', value: MOCK_ARRIVEES.length, icon: <CalendarDays size={18} />, color: '#c5985b' },
              { label: 'Départs aujourd\'hui',  value: MOCK_DEPARTS.length,  icon: <ArrowRight size={18} />,    color: '#4ab44a' },
              { label: 'Taux d\'occupation',    value: `${occupancy}%`,       icon: <BedDouble size={18} />,    color: '#212222' },
              { label: 'Commandes en cours',   value: 3,                      icon: <Coffee size={18} />,       color: '#e09a3a' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#212222', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6b6c6c', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(33,34,34,0.09)' }}>
              {(['arrivees', 'departs'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    padding: '1rem 1.6rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: tab === t ? '#c5985b' : '#6b6c6c',
                    borderBottom: tab === t ? '2px solid #c5985b' : '2px solid transparent',
                    marginBottom: -1, transition: 'all 0.2s',
                  }}>
                  {t === 'arrivees' ? `Arrivées (${MOCK_ARRIVEES.length})` : `Départs (${MOCK_DEPARTS.length})`}
                </button>
              ))}
              <Link href="/dashboard/commandes"
                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '1rem 1.6rem', fontSize: '0.78rem', fontWeight: 600, color: '#c5985b', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <Package size={14} /> Commandes <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(33,34,34,0.03)' }}>
                    {tab === 'arrivees' ? (
                      <>
                        <th style={thStyle}>Référence</th>
                        <th style={thStyle}>Client</th>
                        <th style={thStyle}>Type</th>
                        <th style={thStyle}>Dates</th>
                        <th style={thStyle}>Voyageurs</th>
                        <th style={thStyle}>Chambre</th>
                        <th style={thStyle}>Action</th>
                      </>
                    ) : (
                      <>
                        <th style={thStyle}>Référence</th>
                        <th style={thStyle}>Client</th>
                        <th style={thStyle}>Chambre</th>
                        <th style={thStyle}>Dates</th>
                        <th style={thStyle}>Action</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tab === 'arrivees'
                    ? MOCK_ARRIVEES.map(a => <ArriveeRow key={a.id} a={a} />)
                    : MOCK_DEPARTS.map(a => <DepartRow key={a.id} a={a} />)
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Room overview */}
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 400, color: '#212222', marginBottom: '1rem' }}>
              État des chambres — Aperçu rapide
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '0.7rem' }}>
              {MOCK_CHAMBRES.slice(0, 12).map(c => {
                const bg = c.statut_menage === 'PROPRE' && !c.occupee ? 'rgba(74,180,74,0.1)'
                  : c.statut_menage === 'PROPRE' && c.occupee ? 'rgba(197,152,91,0.1)'
                  : c.statut_menage === 'SALE' ? 'rgba(224,85,85,0.08)'
                  : c.statut_menage === 'EN_COURS' ? 'rgba(234,179,8,0.1)'
                  : 'rgba(33,34,34,0.06)'
                const tc = c.statut_menage === 'PROPRE' && !c.occupee ? '#2e8b2e'
                  : c.statut_menage === 'PROPRE' && c.occupee ? '#c5985b'
                  : c.statut_menage === 'SALE' ? '#c0392b'
                  : c.statut_menage === 'EN_COURS' ? '#a16207'
                  : '#6b6c6c'
                return (
                  <div key={c.id} style={{ background: bg, border: `1px solid ${bg.replace('0.1', '0.3').replace('0.08', '0.25')}`, padding: '0.8rem', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: tc }}>{c.numero}</div>
                    <div style={{ fontSize: '0.65rem', color: tc, fontWeight: 600, letterSpacing: '0.08em', marginTop: 2 }}>
                      {c.occupee ? (c.client_actuel ?? 'Occupée') : c.statut_menage === 'PROPRE' ? 'Libre' : c.statut_menage === 'EN_COURS' ? 'En cours' : c.statut_menage === 'MAINTENANCE' ? 'Maintenance' : 'À nettoyer'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem', textAlign: 'left',
  fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
  color: '#6b6c6c', whiteSpace: 'nowrap',
}
