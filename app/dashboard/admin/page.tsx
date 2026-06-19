'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LogOut, LayoutDashboard, BedDouble, Settings, Users, BarChart3,
  Plus, Edit, Trash2, ToggleLeft, ToggleRight, TrendingUp, TrendingDown,
  Package, Wrench, ChevronRight, CheckCircle2, X,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { MOCK_SERVICES, MOCK_CHAMBRES, type MockService, type MockChambre } from '@/lib/mock-data'

// ── Mock API skeletons ────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _apiGetReports(): Promise<{ ca: number[]; taux: number[]; labels: string[] }> {
  // GET /api/reports/occupancy — GET /api/reports/revenue
  return { ca: [4200000, 5100000, 3800000, 6500000, 7200000, 6800000], taux: [62, 71, 54, 82, 89, 78], labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'] }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _apiCreateService(_payload: Omit<MockService, 'id'>): Promise<MockService> {
  // POST /api/services
  return {} as MockService
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _apiUpdateService(_id: number, _payload: Partial<MockService>): Promise<MockService> {
  // PUT /api/services/{id}
  return {} as MockService
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _apiDeleteService(_id: number): Promise<void> {
  // DELETE /api/services/{id}
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _apiUpdateChambre(_id: number, _payload: Partial<MockChambre>): Promise<MockChambre> {
  // PUT /api/rooms/{id}
  return {} as MockChambre
}

// ── Mock users ────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, nom: 'Koné', prenom: 'Mamadou', email: 'admin@sra-hotel.com', role: 'ADMIN', actif: true, date_inscription: '2025-01-10' },
  { id: 2, nom: 'Diabaté', prenom: 'Fatou', email: 'reception@sra-hotel.com', role: 'RECEPTION', actif: true, date_inscription: '2025-02-14' },
  { id: 3, nom: 'Coulibaly', prenom: 'Aminata', email: 'menage@sra-hotel.com', role: 'MENAGE', actif: true, date_inscription: '2025-03-05' },
  { id: 4, nom: 'Traoré', prenom: 'Ibrahima', email: 'client@sra-hotel.com', role: 'CLIENT', actif: true, date_inscription: '2025-06-01' },
  { id: 5, nom: 'Bamba', prenom: 'Aïssa', email: 'aissa.bamba@email.com', role: 'CLIENT', actif: false, date_inscription: '2025-05-20' },
  { id: 6, nom: 'Ouattara', prenom: 'Seydou', email: 'seydou.o@email.com', role: 'CLIENT', actif: true, date_inscription: '2026-01-11' },
]

// ── Mock KPIs ─────────────────────────────────────────────────────────────────
const KPI = [
  { label: 'CA mensuel',      value: '6 800 000 FCFA', delta: '+8%',  up: true },
  { label: "Taux d'occupation", value: '78 %',          delta: '+5pp', up: true },
  { label: 'RevPAR',           value: '74 100 FCFA',   delta: '+3%',  up: true },
  { label: 'Panier moyen',     value: '234 000 FCFA',  delta: '-2%',  up: false },
]

// ── Simple bar chart using SVG ────────────────────────────────────────────────
function MiniBarChart({ values, labels, color }: { values: number[]; labels: string[]; color: string }) {
  const max = Math.max(...values)
  const W = 360, H = 100, pad = 12
  const barW = (W - pad * (values.length + 1)) / values.length

  return (
    <svg width={W} height={H + 20} style={{ overflow: 'visible' }}>
      {values.map((v, i) => {
        const h = (v / max) * H
        const x = pad + i * (barW + pad)
        const y = H - h
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} fill={color} opacity={0.85} rx={2} />
            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize={9} fill="#6b6c6c">{labels[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Sidebar link list ─────────────────────────────────────────────────────────
const sideLinks = [
  { href: '/dashboard/reception', label: 'Réception',      icon: <LayoutDashboard size={14} /> },
  { href: '/dashboard/commandes', label: 'Commandes',      icon: <Package size={14} /> },
  { href: '/dashboard/menage',    label: 'Ménage',         icon: <Wrench size={14} /> },
  { href: '/dashboard/admin',     label: 'Administration', icon: <Settings size={14} /> },
]

type Section = 'rapports' | 'services' | 'chambres' | 'utilisateurs'

// ── Service form modal ────────────────────────────────────────────────────────
function ServiceModal({
  service,
  onClose,
  onSave,
}: {
  service: Partial<MockService> | null
  onClose: () => void
  onSave: (s: MockService) => void
}) {
  const [nom, setNom] = useState(service?.nom ?? '')
  const [categorie, setCategorie] = useState<MockService['categorie']>(service?.categorie ?? 'RESTAURATION')
  const [description, setDescription] = useState(service?.description ?? '')
  const [prix, setPrix] = useState<string>(service?.prix_unitaire?.toString() ?? '')
  const [dispo, setDispo] = useState(service?.est_disponible ?? true)

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid rgba(33,34,34,0.15)', padding: '0.7rem 0.9rem',
    fontSize: '0.84rem', fontFamily: 'var(--font-sans)', color: '#212222', outline: 'none',
    background: '#fff', boxSizing: 'border-box',
  }

  function handleSave() {
    onSave({
      id: service?.id ?? Date.now(),
      nom, categorie, description,
      prix_unitaire: parseFloat(prix) || 0,
      est_disponible: dispo,
      photo: service?.photo ?? 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80',
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 480, padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#bbbcc1' }}>
          <X size={18} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: '#212222', marginBottom: '1.5rem' }}>
          {service?.id ? 'Modifier le service' : 'Nouveau service'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6c6c', display: 'block', marginBottom: '0.4rem' }}>Nom</label>
            <input style={inputStyle} value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom du service" />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6c6c', display: 'block', marginBottom: '0.4rem' }}>Catégorie</label>
            <select style={inputStyle} value={categorie} onChange={e => setCategorie(e.target.value as MockService['categorie'])}>
              <option value="RESTAURATION">Restauration</option>
              <option value="SPA">Spa</option>
              <option value="VEHICULE">Transport</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6c6c', display: 'block', marginBottom: '0.4rem' }}>Description</label>
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Description du service" />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6c6c', display: 'block', marginBottom: '0.4rem' }}>Prix unitaire (FCFA)</label>
            <input style={inputStyle} type="number" value={prix} onChange={e => setPrix(e.target.value)} placeholder="Ex: 15000" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <button type="button" onClick={() => setDispo(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: dispo ? '#2e8b2e' : '#bbbcc1', display: 'flex', padding: 0 }}>
              {dispo ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
            <span style={{ fontSize: '0.84rem', color: '#6b6c6c' }}>
              {dispo ? 'Disponible' : 'Indisponible'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', paddingTop: '0.5rem' }}>
            <button onClick={handleSave}
              style={{ flex: 1, padding: '0.85rem', background: '#c5985b', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              Enregistrer
            </button>
            <button onClick={onClose}
              style={{ padding: '0.85rem 1.2rem', background: '#fff', color: '#6b6c6c', border: '1px solid rgba(33,34,34,0.15)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatPrice(n: number) { return n.toLocaleString('fr-FR') + ' FCFA' }
function formatDate(s: string) { return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }

const roleColors: Record<string, { bg: string; color: string }> = {
  ADMIN:     { bg: 'rgba(197,152,91,0.1)',  color: '#c5985b' },
  RECEPTION: { bg: 'rgba(29,78,216,0.08)',  color: '#1d4ed8' },
  MENAGE:    { bg: 'rgba(234,179,8,0.1)',   color: '#a16207' },
  CLIENT:    { bg: 'rgba(74,180,74,0.08)',  color: '#2e8b2e' },
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const [section, setSection] = useState<Section>('rapports')
  const [services, setServices] = useState<MockService[]>(MOCK_SERVICES)
  const [chambres, setChambres] = useState<MockChambre[]>(MOCK_CHAMBRES)
  const [modalService, setModalService] = useState<Partial<MockService> | null | false>(false)
  const [users, setUsers] = useState(MOCK_USERS)

  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b6c6c', marginBottom: '1rem' }}>Accès réservé aux administrateurs.</p>
          <Link href="/connexion" style={{ color: '#c5985b' }}>Se connecter</Link>
        </div>
      </div>
    )
  }

  function handleSaveService(s: MockService) {
    setServices(prev => {
      const exists = prev.find(x => x.id === s.id)
      if (exists) return prev.map(x => x.id === s.id ? s : x)
      return [...prev, s]
    })
    setModalService(false)
  }
  function handleDeleteService(id: number) {
    setServices(prev => prev.filter(s => s.id !== id))
  }
  function handleToggleChambre(id: number) {
    setChambres(prev => prev.map(c => c.id === id ? { ...c, est_active: !c.est_active } : c))
  }
  function handleToggleUser(id: number) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, actif: !u.actif } : u))
  }

  const sectionNav: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: 'rapports',     label: 'Rapports',      icon: <BarChart3 size={15} /> },
    { key: 'services',     label: 'Services',      icon: <Package size={15} /> },
    { key: 'chambres',     label: 'Chambres',      icon: <BedDouble size={15} /> },
    { key: 'utilisateurs', label: 'Utilisateurs',  icon: <Users size={15} /> },
  ]

  return (
    <>
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
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.5rem', fontSize: '0.8rem',
                  color: l.href.includes('admin') ? '#c5985b' : 'rgba(255,255,255,0.55)',
                  background: l.href.includes('admin') ? 'rgba(197,152,91,0.1)' : 'none',
                  borderLeft: l.href.includes('admin') ? '2px solid #c5985b' : '2px solid transparent',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}>
                {l.icon} {l.label}
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
          {/* Top bar */}
          <div style={{ background: '#fff', borderBottom: '1px solid rgba(33,34,34,0.09)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: '#212222', margin: 0 }}>
              Administration
            </h1>
            <span style={{ fontSize: '0.72rem', color: '#6b6c6c' }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Section nav */}
          <div style={{ background: '#fff', borderBottom: '1px solid rgba(33,34,34,0.09)', padding: '0 2rem', display: 'flex', gap: 0 }}>
            {sectionNav.map(s => (
              <button key={s.key} onClick={() => setSection(s.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.85rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: section === s.key ? '#c5985b' : '#6b6c6c',
                  borderBottom: section === s.key ? '2px solid #c5985b' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.2s',
                }}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '2rem' }}>

            {/* ── RAPPORTS ── */}
            {section === 'rapports' && (
              <div>
                {/* KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {KPI.map(k => (
                    <div key={k.label} style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.4rem' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b6c6c', marginBottom: '0.5rem' }}>
                        {k.label}
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#212222', marginBottom: '0.3rem' }}>
                        {k.value}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: k.up ? '#2e8b2e' : '#c0392b', fontWeight: 600 }}>
                        {k.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {k.delta} vs mois dernier
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1.2rem' }}>
                      Chiffre d&apos;affaires — 6 derniers mois
                    </h3>
                    <MiniBarChart
                      values={[4200000, 5100000, 3800000, 6500000, 7200000, 6800000]}
                      labels={['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun']}
                      color="#c5985b"
                    />
                  </div>
                  <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1d4ed8', marginBottom: '1.2rem' }}>
                      Taux d&apos;occupation (%)
                    </h3>
                    <MiniBarChart
                      values={[62, 71, 54, 82, 89, 78]}
                      labels={['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun']}
                      color="#1d4ed8"
                    />
                  </div>
                </div>

                {/* Summary stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginTop: '1.5rem' }}>
                  {[
                    { label: 'Réservations totales', value: '47', note: 'Ce mois' },
                    { label: 'Chambres actives',     value: `${chambres.filter(c => c.est_active).length}/${chambres.length}`, note: 'Inventaire' },
                    { label: 'Services en ligne',    value: `${services.filter(s => s.est_disponible).length}/${services.length}`, note: 'Catalogue' },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#212222' }}>{s.value}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b6c6c', marginTop: 2 }}>{s.label}</div>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#bbbcc1', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SERVICES ── */}
            {section === 'services' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 400, color: '#212222', margin: 0 }}>
                    Catalogue des services
                  </h2>
                  <button onClick={() => setModalService({})}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.2rem', background: '#c5985b', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    <Plus size={14} /> Nouveau service
                  </button>
                </div>

                <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(33,34,34,0.03)' }}>
                        {['Service', 'Catégorie', 'Prix', 'Statut', 'Actions'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid rgba(33,34,34,0.07)' }}>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                              <div style={{ width: 40, height: 40, overflow: 'hidden', flexShrink: 0 }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={s.photo} alt={s.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <span style={{ fontSize: '0.86rem', fontWeight: 500, color: '#212222' }}>{s.nom}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: '#6b6c6c' }}>{s.categorie}</td>
                          <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: '#212222' }}>
                            {formatPrice(s.prix_unitaire)}
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                              padding: '0.25rem 0.6rem', fontSize: '0.68rem', fontWeight: 700,
                              background: s.est_disponible ? 'rgba(74,180,74,0.1)' : 'rgba(224,85,85,0.08)',
                              color: s.est_disponible ? '#2e8b2e' : '#c0392b',
                            }}>
                              {s.est_disponible ? <CheckCircle2 size={11} /> : <X size={11} />}
                              {s.est_disponible ? 'Disponible' : 'Indisponible'}
                            </span>
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => setModalService(s)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.7rem', background: 'none', border: '1px solid rgba(33,34,34,0.15)', cursor: 'pointer', fontSize: '0.7rem', color: '#6b6c6c', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c5985b'; e.currentTarget.style.color = '#c5985b' }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(33,34,34,0.15)'; e.currentTarget.style.color = '#6b6c6c' }}>
                                <Edit size={11} /> Modifier
                              </button>
                              <button onClick={() => handleDeleteService(s.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.7rem', background: 'none', border: '1px solid rgba(224,85,85,0.25)', cursor: 'pointer', fontSize: '0.7rem', color: '#c0392b', transition: 'all 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(224,85,85,0.05)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                <Trash2 size={11} /> Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── CHAMBRES ── */}
            {section === 'chambres' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 400, color: '#212222', margin: 0 }}>
                    Inventaire des chambres
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: '#6b6c6c' }}>
                    {chambres.filter(c => c.est_active).length} actives / {chambres.length} total
                  </div>
                </div>
                <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(33,34,34,0.03)' }}>
                        {['N°', 'Type', 'Étage', 'Ménage', 'Occupée', 'Active', 'Action'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {chambres.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(33,34,34,0.07)', opacity: c.est_active ? 1 : 0.55 }}>
                          <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#c5985b' }}>{c.numero}</td>
                          <td style={{ padding: '0.8rem 1rem', fontSize: '0.82rem', color: '#212222' }}>{c.type}</td>
                          <td style={{ padding: '0.8rem 1rem', fontSize: '0.82rem', color: '#6b6c6c' }}>{c.etage}</td>
                          <td style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: c.statut_menage === 'PROPRE' ? '#2e8b2e' : c.statut_menage === 'SALE' ? '#c0392b' : '#a16207' }}>
                            {c.statut_menage}
                          </td>
                          <td style={{ padding: '0.8rem 1rem', fontSize: '0.8rem', color: c.occupee ? '#c5985b' : '#6b6c6c' }}>
                            {c.occupee ? 'Oui' : 'Non'}
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: c.est_active ? '#2e8b2e' : '#c0392b' }}>
                              {c.est_active ? 'Oui' : 'Non'}
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <button onClick={() => handleToggleChambre(c.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.7rem', background: 'none', border: '1px solid rgba(33,34,34,0.15)', cursor: 'pointer', fontSize: '0.7rem', color: '#6b6c6c', transition: 'all 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c5985b'; e.currentTarget.style.color = '#c5985b' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(33,34,34,0.15)'; e.currentTarget.style.color = '#6b6c6c' }}>
                              {c.est_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                              {c.est_active ? 'Désactiver' : 'Activer'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── UTILISATEURS ── */}
            {section === 'utilisateurs' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 400, color: '#212222', margin: 0 }}>
                    Gestion des utilisateurs
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: '#6b6c6c' }}>
                    {users.filter(u => u.actif).length} actifs / {users.length} total
                  </div>
                </div>
                <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(33,34,34,0.03)' }}>
                        {['Utilisateur', 'Email', 'Rôle', 'Inscription', 'Statut', 'Action'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => {
                        const rc = roleColors[u.role]
                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid rgba(33,34,34,0.07)', opacity: u.actif ? 1 : 0.55 }}>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: rc.color }}>
                                    {u.prenom[0]}{u.nom[0]}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.86rem', color: '#212222', fontWeight: 500 }}>
                                  {u.prenom} {u.nom}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#6b6c6c' }}>{u.email}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{ padding: '0.25rem 0.6rem', fontSize: '0.68rem', fontWeight: 700, background: rc.bg, color: rc.color }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#6b6c6c' }}>{formatDate(u.date_inscription)}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: u.actif ? '#2e8b2e' : '#c0392b' }}>
                                {u.actif ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <button onClick={() => handleToggleUser(u.id)}
                                disabled={u.id === user.clientId}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                                  padding: '0.35rem 0.7rem', background: 'none',
                                  border: '1px solid rgba(33,34,34,0.15)', cursor: u.id === user.clientId ? 'not-allowed' : 'pointer',
                                  fontSize: '0.7rem', color: '#6b6c6c', transition: 'all 0.2s',
                                  opacity: u.id === user.clientId ? 0.4 : 1,
                                }}
                                onMouseEnter={e => { if (u.id !== user.clientId) { e.currentTarget.style.borderColor = '#c5985b'; e.currentTarget.style.color = '#c5985b' } }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(33,34,34,0.15)'; e.currentTarget.style.color = '#6b6c6c' }}>
                                {u.actif ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                                {u.actif ? 'Désactiver' : 'Activer'}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Credentials reminder */}
                <div style={{ marginTop: '1.5rem', background: 'rgba(197,152,91,0.05)', border: '1px solid rgba(197,152,91,0.2)', padding: '1.2rem' }}>
                  <h4 style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.8rem', marginTop: 0 }}>
                    Identifiants de démonstration
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '0.5rem' }}>
                    {[
                      { role: 'Admin',     email: 'admin@sra-hotel.com',     password: 'Admin2024!',     redirect: '/dashboard/admin' },
                      { role: 'Réception', email: 'reception@sra-hotel.com', password: 'Reception2024!', redirect: '/dashboard/reception' },
                      { role: 'Ménage',    email: 'menage@sra-hotel.com',    password: 'Menage2024!',    redirect: '/dashboard/menage' },
                      { role: 'Client',    email: 'client@sra-hotel.com',    password: 'Client2024!',    redirect: '/dashboard' },
                    ].map(c => (
                      <div key={c.role} style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.08)', padding: '0.7rem 0.9rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c5985b', minWidth: 65 }}>{c.role}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.72rem', color: '#212222', fontFamily: 'monospace' }}>{c.email}</div>
                          <div style={{ fontSize: '0.72rem', color: '#6b6c6c', fontFamily: 'monospace' }}>{c.password}</div>
                          <Link href={`/connexion?redirect=${c.redirect}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.25rem', fontSize: '0.65rem', color: '#c5985b', textDecoration: 'none' }}>
                            Connexion <ChevronRight size={10} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service modal */}
      {modalService !== false && (
        <ServiceModal
          service={modalService}
          onClose={() => setModalService(false)}
          onSave={handleSaveService}
        />
      )}
    </>
  )
}

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem', textAlign: 'left',
  fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
  color: '#6b6c6c', whiteSpace: 'nowrap',
}
