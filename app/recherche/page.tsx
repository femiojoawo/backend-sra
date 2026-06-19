'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Users, Baby, BedDouble, Star, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { searchRooms, type RoomRead } from '@/lib/api'

const typeOptions = [
  '', 'Chambre Standard', 'Chambre Supérieure', 'Chambre Twin',
  'Chambre Premium', 'Suite', 'Appartement 3 Pièces', 'Appartement 4 Pièces',
]

const typeImages: Record<string, string> = {
  'Chambre Standard':      'https://sra-hotel.com/media/ch-standard.jpg',
  'Chambre Supérieure':    'https://sra-hotel.com/media/ch-superieure.jpg',
  'Chambre Twin':          'https://sra-hotel.com/media/ch-twin.jpg',
  'Chambre Premium':       'https://sra-hotel.com/media/ch-premium.jpg',
  'Suite':                 'https://sra-hotel.com/media/suite.jpg',
  'Appartement 3 Pièces':  'https://sra-hotel.com/media/appt3.jpg',
  'Appartement 4 Pièces':  'https://sra-hotel.com/media/appt4.jpg',
}

const fallbackImages: Record<string, string> = {
  'Chambre Standard':      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  'Chambre Supérieure':    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
  'Chambre Twin':          'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80',
  'Chambre Premium':       'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  'Suite':                 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
  'Appartement 3 Pièces':  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'Appartement 4 Pièces':  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
}

function diffNights(a: string, b: string) {
  if (!a || !b) return 0
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Stars({ note }: { note?: number }) {
  const v = note ?? 0
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11}
          fill={i <= Math.round(v) ? '#c5985b' : 'none'}
          stroke={i <= Math.round(v) ? '#c5985b' : '#bbb'}
        />
      ))}
      {v > 0 && <span style={{ fontSize: '0.72rem', color: '#888', marginLeft: 4 }}>{v.toFixed(1)}</span>}
    </span>
  )
}

function RoomCard({ room, nights, arrivee, depart }: { room: RoomRead; nights: number; arrivee: string; depart: string }) {
  const total = room.prix_nuit * Math.max(nights, 1)
  const img = (room.photos?.[0]) || typeImages[room.type_hebergement] || fallbackImages[room.type_hebergement] || fallbackImages['Chambre Standard']
  const [imgSrc, setImgSrc] = useState(img)

  const params = new URLSearchParams({
    type: room.type_hebergement,
    arrivee,
    depart,
    adultes: String(room.capacite_adultes),
    room_id: String(room.id),
  })

  return (
    <article
      style={{
        background: '#fff',
        boxShadow: '0 2px 16px rgba(33,34,34,0.07)',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s, transform 0.3s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(197,152,91,0.18)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(33,34,34,0.07)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', height: 220 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={room.nom}
          onError={() => setImgSrc(fallbackImages[room.type_hebergement] || fallbackImages['Chambre Standard'])}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
        />
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(33,34,34,0.6) 0%, transparent 100%)',
            padding: '1.2rem 1rem 0.8rem',
          }}
        >
          <span
            style={{
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: '#c5985b',
              background: 'rgba(33,34,34,0.85)', padding: '0.25rem 0.7rem',
            }}
          >
            {room.type_hebergement}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 400,
              color: '#212222', marginBottom: '0.3rem',
            }}
          >
            {room.nom}
          </h3>
          <Stars note={room.note_moyenne} />
          {room.nb_avis !== undefined && room.nb_avis > 0 && (
            <span style={{ fontSize: '0.72rem', color: '#aaa', marginLeft: 2 }}>
              ({room.nb_avis} avis)
            </span>
          )}
        </div>

        {room.description && (
          <p style={{ fontSize: '0.82rem', color: '#6b6c6c', lineHeight: 1.55, margin: 0 }}>
            {room.description.length > 120 ? room.description.slice(0, 118) + '…' : room.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.78rem', color: '#6b6c6c' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Users size={13} color="#c5985b" />
            {room.capacite_adultes} adulte{room.capacite_adultes > 1 ? 's' : ''}
          </span>
          {room.capacite_enfants > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Baby size={13} color="#c5985b" />
              {room.capacite_enfants} enfant{room.capacite_enfants > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid #f0ece4' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block' }}>
                {nights > 1 ? `${nights} nuits` : '1 nuit'}
              </span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#212222', fontWeight: 400 }}>
                {formatPrice(total)}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#aaa', marginLeft: 6 }}>
                ({formatPrice(room.prix_nuit)}/nuit)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                href={`/chambres/${room.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: '#c5985b', background: 'transparent', border: '1px solid #c5985b',
                  padding: '0.55rem 0.9rem', transition: 'all 0.25s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#c5985b'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#c5985b' }}
              >
                Détails
              </Link>
              <Link
                href={`/reservation?${params.toString()}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: '#fff', background: '#c5985b', padding: '0.55rem 0.9rem',
                  transition: 'background 0.3s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#8f6b36')}
                onMouseLeave={e => (e.currentTarget.style.background = '#c5985b')}
              >
                Réserver <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function RecherchePage() {
  const router     = useRouter()
  const params     = useSearchParams()
  const today      = new Date().toISOString().split('T')[0]
  const tomorrow   = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const [arrivee, setArrivee]   = useState(params.get('arrivee') || today)
  const [depart, setDepart]     = useState(params.get('depart')  || tomorrow)
  const [adultes, setAdultes]   = useState(params.get('adultes') || '1')
  const [enfants, setEnfants]   = useState(params.get('enfants') || '0')
  const [type, setType]         = useState(params.get('type') || '')
  const [filterOpen, setFilterOpen] = useState(false)

  const [rooms, setRooms]       = useState<RoomRead[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const nights = diffNights(arrivee, depart)

  const doSearch = useCallback(async (a: string, d: string, ad: string, en: string, t: string) => {
    if (!a || !d) return
    if (new Date(d) <= new Date(a)) {
      setError("La date de départ doit être après la date d'arrivée.")
      return
    }
    setError('')
    setLoading(true)
    setHasSearched(true)
    try {
      const results = await searchRooms({
        date_arrivee: a,
        date_depart: d,
        nb_adultes: Number(ad),
        nb_enfants: Number(en),
        ...(t ? { type_hebergement: t } : {}),
      })
      setRooms(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-search on mount if dates are present
  useEffect(() => {
    if (params.get('arrivee') && params.get('depart')) {
      doSearch(
        params.get('arrivee')!,
        params.get('depart')!,
        params.get('adultes') || '1',
        params.get('enfants') || '0',
        params.get('type') || '',
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearch() {
    const qs = new URLSearchParams({ arrivee, depart, adultes, enfants, ...(type ? { type } : {}) })
    router.replace(`/recherche?${qs.toString()}`)
    doSearch(arrivee, depart, adultes, enfants, type)
    setFilterOpen(false)
  }

  const inputStyle: React.CSSProperties = {
    background: 'transparent', border: 'none',
    fontFamily: 'var(--font-sans)', fontSize: '0.88rem',
    fontWeight: 300, color: 'rgba(255,255,255,0.88)',
    outline: 'none', width: '100%', colorScheme: 'dark' as unknown as string,
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.22em',
    textTransform: 'uppercase', color: '#c5985b', display: 'block', marginBottom: '0.25rem',
  }

  return (
    <>
      <Navbar />

      {/* Sticky search bar */}
      <div
        style={{
          position: 'sticky', top: 64, zIndex: 100,
          background: '#212222',
          boxShadow: '0 2px 12px rgba(0,0,0,0.22)',
        }}
      >
        {/* Desktop bar */}
        <div
          className="hidden md:grid"
          style={{
            padding: '0 3.5rem',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto',
          }}
        >
          {/* Arrivée */}
          <div style={{ padding: '1.1rem 1.4rem', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <label style={labelStyle}>Arrivée</label>
            <input type="date" value={arrivee} min={today}
              onChange={e => setArrivee(e.target.value)} style={inputStyle} />
          </div>
          {/* Départ */}
          <div style={{ padding: '1.1rem 1.4rem', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <label style={labelStyle}>Départ</label>
            <input type="date" value={depart} min={arrivee || today}
              onChange={e => setDepart(e.target.value)} style={inputStyle} />
          </div>
          {/* Adultes */}
          <div style={{ padding: '1.1rem 1.4rem', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <label style={labelStyle}>Adultes</label>
            <select value={adultes} onChange={e => setAdultes(e.target.value)} style={inputStyle}>
              {['1','2','3','4','5','6'].map(v => (
                <option key={v} value={v} style={{ background: '#212222' }}>{v} adulte{Number(v)>1?'s':''}</option>
              ))}
            </select>
          </div>
          {/* Enfants */}
          <div style={{ padding: '1.1rem 1.4rem', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <label style={labelStyle}>Enfants</label>
            <select value={enfants} onChange={e => setEnfants(e.target.value)} style={inputStyle}>
              {['0','1','2','3','4'].map(v => (
                <option key={v} value={v} style={{ background: '#212222' }}>{v} enfant{Number(v)>1?'s':''}</option>
              ))}
            </select>
          </div>
          {/* Type */}
          <div style={{ padding: '1.1rem 1.4rem', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <label style={labelStyle}>Type (optionnel)</label>
            <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
              {typeOptions.map((t, i) => (
                <option key={i} value={t} style={{ background: '#212222' }}>{t || 'Tous les hébergements'}</option>
              ))}
            </select>
          </div>
          {/* CTA */}
          <button
            onClick={handleSearch}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0 2rem', background: '#c5985b',
              fontFamily: 'var(--font-sans)', fontSize: '0.68rem',
              fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#fff', cursor: 'pointer', border: 'none', transition: 'background 0.3s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#8f6b36')}
            onMouseLeave={e => (e.currentTarget.style.background = '#c5985b')}
          >
            <Search size={14} />
            Rechercher
          </button>
        </div>

        {/* Mobile bar */}
        <div
          className="flex md:hidden items-center justify-between"
          style={{ padding: '0.9rem 1.4rem' }}
        >
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)' }}>
            {arrivee && depart ? (
              <>
                <span style={{ color: '#c5985b', fontWeight: 600 }}>{formatDate(arrivee)}</span>
                {' → '}
                <span style={{ color: '#c5985b', fontWeight: 600 }}>{formatDate(depart)}</span>
                {' · '}{adultes} adulte{Number(adultes)>1?'s':''}, {enfants} enfant{Number(enfants)>1?'s':''}
              </>
            ) : 'Sélectionnez vos dates'}
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#c5985b', border: 'none', color: '#fff',
              padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <SlidersHorizontal size={13} /> Filtrer
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.5rem 3.5rem 0.8rem', fontSize: '0.78rem', color: '#e05555' }}>
            {error}
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(33,34,34,0.9)',
            display: 'flex', alignItems: 'flex-end',
          }}
          onClick={() => setFilterOpen(false)}
        >
          <div
            style={{ background: '#fff', width: '100%', padding: '2rem 1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#212222' }}>Modifier la recherche</span>
              <button onClick={() => setFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#212222" />
              </button>
            </div>
            {[
              { label: 'Arrivée', el: <input type="date" value={arrivee} min={today} onChange={e => setArrivee(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede9e2', fontSize: '0.9rem', fontFamily: 'inherit' }} /> },
              { label: 'Départ',  el: <input type="date" value={depart} min={arrivee||today} onChange={e => setDepart(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede9e2', fontSize: '0.9rem', fontFamily: 'inherit' }} /> },
              { label: 'Adultes', el: <select value={adultes} onChange={e => setAdultes(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede9e2', fontSize: '0.9rem', fontFamily: 'inherit' }}>{['1','2','3','4','5','6'].map(v => <option key={v} value={v}>{v} adulte{Number(v)>1?'s':''}</option>)}</select> },
              { label: 'Enfants', el: <select value={enfants} onChange={e => setEnfants(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede9e2', fontSize: '0.9rem', fontFamily: 'inherit' }}>{['0','1','2','3','4'].map(v => <option key={v} value={v}>{v} enfant{Number(v)>1?'s':''}</option>)}</select> },
              { label: 'Type', el: <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede9e2', fontSize: '0.9rem', fontFamily: 'inherit' }}>{typeOptions.map((t,i) => <option key={i} value={t}>{t||'Tous les hébergements'}</option>)}</select> },
            ].map(({ label, el }) => (
              <div key={label}>
                <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c5985b', display: 'block', marginBottom: '0.4rem' }}>{label}</label>
                {el}
              </div>
            ))}
            <button
              onClick={handleSearch}
              style={{
                background: '#c5985b', color: '#fff', border: 'none', padding: '0.9rem',
                fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', cursor: 'pointer', marginTop: '0.5rem',
              }}
            >
              Rechercher les disponibilités
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{ background: '#f7f5f1', minHeight: '70vh', paddingBottom: '5rem' }}>

        {/* Context bar */}
        {hasSearched && !loading && (
          <div
            style={{
              background: '#fff', borderBottom: '1px solid #ede9e2',
              padding: '1rem 3.5rem', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
            }}
            className="max-md:px-5"
          >
            <div style={{ fontSize: '0.82rem', color: '#6b6c6c' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#212222', fontWeight: 400 }}>
                {rooms.length} hébergement{rooms.length !== 1 ? 's' : ''} disponible{rooms.length !== 1 ? 's' : ''}
              </span>
              {' '}· {formatDate(arrivee)} → {formatDate(depart)} · {nights} nuit{nights > 1 ? 's' : ''} · {adultes} adulte{Number(adultes)>1?'s':''}{Number(enfants)>0 ? `, ${enfants} enfant${Number(enfants)>1?'s':''}` : ''}
            </div>
          </div>
        )}

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 3.5rem 0' }} className="max-md:px-5 max-sm:px-4">

          {/* Initial state */}
          {!hasSearched && !loading && (
            <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
              <BedDouble size={48} color="#c5985b" style={{ marginBottom: '1.2rem', opacity: 0.6 }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#212222', fontWeight: 400, marginBottom: '0.8rem' }}>
                Trouvez votre hébergement idéal
              </h2>
              <p style={{ color: '#6b6c6c', fontSize: '0.9rem', maxWidth: 420, margin: '0 auto 2rem' }}>
                Sélectionnez vos dates et le nombre de voyageurs pour découvrir les disponibilités.
              </p>
              <button
                onClick={handleSearch}
                style={{
                  background: '#c5985b', color: '#fff', border: 'none',
                  padding: '0.85rem 2.5rem', fontFamily: 'var(--font-sans)',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em',
                  textTransform: 'uppercase', cursor: 'pointer',
                }}
              >
                Lancer la recherche
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
              <div
                style={{
                  width: 40, height: 40, border: '3px solid #ede9e2',
                  borderTopColor: '#c5985b', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', margin: '0 auto 1.2rem',
                }}
              />
              <p style={{ color: '#6b6c6c', fontSize: '0.88rem' }}>Recherche des disponibilités…</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* No results */}
          {!loading && hasSearched && rooms.length === 0 && !error && (
            <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
              <BedDouble size={40} color="#ccc" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#212222', fontWeight: 400, marginBottom: '0.6rem' }}>
                Aucune disponibilité trouvée
              </h3>
              <p style={{ color: '#6b6c6c', fontSize: '0.88rem', maxWidth: 380, margin: '0 auto' }}>
                Aucun hébergement ne correspond à vos critères pour ces dates. Essayez de modifier les dates ou le nombre de voyageurs.
              </p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div
              style={{
                background: '#fff8f8', border: '1px solid #fca5a5',
                padding: '1.2rem 1.5rem', color: '#dc2626', fontSize: '0.85rem',
                maxWidth: 500, margin: '3rem auto', textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {/* Results grid */}
          {!loading && rooms.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem',
              }}
            >
              {rooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  nights={nights}
                  arrivee={arrivee}
                  depart={depart}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}

export default function RecherchePageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f5f1' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #ede9e2', borderTopColor: '#c5985b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    }>
      <RecherchePage />
    </Suspense>
  )
}
