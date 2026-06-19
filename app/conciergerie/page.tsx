'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin, Phone, Star, Car, Utensils, Trees, ShoppingBag,
  Bell, ChevronRight, Clock, ArrowLeft, ExternalLink,
  MessageCircle, X, Send, CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ── Mock API skeleton ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _apiCallReception(_payload: {
  type: 'URGENCE' | 'ASSISTANCE'
  message: string
}): Promise<{ success: boolean }> {
  // POST /api/concierge/call — déclenche une alerte WebSocket vers le back-office
  return { success: true }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _apiGetPartners(_type?: string): Promise<MockPartner[]> {
  // GET /api/partners?type={type}
  return MOCK_PARTNERS
}

interface MockPartner {
  id: number
  nom: string
  categorie: 'RESTAURANT' | 'TRANSPORT' | 'TOURISME' | 'SHOPPING'
  description: string
  adresse: string
  distance: string
  note: number
  photo: string
  horaires: string
}

const MOCK_PARTNERS: MockPartner[] = [
  {
    id: 1,
    nom: 'Restaurant Le Jardin d\'Abidjan',
    categorie: 'RESTAURANT',
    description: 'Cuisine ivoirienne et africaine revisitée. Terrasse avec vue jardin.',
    adresse: 'Cocody, Rue des Jardins',
    distance: '300 m',
    note: 4.7,
    photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    horaires: 'Lun–Dim 12h–22h30',
  },
  {
    id: 2,
    nom: 'Brasserie La Rotonde',
    categorie: 'RESTAURANT',
    description: 'Cuisine française et internationale. Ambiance lounge élégante.',
    adresse: 'Cocody, Avenue Chardy',
    distance: '1.2 km',
    note: 4.5,
    photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
    horaires: 'Lun–Sam 11h–23h',
  },
  {
    id: 3,
    nom: 'VTC Prestige Abidjan',
    categorie: 'TRANSPORT',
    description: 'Service de chauffeurs privés disponible 24h/24. Véhicules premium.',
    adresse: 'Service à domicile',
    distance: 'Sur demande',
    note: 4.8,
    photo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600&q=80',
    horaires: '24h/24 — 7j/7',
  },
  {
    id: 4,
    nom: 'Parc du Banco',
    categorie: 'TOURISME',
    description: 'Forêt tropicale classée en plein cœur d\'Abidjan. Promenades et découvertes.',
    adresse: 'Yopougon, Abidjan',
    distance: '8 km',
    note: 4.6,
    photo: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80',
    horaires: 'Tous les jours 7h–18h',
  },
  {
    id: 5,
    nom: 'Palais de la Culture',
    categorie: 'TOURISME',
    description: 'Musée et lieu d\'art ivoirien. Expositions permanentes et temporaires.',
    adresse: 'Cocody, Abidjan',
    distance: '2.5 km',
    note: 4.4,
    photo: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&q=80',
    horaires: 'Mar–Dim 9h–17h',
  },
  {
    id: 6,
    nom: 'Cap Sud Shopping',
    categorie: 'SHOPPING',
    description: 'Grand centre commercial avec boutiques de mode, épiceries fines et librairies.',
    adresse: 'Marcory, Abidjan',
    distance: '5 km',
    note: 4.2,
    photo: 'https://images.unsplash.com/photo-1555529669-2269763671c0?w=600&q=80',
    horaires: 'Tous les jours 9h–22h',
  },
]

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  TOUT:       { label: 'Tout',         icon: <MapPin size={13} />,      color: '#c5985b' },
  RESTAURANT: { label: 'Restaurants',  icon: <Utensils size={13} />,   color: '#e05555' },
  TRANSPORT:  { label: 'Transport',    icon: <Car size={13} />,         color: '#1d4ed8' },
  TOURISME:   { label: 'Tourisme',     icon: <Trees size={13} />,       color: '#2e8b2e' },
  SHOPPING:   { label: 'Shopping',     icon: <ShoppingBag size={13} />, color: '#a16207' },
}

// ── Chat widget ───────────────────────────────────────────────────────────────
const SWEETIE_RESPONSES: Record<string, string> = {
  default: 'Je suis Sweetie, votre assistant virtuel SRA. Comment puis-je vous aider pendant votre séjour ?',
  bonjour: 'Bonjour ! Je suis Sweetie. Que puis-je faire pour vous aujourd\'hui ?',
  horaires: 'Le restaurant de l\'hôtel est ouvert de 7h à 22h30 tous les jours. Le spa est accessible de 9h à 20h.',
  spa: 'Notre spa propose massages, soins visage et accès hammam. Vous pouvez commander via l\'onglet Room Service.',
  parking: 'Oui, l\'hôtel dispose d\'un parking privatif gratuit pour les résidents. L\'entrée se fait par la rue latérale.',
  wifi: 'Le WiFi est disponible partout dans l\'établissement. Réseau : SRA-Guests / Mot de passe : sweetrest2026',
  checkout: 'Le check-out standard est à 12h. Une prolongation jusqu\'à 14h peut être accordée selon disponibilité.',
  petit: 'Le petit-déjeuner est servi de 7h à 10h30 au restaurant. Vous pouvez aussi le commander en chambre via le Room Service.',
}

function getResponse(msg: string): string {
  const lower = msg.toLowerCase()
  for (const key of Object.keys(SWEETIE_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return SWEETIE_RESPONSES[key]
  }
  return 'Merci pour votre message ! Pour des demandes spécifiques, je vous recommande de contacter directement la réception au +225 27 22 43 XXXX.'
}

interface ChatMessage { role: 'user' | 'sweetie'; text: string }

function SweetieChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'sweetie', text: SWEETIE_RESPONSES.default },
  ])

  function send() {
    const msg = input.trim()
    if (!msg) return
    const userMsg: ChatMessage = { role: 'user', text: msg }
    const sweetieMsg: ChatMessage = { role: 'sweetie', text: getResponse(msg) }
    setMessages(prev => [...prev, userMsg, sweetieMsg])
    setInput('')
  }

  return (
    <>
      {/* FAB */}
      <button onClick={() => setOpen(v => !v)}
        aria-label="Ouvrir le chat Sweetie"
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 400,
          width: 56, height: 56, borderRadius: '50%',
          background: '#c5985b', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(197,152,91,0.35)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(197,152,91,0.5)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(197,152,91,0.35)' }}>
        {open ? <X size={22} color="#fff" /> : <MessageCircle size={22} color="#fff" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '5.5rem', right: '2rem', zIndex: 400,
          width: 340, background: '#fff', boxShadow: '0 8px 40px rgba(33,34,34,0.18)',
          display: 'flex', flexDirection: 'column', maxHeight: 480,
        }}>
          {/* Header */}
          <div style={{ background: '#212222', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#c5985b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageCircle size={15} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#fff' }}>Sweetie</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>Assistant virtuel SRA</div>
            </div>
            <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#4ab44a' }} />
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '0.6rem 0.9rem', fontSize: '0.82rem', lineHeight: 1.5,
                  background: m.role === 'user' ? '#c5985b' : '#f7f5f1',
                  color: m.role === 'user' ? '#fff' : '#212222',
                }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          <div style={{ padding: '0 0.8rem 0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['Horaires', 'Parking', 'WiFi', 'Petit-déjeuner'].map(s => (
              <button key={s} onClick={() => { setInput(s); setTimeout(() => send(), 0) }}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.68rem', border: '1px solid rgba(197,152,91,0.3)', background: 'rgba(197,152,91,0.06)', color: '#c5985b', cursor: 'pointer', transition: 'background 0.2s' }}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '0.8rem', borderTop: '1px solid rgba(33,34,34,0.08)', display: 'flex', gap: '0.5rem' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
              placeholder="Votre question…"
              style={{ flex: 1, border: '1px solid rgba(33,34,34,0.12)', padding: '0.5rem 0.75rem', fontSize: '0.82rem', fontFamily: 'var(--font-sans)', outline: 'none', background: '#f7f5f1' }}
            />
            <button onClick={send}
              style={{ width: 36, height: 36, background: '#c5985b', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              <Send size={15} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Appel réception panel ─────────────────────────────────────────────────────
function ReceptionCallPanel() {
  const [called, setCalled] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCall() {
    setLoading(true)
    await _apiCallReception({ type: 'ASSISTANCE', message: 'Appel conciergerie depuis l\'espace client.' })
    await new Promise(r => setTimeout(r, 700))
    setCalled(true)
    setLoading(false)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Phone size={16} style={{ color: '#c5985b' }} />
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 400, color: '#212222', margin: 0 }}>
          Contacter la réception
        </h3>
      </div>
      {called ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2e8b2e', fontSize: '0.84rem' }}>
          <CheckCircle2 size={16} />
          <span>La réception a été notifiée. Elle vous contacte sous 5 minutes.</span>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '0.82rem', color: '#6b6c6c', lineHeight: 1.6, marginBottom: '1.2rem' }}>
            Besoin d&apos;aide ? Notre équipe de réception est disponible 24h/24.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button onClick={handleCall} disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.75rem 1.4rem', background: '#212222', color: '#fff', border: 'none',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                cursor: loading ? 'wait' : 'pointer', transition: 'background 0.2s', opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#c5985b' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#212222' }}>
              <Bell size={13} />
              {loading ? 'Appel en cours…' : 'Appeler la réception'}
            </button>
            <a href="tel:+22527224300"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.2rem', border: '1px solid rgba(33,34,34,0.15)', color: '#6b6c6c', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c5985b'; e.currentTarget.style.color = '#c5985b' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(33,34,34,0.15)'; e.currentTarget.style.color = '#6b6c6c' }}>
              <Phone size={13} /> +225 27 22 43 00
            </a>
          </div>
        </>
      )}
    </div>
  )
}

// ── Partner card ──────────────────────────────────────────────────────────────
function PartnerCard({ partner }: { partner: MockPartner }) {
  const cat = categoryConfig[partner.categorie]
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={partner.photo} alt={partner.nom}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
        <div style={{
          position: 'absolute', top: '0.7rem', left: '0.7rem',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
          padding: '0.2rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}>
          <span style={{ color: cat.color }}>{cat.icon}</span>
          <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {cat.label}
          </span>
        </div>
        <div style={{
          position: 'absolute', bottom: '0.7rem', right: '0.7rem',
          background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.5rem',
          display: 'flex', alignItems: 'center', gap: '0.25rem',
        }}>
          <Star size={11} style={{ color: '#f0b429', fill: '#f0b429' }} />
          <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: 600 }}>{partner.note}</span>
        </div>
      </div>
      <div style={{ padding: '1.1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem', fontWeight: 400, color: '#212222', margin: 0 }}>
          {partner.nom}
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#6b6c6c', margin: 0, lineHeight: 1.5, flex: 1 }}>
          {partner.description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(33,34,34,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#6b6c6c' }}>
            <MapPin size={11} style={{ color: '#c5985b', flexShrink: 0 }} />
            <span>{partner.adresse}</span>
            <span style={{ color: '#c5985b', fontWeight: 600, marginLeft: 'auto', whiteSpace: 'nowrap' }}>{partner.distance}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#6b6c6c' }}>
            <Clock size={11} style={{ color: '#c5985b', flexShrink: 0 }} />
            {partner.horaires}
          </div>
        </div>
        <a href="#" onClick={e => e.preventDefault()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#c5985b', textDecoration: 'none', marginTop: '0.3rem', transition: 'opacity 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          Voir sur Maps <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ConciergeriePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [filter, setFilter] = useState<string>('TOUT')

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
              Connectez-vous pour accéder<br />à la conciergerie
            </h1>
            <Link href="/connexion?redirect=/conciergerie"
              style={{ background: '#c5985b', color: '#fff', padding: '0.85rem 2.2rem', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Se connecter
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const filtered = filter === 'TOUT' ? MOCK_PARTNERS : MOCK_PARTNERS.filter(p => p.categorie === filter)

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
              Conciergerie & Assistance
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#6b6c6c', margin: 0, lineHeight: 1.6 }}>
              Découvrez les bonnes adresses autour de l&apos;hôtel, et contactez notre équipe à tout moment.
            </p>
          </div>

          {/* Quick actions row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '0.8rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Room Service', href: '/room-service', icon: <Utensils size={16} />, desc: 'Commander en chambre' },
              { label: 'Check-in Online', href: '/dashboard', icon: <CheckCircle2 size={16} />, desc: 'Accueil simplifié' },
              { label: 'Mes Réservations', href: '/dashboard', icon: <Star size={16} />, desc: 'Gérer mes séjours' },
            ].map(a => (
              <Link key={a.label} href={a.href}
                style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.2rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#c5985b')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(33,34,34,0.09)')}>
                <span style={{ color: '#c5985b' }}>{a.icon}</span>
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#212222' }}>{a.label}</span>
                <span style={{ fontSize: '0.75rem', color: '#6b6c6c' }}>{a.desc}</span>
                <ChevronRight size={13} style={{ color: '#bbbcc1', marginTop: 'auto' }} />
              </Link>
            ))}
          </div>

          {/* Reception panel */}
          <div style={{ marginBottom: '2.5rem' }}>
            <ReceptionCallPanel />
          </div>

          {/* Partners section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 400, color: '#212222', margin: 0 }}>
                Guide des bonnes adresses
              </h2>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {Object.keys(categoryConfig).map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 600,
                      border: `1px solid ${filter === cat ? '#c5985b' : 'rgba(33,34,34,0.15)'}`,
                      background: filter === cat ? '#c5985b' : '#fff',
                      color: filter === cat ? '#fff' : '#6b6c6c',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                    {categoryConfig[cat].icon}
                    {categoryConfig[cat].label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '1.2rem' }}>
              {filtered.map(p => <PartnerCard key={p.id} partner={p} />)}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <SweetieChat />
    </>
  )
}
