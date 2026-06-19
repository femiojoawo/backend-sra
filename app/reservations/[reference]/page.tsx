'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Calendar, Users, CheckCircle2, Clock, XCircle,
  ChevronRight, Coffee, Car, Sparkles, Printer, AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { MOCK_RESERVATIONS } from '@/lib/mock-data'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}
function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}
function diffNights(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

const statusConfig = {
  CONFIRMEE: { label: 'Confirmée',  icon: <CheckCircle2 size={14} />, bg: 'rgba(74,180,74,0.1)',  color: '#2e8b2e', border: 'rgba(74,180,74,0.3)' },
  TERMINEE:  { label: 'Terminée',   icon: <Clock size={14} />,        bg: 'rgba(107,108,108,0.1)', color: '#6b6c6c', border: 'rgba(107,108,108,0.3)' },
  ANNULEE:   { label: 'Annulée',    icon: <XCircle size={14} />,      bg: 'rgba(224,85,85,0.1)',  color: '#c0392b', border: 'rgba(224,85,85,0.3)' },
}

export default function ReservationDetailPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const reservation = MOCK_RESERVATIONS.find(r => r.reference === reference)

  if (!user) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#6b6c6c', marginBottom: '1.5rem' }}>Connexion requise.</p>
            <Link href="/connexion" style={{ background: '#c5985b', color: '#fff', padding: '0.85rem 2rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Se connecter
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!reservation) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertTriangle size={40} style={{ color: '#c5985b', margin: '0 auto 1rem' }} />
            <p style={{ color: '#6b6c6c', marginBottom: '1.5rem' }}>Réservation introuvable.</p>
            <Link href="/dashboard" style={{ color: '#c5985b' }}>← Retour au tableau de bord</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const s = statusConfig[reservation.statut]

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#f7f5f1', paddingTop: '6rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Back */}
          <button onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#bbbcc1', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.8rem', padding: 0, letterSpacing: '0.08em' }}>
            <ArrowLeft size={14} /> Retour
          </button>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.5rem' }}>
                Détail de réservation
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: '#212222', margin: 0, marginBottom: '0.4rem' }}>
                {reservation.reference}
              </h1>
              <p style={{ fontSize: '0.82rem', color: '#6b6c6c' }}>
                Réservée le {formatDate(reservation.date_creation)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                {s.icon} {s.label}
              </span>
              <button
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'none', border: '1px solid rgba(33,34,34,0.15)', cursor: 'pointer', fontSize: '0.72rem', color: '#6b6c6c', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c5985b'; e.currentTarget.style.color = '#c5985b' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(33,34,34,0.15)'; e.currentTarget.style.color = '#6b6c6c' }}>
                <Printer size={14} /> Imprimer
              </button>
            </div>
          </div>

          {/* Lignes de réservation */}
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 400, color: '#212222', marginBottom: '1rem' }}>
            Hébergements
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {reservation.lignes.map(ligne => {
              const nights = diffNights(ligne.check_in, ligne.check_out)
              return (
                <div key={ligne.id} style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', display: 'grid', gridTemplateColumns: '160px 1fr', overflow: 'hidden' }}>
                  <div style={{ height: 160 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ligne.photo} alt={ligne.type_chambre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b', marginBottom: 2 }}>
                        Chambre {ligne.chambre_numero}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 400, color: '#212222', margin: 0 }}>
                        {ligne.type_chambre}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#6b6c6c' }}>
                        <Calendar size={13} />
                        <span>{formatDate(ligne.check_in)} – {formatDate(ligne.check_out)}</span>
                        <span style={{ color: '#c5985b', fontWeight: 600 }}>({nights} nuit{nights > 1 ? 's' : ''})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#6b6c6c' }}>
                        <Users size={13} />
                        <span>{ligne.adultes} adulte{ligne.adultes > 1 ? 's' : ''}{ligne.enfants > 0 ? ` + ${ligne.enfants} enfant${ligne.enfants > 1 ? 's' : ''}` : ''}</span>
                      </div>
                    </div>
                    {/* Options */}
                    {Object.values(ligne.options_souscrites).some(Boolean) && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {ligne.options_souscrites.petit_dejeuner && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', background: 'rgba(197,152,91,0.08)', border: '1px solid rgba(197,152,91,0.2)', fontSize: '0.72rem', color: '#c5985b' }}>
                            <Coffee size={11} /> Petit-déjeuner
                          </span>
                        )}
                        {ligne.options_souscrites.transfert && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', background: 'rgba(197,152,91,0.08)', border: '1px solid rgba(197,152,91,0.2)', fontSize: '0.72rem', color: '#c5985b' }}>
                            <Car size={11} /> Transfert
                          </span>
                        )}
                        {ligne.options_souscrites.spa && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', background: 'rgba(197,152,91,0.08)', border: '1px solid rgba(197,152,91,0.2)', fontSize: '0.72rem', color: '#c5985b' }}>
                            <Sparkles size={11} /> Spa
                          </span>
                        )}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(33,34,34,0.06)', paddingTop: '0.7rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#6b6c6c' }}>{formatPrice(ligne.prix_unitaire_nuit)}/nuit</span>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#212222' }}>{formatPrice(ligne.prix_total_ligne)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Contact info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.4rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1rem' }}>
                Coordonnées
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.86rem', color: '#6b6c6c' }}>
                <div><strong style={{ color: '#212222' }}>Nom :</strong> {reservation.contact_nom}</div>
                <div><strong style={{ color: '#212222' }}>Email :</strong> {reservation.contact_email}</div>
                <div><strong style={{ color: '#212222' }}>Tél. :</strong> {reservation.contact_telephone}</div>
              </div>
            </div>
            {reservation.demandes_speciales && (
              <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.4rem' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1rem' }}>
                  Demandes spéciales
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#6b6c6c', lineHeight: 1.6 }}>
                  {reservation.demandes_speciales}
                </p>
              </div>
            )}
          </div>

          {/* Total */}
          <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#6b6c6c' }}>Total de la réservation</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, color: '#212222' }}>
              {formatPrice(reservation.prix_total)}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {reservation.statut === 'CONFIRMEE' && (
              <>
                <Link href={`/check-in/${reservation.reference}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#c5985b', color: '#fff', padding: '0.85rem 1.8rem', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
                  Check-in en ligne <ChevronRight size={13} />
                </Link>
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid rgba(224,85,85,0.4)', color: '#c0392b', padding: '0.85rem 1.8rem', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(224,85,85,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  Annuler la réservation
                </button>
              </>
            )}
            <Link href="/dashboard"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid rgba(33,34,34,0.15)', color: '#6b6c6c', padding: '0.85rem 1.8rem', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
              ← Mon espace
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
