'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Utensils, Sparkles, Car, Package, Plus, Minus, ShoppingBag,
  CheckCircle2, Clock, X, ChevronRight, ArrowLeft,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { MOCK_SERVICES, type MockService } from '@/lib/mock-data'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

type Categorie = 'TOUT' | 'RESTAURATION' | 'SPA' | 'VEHICULE' | 'AUTRE'

interface CartItem {
  service: MockService
  quantite: number
}

const categoryConfig: Record<Categorie, { label: string; icon: React.ReactNode }> = {
  TOUT:         { label: 'Tout',          icon: <Package size={14} /> },
  RESTAURATION: { label: 'Restauration',  icon: <Utensils size={14} /> },
  SPA:          { label: 'Spa & Bien-être', icon: <Sparkles size={14} /> },
  VEHICULE:     { label: 'Transport',     icon: <Car size={14} /> },
  AUTRE:        { label: 'Autres',        icon: <Package size={14} /> },
}

function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

// ── Mock API skeletons ────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _apiGetServices(_categorie?: string): Promise<MockService[]> {
  // GET /api/services?categorie={categorie}
  return MOCK_SERVICES
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _apiPostCommande(_payload: {
  reservation_ligne_id: number
  items: { service_id: number; quantite: number }[]
  note?: string
}): Promise<{ id: number; reference: string }> {
  // POST /api/commandes
  return { id: Math.floor(Math.random() * 1000), reference: 'CMD-' + Date.now() }
}

function ServiceCard({
  service,
  qty,
  onAdd,
  onRemove,
}: {
  service: MockService
  qty: number
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <div style={{
      background: '#fff', border: '1px solid rgba(33,34,34,0.09)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      opacity: service.est_disponible ? 1 : 0.55,
    }}>
      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={service.photo} alt={service.nom}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
        {!service.est_disponible && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(33,34,34,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Indisponible
            </span>
          </div>
        )}
        <div style={{
          position: 'absolute', top: '0.8rem', left: '0.8rem',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
          padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}>
          <span style={{ color: '#c5985b' }}>
            {categoryConfig[service.categorie as Categorie]?.icon}
          </span>
          <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {categoryConfig[service.categorie as Categorie]?.label}
          </span>
        </div>
      </div>
      <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 400, color: '#212222', margin: 0 }}>
          {service.nom}
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#6b6c6c', lineHeight: 1.55, margin: 0, flex: 1 }}>
          {service.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid rgba(33,34,34,0.06)' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#212222' }}>
            {formatPrice(service.prix_unitaire)}
          </span>
          {service.est_disponible && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {qty > 0 ? (
                <>
                  <button onClick={onRemove} aria-label="Retirer"
                    style={{ width: 30, height: 30, border: '1px solid rgba(33,34,34,0.15)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#212222', transition: 'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#c5985b')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(33,34,34,0.15)')}>
                    <Minus size={13} />
                  </button>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#212222', minWidth: 20, textAlign: 'center' }}>
                    {qty}
                  </span>
                  <button onClick={onAdd} aria-label="Ajouter"
                    style={{ width: 30, height: 30, border: 'none', background: '#c5985b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    <Plus size={13} />
                  </button>
                </>
              ) : (
                <button onClick={onAdd} aria-label="Ajouter au panier"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#212222', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#c5985b')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#212222')}>
                  <Plus size={12} /> Ajouter
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Order summary panel ───────────────────────────────────────────────────────
function OrderPanel({
  items,
  note,
  onNoteChange,
  onRemove,
  onConfirm,
  confirmed,
  loading,
}: {
  items: CartItem[]
  note: string
  onNoteChange: (v: string) => void
  onRemove: (id: number) => void
  onConfirm: () => void
  confirmed: boolean
  loading: boolean
}) {
  const total = items.reduce((s, i) => s + i.service.prix_unitaire * i.quantite, 0)

  if (confirmed) {
    return (
      <div style={{ background: '#fff', border: '1px solid rgba(74,180,74,0.3)', padding: '2rem', textAlign: 'center' }}>
        <CheckCircle2 size={40} style={{ color: '#2e8b2e', margin: '0 auto 1rem', display: 'block' }} />
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 400, color: '#212222', marginBottom: '0.5rem' }}>
          Commande envoyée
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#6b6c6c', lineHeight: 1.6 }}>
          Votre commande a été transmise à nos équipes. Délai estimé : 20–30 min.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.78rem', color: '#a16207' }}>
          <Clock size={14} /> Suivi disponible dans vos commandes
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.6rem', position: 'sticky', top: '5.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
        <ShoppingBag size={16} style={{ color: '#c5985b' }} />
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 400, color: '#212222', margin: 0 }}>
          Ma commande
        </h3>
        {items.length > 0 && (
          <span style={{ marginLeft: 'auto', background: '#c5985b', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
            {items.reduce((s, i) => s + i.quantite, 0)}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p style={{ fontSize: '0.82rem', color: '#bbbcc1', textAlign: 'center', padding: '1.5rem 0' }}>
          Votre commande est vide.
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1rem' }}>
            {items.map(item => (
              <div key={item.service.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', color: '#212222', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.service.nom}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6b6c6c' }}>
                    {item.quantite} × {formatPrice(item.service.prix_unitaire)}
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: '#212222', whiteSpace: 'nowrap' }}>
                  {formatPrice(item.service.prix_unitaire * item.quantite)}
                </span>
                <button onClick={() => onRemove(item.service.id)} aria-label="Retirer"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbbcc1', display: 'flex', padding: 2, transition: 'color 0.2s', flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#c0392b')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#bbbcc1')}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(33,34,34,0.09)', paddingTop: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#6b6c6c' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#212222' }}>
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <textarea
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            placeholder="Instructions spéciales (allergies, heure de livraison…)"
            rows={3}
            style={{
              width: '100%', border: '1px solid rgba(33,34,34,0.12)', padding: '0.75rem',
              fontSize: '0.82rem', fontFamily: 'var(--font-sans)', color: '#212222',
              background: '#f7f5f1', outline: 'none', resize: 'none',
              boxSizing: 'border-box', marginBottom: '1rem',
            }}
          />

          <button onClick={onConfirm} disabled={loading}
            style={{
              width: '100%', padding: '0.9rem', background: loading ? 'rgba(197,152,91,0.5)' : '#c5985b',
              color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#b8873e' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#c5985b' }}>
            {loading ? 'Envoi en cours…' : (<>Commander <ChevronRight size={14} /></>)}
          </button>
        </>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RoomServicePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [categorie, setCategorie] = useState<Categorie>('TOUT')
  const [cart, setCart] = useState<CartItem[]>([])
  const [note, setNote] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!user) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.8rem' }}>
              Accès restreint
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: '#212222', marginBottom: '1rem' }}>
              Connectez-vous pour accéder<br />au room service
            </h1>
            <Link href="/connexion?redirect=/room-service"
              style={{ background: '#c5985b', color: '#fff', padding: '0.85rem 2.2rem', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Se connecter
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const filtered = categorie === 'TOUT'
    ? MOCK_SERVICES
    : MOCK_SERVICES.filter(s => s.categorie === categorie)

  function getQty(id: number) {
    return cart.find(i => i.service.id === id)?.quantite ?? 0
  }

  function handleAdd(service: MockService) {
    setCart(prev => {
      const existing = prev.find(i => i.service.id === service.id)
      if (existing) return prev.map(i => i.service.id === service.id ? { ...i, quantite: i.quantite + 1 } : i)
      return [...prev, { service, quantite: 1 }]
    })
  }

  function handleRemoveOne(service: MockService) {
    setCart(prev => {
      const existing = prev.find(i => i.service.id === service.id)
      if (!existing) return prev
      if (existing.quantite === 1) return prev.filter(i => i.service.id !== service.id)
      return prev.map(i => i.service.id === service.id ? { ...i, quantite: i.quantite - 1 } : i)
    })
  }

  function handleRemoveAll(id: number) {
    setCart(prev => prev.filter(i => i.service.id !== id))
  }

  async function handleConfirm() {
    setLoading(true)
    await _apiPostCommande({
      reservation_ligne_id: 1, // Mock: would come from active reservation
      items: cart.map(i => ({ service_id: i.service.id, quantite: i.quantite })),
      note,
    })
    await new Promise(r => setTimeout(r, 800))
    setConfirmed(true)
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#f7f5f1', paddingTop: '6rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Back */}
          <button onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#bbbcc1', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.8rem', padding: 0 }}>
            <ArrowLeft size={14} /> Retour
          </button>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.5rem' }}>
              Espace client
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 400, color: '#212222', margin: 0, marginBottom: '0.6rem' }}>
              Room Service
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#6b6c6c', margin: 0, lineHeight: 1.6 }}>
              Commandez depuis votre chambre. Livraison en 20–30 minutes.
            </p>
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {(Object.keys(categoryConfig) as Categorie[]).map(cat => (
              <button key={cat} onClick={() => setCategorie(cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 600,
                  border: `1px solid ${categorie === cat ? '#c5985b' : 'rgba(33,34,34,0.15)'}`,
                  background: categorie === cat ? '#c5985b' : '#fff',
                  color: categorie === cat ? '#fff' : '#6b6c6c',
                  cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.05em',
                }}>
                {categoryConfig[cat].icon}
                {categoryConfig[cat].label}
              </button>
            ))}
          </div>

          {/* Layout: services grid + order panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '1.2rem' }}>
              {filtered.map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  qty={getQty(service.id)}
                  onAdd={() => handleAdd(service)}
                  onRemove={() => handleRemoveOne(service)}
                />
              ))}
            </div>
            <OrderPanel
              items={cart}
              note={note}
              onNoteChange={setNote}
              onRemove={handleRemoveAll}
              onConfirm={handleConfirm}
              confirmed={confirmed}
              loading={loading}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
