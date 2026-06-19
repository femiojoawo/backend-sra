'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, CheckCircle2, AlertTriangle, Wrench, Sparkles, Filter } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { MOCK_CHAMBRES, type MockChambre } from '@/lib/mock-data'

type Statut = 'PROPRE' | 'SALE' | 'EN_COURS' | 'MAINTENANCE'

const statusConfig: Record<Statut, { label: string; bg: string; color: string; border: string }> = {
  PROPRE:      { label: 'Propre',      bg: 'rgba(74,180,74,0.1)',   color: '#2e8b2e',  border: 'rgba(74,180,74,0.3)' },
  SALE:        { label: 'À nettoyer',  bg: 'rgba(224,85,85,0.08)',  color: '#c0392b',  border: 'rgba(224,85,85,0.25)' },
  EN_COURS:    { label: 'En cours',    bg: 'rgba(234,179,8,0.1)',   color: '#a16207',  border: 'rgba(234,179,8,0.3)' },
  MAINTENANCE: { label: 'Maintenance', bg: 'rgba(33,34,34,0.06)',   color: '#6b6c6c',  border: 'rgba(33,34,34,0.15)' },
}

const TRANSITIONS: Record<Statut, Statut[]> = {
  SALE:        ['EN_COURS'],
  EN_COURS:    ['PROPRE'],
  PROPRE:      ['MAINTENANCE'],
  MAINTENANCE: ['PROPRE'],
}

const sideLinks = [
  { href: '/dashboard/reception', label: 'Réception' },
  { href: '/dashboard/commandes', label: 'Commandes' },
  { href: '/dashboard/menage',    label: 'Ménage' },
  { href: '/dashboard/admin',     label: 'Administration' },
]

function ChambreCard({ chambre, onUpdate }: { chambre: MockChambre & { statut_menage: Statut }; onUpdate: (id: number, statut: Statut) => void }) {
  const s = statusConfig[chambre.statut_menage]
  const nexts = TRANSITIONS[chambre.statut_menage]

  const nextLabels: Record<Statut, string> = {
    EN_COURS:    'Démarrer le nettoyage',
    PROPRE:      'Marquer comme propre',
    MAINTENANCE: 'Passer en maintenance',
    SALE:        'Signaler sale',
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${s.border}`, padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {/* Top */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#212222' }}>
            Ch. {chambre.numero}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b6c6c', marginTop: 2 }}>Étage {chambre.etage}</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', fontSize: '0.68rem', fontWeight: 700, background: s.bg, color: s.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {s.label}
        </span>
      </div>
      <div style={{ fontSize: '0.8rem', color: '#6b6c6c' }}>{chambre.type}</div>
      {chambre.occupee && (
        <div style={{ fontSize: '0.75rem', color: '#c5985b', background: 'rgba(197,152,91,0.06)', padding: '0.3rem 0.6rem', border: '1px solid rgba(197,152,91,0.15)' }}>
          Occupée — {chambre.client_actuel}
        </div>
      )}
      {/* Action */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
        {nexts.map(next => (
          <button key={next} onClick={() => onUpdate(chambre.id, next)}
            style={{
              flex: 1, padding: '0.55rem', border: 'none', cursor: 'pointer',
              background: next === 'PROPRE' ? '#2e8b2e' : next === 'EN_COURS' ? '#c5985b' : '#6b6c6c',
              color: '#fff', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            {nextLabels[next]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MenageDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [chambres, setChambres] = useState<MockChambre[]>(MOCK_CHAMBRES)
  const [filterStatut, setFilterStatut] = useState<Statut | 'TOUTES'>('TOUTES')
  const [filterEtage, setFilterEtage] = useState<number | 'TOUS'>('TOUS')

  if (!user || (user.role !== 'MENAGE' && user.role !== 'ADMIN')) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b6c6c', marginBottom: '1rem' }}>Accès non autorisé.</p>
          <Link href="/connexion" style={{ color: '#c5985b' }}>Se connecter</Link>
        </div>
      </div>
    )
  }

  function handleUpdate(id: number, statut: Statut) {
    setChambres(prev => prev.map(c => c.id === id ? { ...c, statut_menage: statut } : c))
  }

  const etages = [...new Set(chambres.map(c => c.etage))].sort()
  const filtered = chambres.filter(c =>
    (filterStatut === 'TOUTES' || c.statut_menage === filterStatut) &&
    (filterEtage === 'TOUS' || c.etage === filterEtage),
  )

  const counts = {
    PROPRE:      chambres.filter(c => c.statut_menage === 'PROPRE').length,
    SALE:        chambres.filter(c => c.statut_menage === 'SALE').length,
    EN_COURS:    chambres.filter(c => c.statut_menage === 'EN_COURS').length,
    MAINTENANCE: chambres.filter(c => c.statut_menage === 'MAINTENANCE').length,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f5f1' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#212222', flexShrink: 0, display: 'flex', flexDirection: 'column', paddingTop: '1.5rem' }}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://sra-hotel.com/media/logo-SweetRestAparthotel.png" alt="SRA" style={{ height: 36, marginBottom: '1.2rem' }} />
          <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.3rem' }}>Back-Office</div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>{user.prenom} {user.nom}</div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{user.role}</div>
        </div>
        <nav style={{ padding: '1rem 0', flex: 1 }}>
          {sideLinks.map(l => (
            <Link key={l.href} href={l.href}
              style={{
                display: 'block', padding: '0.75rem 1.5rem', fontSize: '0.8rem',
                color: l.href.includes('menage') ? '#c5985b' : 'rgba(255,255,255,0.55)',
                background: l.href.includes('menage') ? 'rgba(197,152,91,0.1)' : 'none',
                borderLeft: l.href.includes('menage') ? '2px solid #c5985b' : '2px solid transparent',
                textDecoration: 'none', transition: 'all 0.2s',
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
        {/* Top */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(33,34,34,0.09)', padding: '1rem 2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: '#212222', margin: 0 }}>
            Dashboard Ménage
          </h1>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {(Object.entries(counts) as [Statut, number][]).map(([k, v]) => {
              const s = statusConfig[k]
              return (
                <div key={k} style={{ background: s.bg, border: `1px solid ${s.border}`, padding: '1.2rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: s.color }}>{v}</span>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                    <div style={{ fontSize: '0.68rem', color: s.color, opacity: 0.7 }}>chambre{v > 1 ? 's' : ''}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={14} style={{ color: '#6b6c6c' }} />
            <span style={{ fontSize: '0.75rem', color: '#6b6c6c', letterSpacing: '0.05em' }}>Filtrer :</span>
            {(['TOUTES', 'PROPRE', 'SALE', 'EN_COURS', 'MAINTENANCE'] as (Statut | 'TOUTES')[]).map(f => (
              <button key={f} onClick={() => setFilterStatut(f)}
                style={{
                  padding: '0.35rem 0.8rem', fontSize: '0.72rem', fontWeight: 600,
                  border: `1px solid ${filterStatut === f ? '#c5985b' : 'rgba(33,34,34,0.15)'}`,
                  background: filterStatut === f ? '#c5985b' : '#fff',
                  color: filterStatut === f ? '#fff' : '#6b6c6c',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {f === 'TOUTES' ? 'Toutes' : statusConfig[f as Statut].label}
              </button>
            ))}
            <div style={{ display: 'flex', gap: '0.4rem', marginLeft: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b6c6c' }}>Étage :</span>
              <select value={filterEtage} onChange={e => setFilterEtage(e.target.value === 'TOUS' ? 'TOUS' : parseInt(e.target.value))}
                style={{ border: '1px solid rgba(33,34,34,0.15)', padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                <option value="TOUS">Tous</option>
                {etages.map(e => <option key={e} value={e}>Étage {e}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '1rem' }}>
            {filtered.map(c => (
              <ChambreCard key={c.id} chambre={c as MockChambre & { statut_menage: Statut }} onUpdate={handleUpdate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
