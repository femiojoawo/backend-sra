'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronRight, Clock, Utensils, Sparkles, Car, Package } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { MOCK_COMMANDES, type MockCommande } from '@/lib/mock-data'

type Statut = 'RECUE' | 'EN_PREPARATION' | 'EN_LIVRAISON' | 'VALIDEE'

const statusConfig: Record<Statut, { label: string; bg: string; color: string; next?: Statut; nextLabel?: string }> = {
  RECUE:          { label: 'Reçue',          bg: 'rgba(197,152,91,0.1)', color: '#c5985b',  next: 'EN_PREPARATION', nextLabel: 'Préparer' },
  EN_PREPARATION: { label: 'En préparation', bg: 'rgba(234,179,8,0.1)',  color: '#a16207',  next: 'EN_LIVRAISON',   nextLabel: 'Livrer' },
  EN_LIVRAISON:   { label: 'En livraison',   bg: 'rgba(74,130,218,0.1)', color: '#1d4ed8',  next: 'VALIDEE',        nextLabel: 'Valider' },
  VALIDEE:        { label: 'Validée',        bg: 'rgba(74,180,74,0.1)',  color: '#2e8b2e' },
}

const categoryIcons: Record<string, React.ReactNode> = {
  RESTAURATION: <Utensils size={14} />,
  SPA:          <Sparkles size={14} />,
  VEHICULE:     <Car size={14} />,
  AUTRE:        <Package size={14} />,
}

const sideLinks = [
  { href: '/dashboard/reception', label: 'Réception' },
  { href: '/dashboard/commandes', label: 'Commandes' },
  { href: '/dashboard/menage',    label: 'Ménage' },
  { href: '/dashboard/admin',     label: 'Administration' },
]

function formatTime(s: string) {
  return new Date(s).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

function CommandeCard({ cmd, onUpdate }: { cmd: MockCommande; onUpdate: (id: number, s: Statut) => void }) {
  const s = statusConfig[cmd.statut]

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', position: 'relative', overflow: 'hidden' }}>
      {/* Status bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: s.color }} />
      <div style={{ paddingLeft: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#212222', marginBottom: 2 }}>
              Chambre {cmd.chambre_numero}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6b6c6c', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={11} />
              {formatTime(cmd.date_commande)}
            </div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: s.bg, color: s.color }}>
            {s.label}
          </span>
        </div>
        <div style={{ borderTop: '1px solid rgba(33,34,34,0.07)', paddingTop: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ color: '#c5985b' }}>{categoryIcons[cmd.service_categorie]}</span>
            <span style={{ fontSize: '0.86rem', fontWeight: 500, color: '#212222' }}>{cmd.service_nom}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b6c6c' }}>
            <span>Qté : {cmd.quantite}</span>
            <span style={{ color: '#212222', fontWeight: 600 }}>{formatPrice(cmd.prix_total_ligne)}</span>
          </div>
          {cmd.note && (
            <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(197,152,91,0.06)', border: '1px solid rgba(197,152,91,0.15)', fontSize: '0.76rem', color: '#6b6c6c', fontStyle: 'italic' }}>
              {cmd.note}
            </div>
          )}
        </div>
        {s.next && (
          <button onClick={() => onUpdate(cmd.id, s.next!)}
            style={{
              width: '100%', padding: '0.6rem', background: s.color, color: '#fff', border: 'none',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.4rem', transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            {s.nextLabel} <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function CommandesDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [commandes, setCommandes] = useState<MockCommande[]>(MOCK_COMMANDES)
  const [filter, setFilter] = useState<Statut | 'TOUTES'>('TOUTES')

  if (!user || user.role === 'CLIENT') {
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
    setCommandes(prev => prev.map(c => c.id === id ? { ...c, statut } : c))
  }

  const filtered = filter === 'TOUTES' ? commandes : commandes.filter(c => c.statut === filter)
  const pendingCount = commandes.filter(c => c.statut !== 'VALIDEE').length

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
                color: l.href.includes('commandes') ? '#c5985b' : 'rgba(255,255,255,0.55)',
                background: l.href.includes('commandes') ? 'rgba(197,152,91,0.1)' : 'none',
                borderLeft: l.href.includes('commandes') ? '2px solid #c5985b' : '2px solid transparent',
                textDecoration: 'none', transition: 'all 0.2s',
              }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button onClick={() => { logout(); router.push('/') }}
          style={{ margin: '0 1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid rgba(255,255,255,0.15)', padding: '0.6rem 1rem', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
          <LogOut size={14} /> Déconnexion
        </button>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(33,34,34,0.09)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: '#212222', margin: 0 }}>
            Gestion des Commandes
          </h1>
          {pendingCount > 0 && (
            <span style={{ background: '#c5985b', color: '#fff', padding: '0.3rem 0.8rem', fontSize: '0.75rem', fontWeight: 700 }}>
              {pendingCount} en cours
            </span>
          )}
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {(['TOUTES', 'RECUE', 'EN_PREPARATION', 'EN_LIVRAISON', 'VALIDEE'] as (Statut | 'TOUTES')[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '0.4rem 0.9rem', fontSize: '0.72rem', fontWeight: 600,
                  border: `1px solid ${filter === f ? '#c5985b' : 'rgba(33,34,34,0.15)'}`,
                  background: filter === f ? '#c5985b' : '#fff',
                  color: filter === f ? '#fff' : '#6b6c6c',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {f === 'TOUTES' ? 'Toutes' : statusConfig[f as Statut].label}
                {f !== 'TOUTES' && (
                  <span style={{ marginLeft: '0.4rem', opacity: 0.7 }}>
                    ({commandes.filter(c => c.statut === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Cards grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#bbbcc1' }}>Aucune commande dans cette catégorie.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '1rem' }}>
              {filtered.sort((a, b) => new Date(a.date_commande).getTime() - new Date(b.date_commande).getTime()).map(cmd => (
                <CommandeCard key={cmd.id} cmd={cmd} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
