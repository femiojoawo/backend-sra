'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Upload, CheckCircle2, Calendar, Users, AlertTriangle,
  Eye, Trash2, ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { MOCK_RESERVATIONS } from '@/lib/mock-data'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ── Mock API skeleton ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _apiPostCheckIn(_reference: string, _payload: {
  type_document: string
  photo_base64?: string
}): Promise<{ statut: string; message: string }> {
  // POST /api/reservations/{reference}/check-in
  return { statut: 'OK', message: 'Check-in enregistré avec succès.' }
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}
function diffNights(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

export default function CheckInPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params)
  const router = useRouter()
  const { user } = useAuth()

  const reservation = MOCK_RESERVATIONS.find(r => r.reference === reference)

  const [docType, setDocType] = useState<'CNI' | 'PASSEPORT' | 'PERMIS'>('CNI')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#6b6c6c', marginBottom: '1.5rem' }}>Connexion requise.</p>
            <Link href={`/connexion?redirect=/check-in/${reference}`}
              style={{ background: '#c5985b', color: '#fff', padding: '0.85rem 2rem', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
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
            <AlertTriangle size={40} style={{ color: '#c5985b', margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ color: '#6b6c6c', marginBottom: '1.5rem' }}>Réservation introuvable.</p>
            <Link href="/dashboard" style={{ color: '#c5985b' }}>← Retour au tableau de bord</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (reservation.statut !== 'CONFIRMEE') {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertTriangle size={40} style={{ color: '#c5985b', margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ color: '#6b6c6c', marginBottom: '1.5rem' }}>Le check-in en ligne est disponible uniquement pour les réservations confirmées.</p>
            <Link href={`/reservations/${reference}`} style={{ color: '#c5985b' }}>← Voir la réservation</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const firstLigne = reservation.lignes[0]
  const nights = diffNights(firstLigne.check_in, firstLigne.check_out)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError('')
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) {
      setFile(f)
      setError('')
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(f)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Veuillez télécharger une photo de votre document.'); return }
    setLoading(true)
    setError('')
    await _apiPostCheckIn(reference, { type_document: docType, photo_base64: preview ?? undefined })
    await new Promise(r => setTimeout(r, 900))
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', background: '#f7f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
          <div style={{ maxWidth: 520, width: '100%', padding: '0 1.5rem', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(74,180,74,0.1)', border: '1px solid rgba(74,180,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={32} style={{ color: '#2e8b2e' }} />
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.6rem' }}>
              Check-in confirmé
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: '#212222', marginBottom: '1rem' }}>
              Merci, {user.prenom} !
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#6b6c6c', lineHeight: 1.7, marginBottom: '2rem' }}>
              Votre pièce d&apos;identité a bien été transmise à la réception. À votre arrivée le{' '}
              <strong style={{ color: '#212222' }}>{formatDate(firstLigne.check_in)}</strong>, votre chambre sera prête et votre accueil simplifié.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={`/reservations/${reference}`}
                style={{ background: '#c5985b', color: '#fff', padding: '0.85rem 1.8rem', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Ma réservation
              </Link>
              <Link href="/dashboard"
                style={{ background: 'transparent', border: '1px solid rgba(33,34,34,0.15)', color: '#6b6c6c', padding: '0.85rem 1.8rem', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Mon espace
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#f7f5f1', paddingTop: '6rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Back */}
          <button onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#bbbcc1', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.8rem', padding: 0 }}>
            <ArrowLeft size={14} /> Retour
          </button>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.5rem' }}>
              Espace client · {reference}
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 400, color: '#212222', margin: 0, marginBottom: '0.6rem' }}>
              Check-in en ligne
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#6b6c6c', lineHeight: 1.6, margin: 0 }}>
              Transmettez votre pièce d&apos;identité avant votre arrivée pour un accueil express à la réception.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Reservation summary */}
              <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.4rem' }}>
                <h2 style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1rem', marginTop: 0 }}>
                  Résumé du séjour
                </h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', color: '#6b6c6c' }}>
                    <Calendar size={14} style={{ color: '#c5985b' }} />
                    <span>{formatDate(firstLigne.check_in)} → {formatDate(firstLigne.check_out)}</span>
                    <span style={{ color: '#212222', fontWeight: 600, marginLeft: 4 }}>{nights} nuit{nights > 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', color: '#6b6c6c' }}>
                    <Users size={14} style={{ color: '#c5985b' }} />
                    <span>{firstLigne.adultes} adulte{firstLigne.adultes > 1 ? 's' : ''}</span>
                  </div>
                </div>
                {reservation.lignes.length > 1 && (
                  <p style={{ fontSize: '0.78rem', color: '#6b6c6c', marginTop: '0.5rem', marginBottom: 0 }}>
                    + {reservation.lignes.length - 1} autre{reservation.lignes.length > 2 ? 's' : ''} hébergement{reservation.lignes.length > 2 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Document type */}
              <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.4rem' }}>
                <h2 style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1rem', marginTop: 0 }}>
                  Type de document
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(['CNI', 'PASSEPORT', 'PERMIS'] as const).map(type => (
                    <button key={type} type="button" onClick={() => setDocType(type)}
                      style={{
                        padding: '0.55rem 1.2rem', fontSize: '0.78rem', fontWeight: 600,
                        border: `1px solid ${docType === type ? '#c5985b' : 'rgba(33,34,34,0.15)'}`,
                        background: docType === type ? 'rgba(197,152,91,0.08)' : '#fff',
                        color: docType === type ? '#c5985b' : '#6b6c6c',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                      {type === 'CNI' ? "Carte d'identité" : type === 'PASSEPORT' ? 'Passeport' : 'Permis de conduire'}
                    </button>
                  ))}
                </div>
              </div>

              {/* File upload */}
              <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.4rem' }}>
                <h2 style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1rem', marginTop: 0 }}>
                  Photo du document
                </h2>

                {preview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Aperçu du document"
                      style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain', border: '1px solid rgba(33,34,34,0.1)' }} />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                      <a href={preview} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#6b6c6c', textDecoration: 'none' }}>
                        <Eye size={13} /> Voir en grand
                      </a>
                      <button type="button" onClick={() => { setFile(null); setPreview(null) }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      border: '2px dashed rgba(197,152,91,0.35)', padding: '2.5rem 1rem',
                      cursor: 'pointer', transition: 'border-color 0.2s',
                      background: 'rgba(197,152,91,0.03)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#c5985b')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(197,152,91,0.35)')}>
                    <Upload size={28} style={{ color: '#c5985b', marginBottom: '0.8rem' }} />
                    <span style={{ fontSize: '0.86rem', fontWeight: 500, color: '#212222', marginBottom: '0.3rem' }}>
                      Glisser-déposer ou cliquer pour choisir
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#bbbcc1' }}>
                      JPG, PNG ou PDF — max 5 Mo
                    </span>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {error && (
                <div style={{ padding: '0.8rem 1rem', background: 'rgba(224,85,85,0.06)', border: '1px solid rgba(224,85,85,0.2)', fontSize: '0.82rem', color: '#c0392b' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{
                  padding: '1rem 2rem', background: loading ? 'rgba(197,152,91,0.5)' : '#c5985b',
                  color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                  transition: 'background 0.2s', alignSelf: 'flex-start',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#b8873e' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#c5985b' }}>
                {loading ? 'Envoi en cours…' : 'Valider le check-in'}
              </button>
            </form>

            {/* Info sidebar */}
            <aside>
              <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '1.4rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <ShieldCheck size={16} style={{ color: '#c5985b' }} />
                  <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#212222', margin: 0 }}>
                    Données sécurisées
                  </h3>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#6b6c6c', lineHeight: 1.6, margin: 0 }}>
                  Vos documents sont chiffrés et transmis directement à la réception de Sweet Rest Aparthotel. Ils ne sont pas stockés sur nos serveurs au-delà de votre séjour.
                </p>
              </div>

              <div style={{ background: 'rgba(197,152,91,0.05)', border: '1px solid rgba(197,152,91,0.2)', padding: '1.2rem' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.7rem', marginTop: 0 }}>
                  Bénéfices du check-in online
                </h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    'Accueil express à la réception',
                    'Chambre prête dès votre arrivée',
                    'Gain de temps garanti',
                  ].map(b => (
                    <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#6b6c6c' }}>
                      <CheckCircle2 size={13} style={{ color: '#c5985b', marginTop: 2, flexShrink: 0 }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
