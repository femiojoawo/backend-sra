'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Trash2, Calendar, Users, Coffee, Car, Sparkles, ChevronRight, ArrowLeft } from 'lucide-react'
import { useCart, type CartLine } from '@/lib/cart-context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

function diffNights(a: string, b: string) {
  if (!a || !b) return 0
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.2em',
  textTransform: 'uppercase', color: '#c5985b',
}

function CartLineCard({ line, onRemove, onToggleOption }: {
  line: CartLine
  onRemove: () => void
  onToggleOption: (opt: keyof CartLine['options']) => void
}) {
  const nights = diffNights(line.check_in, line.check_out)

  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(33,34,34,0.09)',
      display: 'grid',
      gridTemplateColumns: '180px 1fr',
      overflow: 'hidden',
    }}>
      {/* Photo */}
      <div style={{ position: 'relative', height: 180 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={line.room_photo} alt={line.room_nom}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Content */}
      <div style={{ padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={labelStyle}>{line.room_type}</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 400, color: '#212222', margin: '0.2rem 0 0' }}>
              {line.room_nom}
            </h3>
          </div>
          <button onClick={onRemove} aria-label="Supprimer"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbbcc1', display: 'flex', padding: 4, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e05555')}
            onMouseLeave={e => (e.currentTarget.style.color = '#bbbcc1')}>
            <Trash2 size={16} />
          </button>
        </div>

        {/* Dates & voyageurs */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#6b6c6c' }}>
            <Calendar size={14} />
            <span>{formatDate(line.check_in)} → {formatDate(line.check_out)}</span>
            <span style={{ color: '#c5985b', fontWeight: 600, marginLeft: 4 }}>{nights} nuit{nights > 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#6b6c6c' }}>
            <Users size={14} />
            <span>{line.adultes} adulte{line.adultes > 1 ? 's' : ''}{line.enfants > 0 ? `, ${line.enfants} enfant${line.enfants > 1 ? 's' : ''}` : ''}</span>
          </div>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {([
            { key: 'petit_dejeuner' as const, icon: <Coffee size={12} />, label: 'Petit-déjeuner' },
            { key: 'transfert' as const, icon: <Car size={12} />, label: 'Transfert aéroport' },
            { key: 'spa' as const, icon: <Sparkles size={12} />, label: 'Accès Spa' },
          ]).map(o => (
            <button key={o.key} type="button" onClick={() => onToggleOption(o.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.3rem 0.7rem', fontSize: '0.72rem', fontWeight: 500,
                border: `1px solid ${line.options[o.key] ? '#c5985b' : 'rgba(33,34,34,0.15)'}`,
                background: line.options[o.key] ? 'rgba(197,152,91,0.08)' : '#fff',
                color: line.options[o.key] ? '#c5985b' : '#6b6c6c',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              {o.icon}
              {o.label}
            </button>
          ))}
        </div>

        {/* Price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(33,34,34,0.07)', paddingTop: '0.8rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#6b6c6c' }}>
            {formatPrice(line.prix_unitaire_nuit)} × {nights} nuit{nights > 1 ? 's' : ''}
          </span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 400, color: '#212222' }}>
            {formatPrice(line.prix_total_ligne)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function PanierPage() {
  const router = useRouter()
  const { lines, total, removeLine, updateOptions, clearCart } = useCart()

  if (lines.length === 0) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem', paddingBottom: '4rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 420, padding: '0 1.5rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(197,152,91,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <ShoppingCart size={30} style={{ color: '#c5985b' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, color: '#212222', marginBottom: '0.8rem' }}>
              Votre panier est vide
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#6b6c6c', lineHeight: 1.7, marginBottom: '2rem' }}>
              Découvrez nos hébergements et ajoutez vos chambres préférées pour commencer votre réservation.
            </p>
            <Link href="/recherche"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: '#c5985b', color: '#fff', padding: '0.9rem 2rem',
                fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
                textDecoration: 'none', transition: 'background 0.3s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#8f6b36')}
              onMouseLeave={e => (e.currentTarget.style.background = '#c5985b')}>
              Voir les disponibilités <ChevronRight size={14} />
            </Link>
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
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <button onClick={() => router.back()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#bbbcc1', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.2rem', letterSpacing: '0.08em', padding: 0 }}>
              <ArrowLeft size={14} /> Retour
            </button>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.6rem' }}>
              <ShoppingCart size={12} />
              MON PANIER
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 400, color: '#212222', margin: 0 }}>
              Récapitulatif de votre sélection
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>

            {/* Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {lines.map(line => (
                <CartLineCard
                  key={line.key}
                  line={line}
                  onRemove={() => removeLine(line.key)}
                  onToggleOption={opt => updateOptions(line.key, { ...line.options, [opt]: !line.options[opt] })}
                />
              ))}

              {/* Clear cart */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={clearCart}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: '#bbbcc1', transition: 'color 0.2s', padding: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#e05555')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#bbbcc1')}>
                  <Trash2 size={14} />
                  Vider le panier
                </button>
              </div>
            </div>

            {/* Summary */}
            <div style={{ position: 'sticky', top: '5.5rem' }}>
              <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 400, color: '#212222', marginBottom: '1.4rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(33,34,34,0.08)' }}>
                  Résumé
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#6b6c6c' }}>
                    <span>{lines.length} hébergement{lines.length > 1 ? 's' : ''}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#6b6c6c' }}>
                    <span>Total nuits</span>
                    <span>{totalNuits} nuit{totalNuits > 1 ? 's' : ''}</span>
                  </div>
                  {lines.some(l => l.options.petit_dejeuner) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#c5985b' }}>
                      <span>Petit-déjeuner inclus</span>
                      <span>Offert</span>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid rgba(33,34,34,0.08)', paddingTop: '1rem', marginBottom: '1.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.78rem', color: '#6b6c6c', letterSpacing: '0.05em' }}>Total estimé</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 400, color: '#212222' }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#bbbcc1', marginTop: '0.3rem' }}>Taxes incluses</p>
                </div>

                <Link href="/booking"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    width: '100%', padding: '1rem', background: '#c5985b', color: '#fff',
                    fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
                    textDecoration: 'none', transition: 'background 0.3s', marginBottom: '0.8rem',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#8f6b36')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#c5985b')}>
                  Passer à la réservation <ChevronRight size={14} />
                </Link>

                <Link href="/recherche"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100%', padding: '0.85rem', background: 'transparent',
                    border: '1px solid rgba(33,34,34,0.2)', color: '#212222',
                    fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
                    textDecoration: 'none', transition: 'border-color 0.3s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#c5985b')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(33,34,34,0.2)')}>
                  Ajouter une chambre
                </Link>
              </div>

              {/* Trust badge */}
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(197,152,91,0.06)', border: '1px solid rgba(197,152,91,0.15)', fontSize: '0.78rem', color: '#6b6c6c', lineHeight: 1.6, textAlign: 'center' }}>
                Annulation gratuite jusqu&apos;à 48h avant l&apos;arrivée
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
