'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, ChevronRight, Star, Users, Baby, Maximize2,
  BedDouble, CheckCircle2, ShoppingCart, Calendar, ArrowRight,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getMockRoomById, type MockRoom } from '@/lib/mock-rooms'
import { useCart } from '@/lib/cart-context'

// ── helpers ────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

function diffNights(a: string, b: string) {
  if (!a || !b) return 0
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

// ── Stars ──────────────────────────────────────────────────────────────────
function Stars({ note, size = 14 }: { note: number; size?: number }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i} size={size}
          fill={i <= Math.round(note) ? '#c5985b' : 'none'}
          stroke={i <= Math.round(note) ? '#c5985b' : '#ccc'}
        />
      ))}
    </span>
  )
}

// ── Carousel ───────────────────────────────────────────────────────────────
function Carousel({ photos, nom }: { photos: string[]; nom: string }) {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  function goTo(idx: number) {
    if (idx === current) return
    setFading(true)
    setTimeout(() => {
      setCurrent(idx)
      setFading(false)
    }, 220)
  }

  function prev() { goTo((current - 1 + photos.length) % photos.length) }
  function next() { goTo((current + 1) % photos.length) }

  const btnBase: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    zIndex: 10, background: 'rgba(33,34,34,0.55)', border: 'none',
    color: '#fff', cursor: 'pointer', padding: '0.75rem 0.85rem',
    backdropFilter: 'blur(4px)', transition: 'background 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', userSelect: 'none' }}>
      {/* Main image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[current]}
        alt={`${nom} — vue ${current + 1}`}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.22s ease',
        }}
      />

      {/* Counter */}
      <div style={{
        position: 'absolute', top: '1.2rem', right: '1.4rem',
        background: 'rgba(33,34,34,0.65)', backdropFilter: 'blur(4px)',
        color: '#fff', fontSize: '0.72rem', fontWeight: 600,
        letterSpacing: '0.12em', padding: '0.3rem 0.75rem',
      }}>
        {current + 1} / {photos.length}
      </div>

      {/* Arrow prev */}
      {photos.length > 1 && (
        <button onClick={prev} style={{ ...btnBase, left: '1rem' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(197,152,91,0.85)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(33,34,34,0.55)')}
          aria-label="Photo précédente"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Arrow next */}
      {photos.length > 1 && (
        <button onClick={next} style={{ ...btnBase, right: '1rem' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(197,152,91,0.85)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(33,34,34,0.55)')}
          aria-label="Photo suivante"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Thumbnail strip */}
      <div style={{
        position: 'absolute', bottom: '1.2rem', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: '0.5rem',
      }}>
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Voir photo ${i + 1}`}
            style={{
              width: 56, height: 38,
              border: i === current ? '2px solid #c5985b' : '2px solid rgba(255,255,255,0.3)',
              padding: 0, cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
              transition: 'border-color 0.2s',
              background: 'none',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Booking Module ─────────────────────────────────────────────────────────
function BookingModule({ room }: { room: MockRoom }) {
  const router = useRouter()
  const { addLine } = useCart()
  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const [arrivee, setArrivee]     = useState(today)
  const [depart, setDepart]       = useState(tomorrow)
  const [adultes, setAdultes]     = useState(1)
  const [enfants, setEnfants]     = useState(0)
  const [petitDej, setPetitDej]   = useState(false)
  const [transfert, setTransfert] = useState(false)
  const [error, setError]         = useState('')
  const [cartAdded, setCartAdded] = useState(false)

  const nights = diffNights(arrivee, depart)
  const total  = room.prix_nuit * Math.max(nights, 1)

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#f7f5f1', border: '1px solid rgba(33,34,34,0.12)',
    padding: '0.65rem 0.85rem', fontSize: '0.88rem', color: '#212222',
    fontFamily: 'var(--font-sans)', outline: 'none',
    transition: 'border-color 0.2s',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em',
    textTransform: 'uppercase', color: '#c5985b', display: 'block', marginBottom: '0.4rem',
  }

  function validate() {
    if (!arrivee || !depart) { setError('Veuillez saisir les dates.'); return false }
    if (new Date(depart) <= new Date(arrivee)) { setError("Le départ doit être après l'arrivée."); return false }
    setError(''); return true
  }

  function handleReserve() {
    if (!validate()) return
    addLine(room, arrivee, depart, adultes, enfants, { petit_dejeuner: petitDej, transfert })
    router.push('/panier')
  }

  function handleAddToCart() {
    if (!validate()) return
    addLine(room, arrivee, depart, adultes, enfants, { petit_dejeuner: petitDej, transfert })
    setCartAdded(true)
    setTimeout(() => setCartAdded(false), 3000)
  }

  return (
    <div style={{
      position: 'sticky', top: 88,
      background: '#fff',
      border: '1px solid rgba(33,34,34,0.1)',
      boxShadow: '0 4px 32px rgba(33,34,34,0.08)',
    }}>
      {/* Header */}
      <div style={{ padding: '1.4rem 1.6rem', borderBottom: '1px solid #f0ece4' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#212222', fontWeight: 400 }}>
          {formatPrice(room.prix_nuit)}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
          par nuit · taxes incluses
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div>
            <label style={labelStyle}>Arrivée</label>
            <input
              type="date" value={arrivee} min={today}
              onChange={e => setArrivee(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#c5985b')}
              onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')}
            />
          </div>
          <div>
            <label style={labelStyle}>Départ</label>
            <input
              type="date" value={depart} min={arrivee || today}
              onChange={e => setDepart(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#c5985b')}
              onBlur={e => (e.target.style.borderColor = 'rgba(33,34,34,0.12)')}
            />
          </div>
        </div>

        {/* Guests */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div>
            <label style={labelStyle}>Adultes</label>
            <select value={adultes} onChange={e => setAdultes(Number(e.target.value))} style={inputStyle}>
              {Array.from({ length: room.capacite_adultes }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} adulte{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Enfants</label>
            <select value={enfants} onChange={e => setEnfants(Number(e.target.value))} style={inputStyle}>
              {Array.from({ length: room.capacite_enfants + 1 }, (_, i) => i).map(n => (
                <option key={n} value={n}>{n} enfant{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Options souscrites */}
        <div style={{ borderTop: '1px solid #f0ece4', paddingTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.2rem' }}>
            Options
          </div>
          {[
            { key: 'petitDej',  label: 'Petit-déjeuner inclus', prix: '+5 000 FCFA/pers', value: petitDej,  set: setPetitDej },
            { key: 'transfert', label: 'Transfert aéroport',     prix: '+15 000 FCFA',   value: transfert, set: setTransfert },
          ].map(opt => (
            <label key={opt.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#3a3b3b' }}>
                <input
                  type="checkbox" checked={opt.value}
                  onChange={e => opt.set(e.target.checked)}
                  style={{ accentColor: '#c5985b', width: 15, height: 15, flexShrink: 0, cursor: 'pointer' }}
                />
                {opt.label}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#c5985b', fontWeight: 600, whiteSpace: 'nowrap' }}>{opt.prix}</span>
            </label>
          ))}
        </div>

        {/* Nights summary */}
        {nights > 0 && (
          <div style={{
            background: '#f7f5f1', padding: '0.9rem 1rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.82rem', color: '#6b6c6c' }}>
              {formatPrice(room.prix_nuit)} × {nights} nuit{nights > 1 ? 's' : ''}
            </span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#212222' }}>
              {formatPrice(total)}
            </span>
          </div>
        )}

        {error && (
          <p style={{ fontSize: '0.78rem', color: '#c0392b', margin: 0 }}>{error}</p>
        )}

        {/* CTA buttons */}
        <button
          onClick={handleReserve}
          style={{
            width: '100%', background: '#c5985b', color: '#fff', border: 'none',
            padding: '0.9rem', fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.25s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#8f6b36')}
          onMouseLeave={e => (e.currentTarget.style.background = '#c5985b')}
        >
          Réserver — aller au panier <ArrowRight size={15} />
        </button>

        <button
          onClick={handleAddToCart}
          style={{
            width: '100%', background: cartAdded ? '#212222' : 'transparent',
            color: cartAdded ? '#c5985b' : '#212222',
            border: '1px solid ' + (cartAdded ? '#212222' : 'rgba(33,34,34,0.2)'),
            padding: '0.85rem', fontSize: '0.72rem', fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.25s',
          }}
          onMouseEnter={e => { if (!cartAdded) { (e.currentTarget.style.background = '#212222'); (e.currentTarget.style.color = '#c5985b') } }}
          onMouseLeave={e => { if (!cartAdded) { (e.currentTarget.style.background = 'transparent'); (e.currentTarget.style.color = '#212222') } }}
        >
          <ShoppingCart size={14} />
          {cartAdded ? 'Ajouté au panier !' : 'Ajouter au panier'}
        </button>

        <p style={{ fontSize: '0.7rem', color: '#aaa', textAlign: 'center', margin: 0 }}>
          Annulation gratuite · Paiement à l&apos;hôtel
        </p>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ChambreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [room, setRoom] = useState<MockRoom | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const found = getMockRoomById(Number(id))
    if (!found) setNotFound(true)
    else setRoom(found)
  }, [id])

  if (notFound) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.2rem' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#212222' }}>Chambre introuvable</p>
          <Link href="/#hebergements" style={{ color: '#c5985b', fontSize: '0.82rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Voir toutes les chambres
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  if (!room) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f0ece4', borderTopColor: '#c5985b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: '#999', fontSize: '0.88rem' }}>Chargement…</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main>
        {/* ── Breadcrumb ── */}
        <div style={{ padding: '1.4rem 3.5rem', borderBottom: '1px solid #f0ece4' }} className="max-sm:px-6">
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#aaa' }}>
            <Link href="/" style={{ color: '#aaa', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c5985b')}
              onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
            >Accueil</Link>
            <ChevronRight size={12} />
            <Link href="/#hebergements" style={{ color: '#aaa', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c5985b')}
              onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
            >Hébergements</Link>
            <ChevronRight size={12} />
            <span style={{ color: '#212222' }}>{room.nom}</span>
          </nav>
        </div>

        {/* ── Hero title ── */}
        <div style={{ padding: '2.5rem 3.5rem 1.5rem', maxWidth: 1200 }} className="max-sm:px-6">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              {room.badge && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#fff', background: '#c5985b', padding: '0.3rem 0.8rem' }}>
                    {room.badge}
                  </span>
                </div>
              )}
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.5rem' }}>
                {room.type_hebergement}
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, color: '#212222', margin: 0 }}>
                {room.nom}
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#212222' }}>
                {formatPrice(room.prix_nuit)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>/ nuit</div>
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Stars note={room.note_moyenne} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#212222' }}>{room.note_moyenne.toFixed(1)}</span>
              <span style={{ fontSize: '0.78rem', color: '#aaa' }}>({room.nb_avis} avis)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: '#6b6c6c' }}>
              <Maximize2 size={14} color="#c5985b" /> {room.superficie} m²
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: '#6b6c6c' }}>
              <BedDouble size={14} color="#c5985b" /> {room.type_lit}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: '#6b6c6c' }}>
              <Users size={14} color="#c5985b" /> {room.capacite_adultes} adulte{room.capacite_adultes > 1 ? 's' : ''}
              {room.capacite_enfants > 0 && <><Baby size={14} color="#c5985b" /> {room.capacite_enfants} enfant{room.capacite_enfants > 1 ? 's' : ''}</>}
            </div>
          </div>
        </div>

        {/* ── Main 2-col layout ── */}
        <div
          style={{ padding: '0 3.5rem 6rem', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', maxWidth: 1200, margin: '0 auto' }}
          className="max-lg:grid-cols-1 max-sm:px-6"
        >
          {/* LEFT COLUMN */}
          <div>
            {/* Carousel */}
            <div style={{ height: 480, overflow: 'hidden', marginBottom: '2.5rem' }} className="max-sm:h-72">
              <Carousel photos={room.photos} nom={room.nom} />
            </div>

            {/* Points forts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
              {room.points_forts.map(p => (
                <span key={p} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: '#c5985b', border: '1px solid rgba(197,152,91,0.35)',
                  padding: '0.3rem 0.8rem', background: 'rgba(197,152,91,0.04)',
                }}>
                  <CheckCircle2 size={11} /> {p}
                </span>
              ))}
            </div>

            {/* Gold divider */}
            <div style={{ width: 40, height: 1.5, background: '#c5985b', marginBottom: '2rem' }} />

            {/* Long description */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: '#212222', marginBottom: '1rem' }}>
                À propos de cet hébergement
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.95, color: '#5a5b5b' }}>
                {room.description_longue}
              </p>
            </div>

            {/* Equipements */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: '#212222', marginBottom: '1.5rem' }}>
                Équipements &amp; Services
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.8rem' }} className="max-sm:grid-cols-1">
                {room.equipements.map(cat => (
                  <div key={cat.categorie}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.8rem' }}>
                      {cat.categorie}
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {cat.items.map(item => (
                        <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#5a5b5b' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c5985b', flexShrink: 0 }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating summary */}
            <div style={{ marginTop: '3rem', padding: '2rem', background: '#f7f5f1', borderLeft: '3px solid #c5985b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: '#212222', lineHeight: 1 }}>
                    {room.note_moyenne.toFixed(1)}
                  </div>
                  <Stars note={room.note_moyenne} size={16} />
                  <div style={{ fontSize: '0.68rem', color: '#aaa', marginTop: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {room.nb_avis} avis
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', color: '#5a5b5b', lineHeight: 1.75, margin: 0 }}>
                    Nos clients apprécient particulièrement la qualité de la literie, la propreté impeccable et l&apos;accueil chaleureux du personnel du SRA Hotel. Cette chambre fait régulièrement l&apos;objet d&apos;éloges pour son rapport qualité-prix et son atmosphère soignée.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation to other rooms */}
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f0ece4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/#hebergements"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b6c6c', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c5985b')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b6c6c')}
              >
                <ChevronLeft size={15} /> Tous les hébergements
              </Link>
              <Link href="/recherche"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c5985b', transition: 'color 0.2s' }}
              >
                Voir les disponibilités <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN — Sticky booking module */}
          <div className="max-lg:hidden">
            <BookingModule room={room} />
          </div>
        </div>

        {/* Mobile booking bar */}
        <div
          className="lg:hidden"
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
            background: '#212222', padding: '1rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#fff' }}>{formatPrice(room.prix_nuit)}</div>
            <div style={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>/ nuit</div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Link
              href={`/reservation?type=${encodeURIComponent(room.type_hebergement)}&room_id=${room.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#c5985b', color: '#fff', border: 'none',
                padding: '0.8rem 1.4rem', fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Réserver <ArrowRight size={13} />
            </Link>
            <Link
              href={`/reservation?type=${encodeURIComponent(room.type_hebergement)}&room_id=${room.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'transparent', color: '#c5985b', border: '1px solid #c5985b',
                padding: '0.8rem', fontSize: '0.7rem', cursor: 'pointer',
              }}
              aria-label="Ajouter au panier"
            >
              <ShoppingCart size={16} />
            </Link>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Footer />
    </>
  )
}
