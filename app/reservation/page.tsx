'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ── Mock API skeleton ─────────────────────────────────────────────────────────
async function _apiCreateReservation(_payload: {
  type_hebergement: string
  date_arrivee: string
  date_depart: string
  nb_personnes: number
  demandes_speciales?: string
}, _token: string): Promise<{ id: number; reference: string }> {
  // POST /api/reservations/
  await new Promise(r => setTimeout(r, 800))
  const ref = 'SRA-' + new Date().getFullYear() + String(Date.now()).slice(-6)
  return { id: Math.floor(Math.random() * 9000) + 1000, reference: ref }
}

const hebergements = [
  'Chambre Standard', 'Chambre Supérieure', 'Chambre Twin',
  'Chambre Premium', 'Suite', 'Appartement 3 Pièces', 'Appartement 4 Pièces',
]

const prixMap: Record<string, number> = {
  'Chambre Standard':    60000,
  'Chambre Supérieure':  80000,
  'Chambre Twin':        80000,
  'Chambre Premium':    120000,
  'Suite':              130000,
  'Appartement 3 Pièces': 180000,
  'Appartement 4 Pièces': 180000,
}

function diffNights(a: string, b: string) {
  if (!a || !b) return 0
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

function ReservationForm() {
  const router       = useRouter()
  const params       = useSearchParams()
  const { user }     = useAuth()

  const today = new Date().toISOString().split('T')[0]

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    type:      params.get('type')     || hebergements[0],
    arrivee:   params.get('arrivee')  || '',
    depart:    params.get('depart')   || '',
    voyageurs: params.get('voyageurs') || '1',
    demandes:  '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [reservationId, setReservationId] = useState<number | null>(null)

  const nights = diffNights(form.arrivee, form.depart)
  const prixNuit = prixMap[form.type] ?? 60000
  const total = nights * prixNuit

  function update(key: string, val: string) { setForm(f => ({ ...f, [key]: val })) }

  function goToStep2() {
    if (!form.arrivee || !form.depart) { setError('Veuillez sélectionner vos dates.'); return }
    if (nights <= 0) { setError("La date de départ doit être après l'arrivée."); return }
    setError('')
    setStep(2)
  }

  async function confirm() {
    if (!user) { router.push('/connexion'); return }
    setLoading(true); setError('')
    try {
      const resa = await _apiCreateReservation({
        type_hebergement: form.type,
        date_arrivee: form.arrivee,
        date_depart:  form.depart,
        nb_personnes: parseInt(form.voyageurs),
        demandes_speciales: form.demandes || undefined,
      }, user.token)
      setReservationId(resa.id)
      setStep(3)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réservation.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: '#fff', border: '1px solid rgba(33,34,34,0.12)',
    fontFamily: 'var(--font-sans)', fontSize: '0.92rem', fontWeight: 300,
    color: '#212222', padding: '0.9rem 1.1rem', outline: 'none', width: '100%',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f1', paddingTop: '7rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1rem' }}>
            <span style={{ width: 28, height: 1, background: '#c5985b', display: 'inline-block' }} />
            Réservation en ligne
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 400, color: '#212222' }}>
            Réservez votre <em style={{ fontStyle: 'italic', color: '#c5985b' }}>séjour</em>
          </h1>
        </div>

        {/* Steps indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '2.5rem' }}>
            {[
              { n: 1, label: 'Votre séjour' },
              { n: 2, label: 'Confirmation' },
            ].map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: step >= s.n ? '#c5985b' : '#fff',
                    border: step >= s.n ? 'none' : '1px solid rgba(33,34,34,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-serif)', fontSize: '0.9rem',
                    color: step >= s.n ? '#fff' : '#6b6c6c', flexShrink: 0,
                    transition: 'all 0.3s',
                  }}>
                    {s.n}
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.08em', color: step >= s.n ? '#212222' : '#bbbcc1', whiteSpace: 'nowrap' }}>{s.label}</span>
                </div>
                {i < 1 && <div style={{ flex: 1, height: 1, background: step > s.n ? '#c5985b' : 'rgba(33,34,34,0.12)', margin: '0 1rem', transition: 'background 0.3s' }} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — form */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }} className="max-md:grid-cols-1">
            <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: '#212222', marginBottom: '1.8rem' }}>Détails du séjour</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>{"Type d'hébergement *"}</label>
                  <select style={{ ...inputStyle, appearance: 'none' }} value={form.type} onChange={e => update('type', e.target.value)}
                    onFocus={el => { el.target.style.borderColor = '#c5985b'; el.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                    onBlur={el => { el.target.style.borderColor = 'rgba(33,34,34,0.12)'; el.target.style.boxShadow = 'none' }}>
                    {hebergements.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }} className="max-sm:grid-cols-1">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>{"Date d'arrivée *"}</label>
                    <input style={inputStyle} type="date" min={today} value={form.arrivee} onChange={e => update('arrivee', e.target.value)}
                      onFocus={el => { el.target.style.borderColor = '#c5985b'; el.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                      onBlur={el => { el.target.style.borderColor = 'rgba(33,34,34,0.12)'; el.target.style.boxShadow = 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Date de départ *</label>
                    <input style={inputStyle} type="date" min={form.arrivee || today} value={form.depart} onChange={e => update('depart', e.target.value)}
                      onFocus={el => { el.target.style.borderColor = '#c5985b'; el.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                      onBlur={el => { el.target.style.borderColor = 'rgba(33,34,34,0.12)'; el.target.style.boxShadow = 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Nombre de voyageurs *</label>
                  <select style={{ ...inputStyle, appearance: 'none' }} value={form.voyageurs} onChange={e => update('voyageurs', e.target.value)}
                    onFocus={el => { el.target.style.borderColor = '#c5985b'; el.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                    onBlur={el => { el.target.style.borderColor = 'rgba(33,34,34,0.12)'; el.target.style.boxShadow = 'none' }}>
                    {['1', '2', '3', '4', '5', '6'].map(v => <option key={v} value={v}>{v} {v === '1' ? 'personne' : 'personnes'}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Demandes spéciales</label>
                  <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} placeholder="Allergies alimentaires, besoins particuliers, heure d'arrivée estimée…" value={form.demandes} onChange={e => update('demandes', e.target.value)}
                    onFocus={el => { el.target.style.borderColor = '#c5985b'; el.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                    onBlur={el => { el.target.style.borderColor = 'rgba(33,34,34,0.12)'; el.target.style.boxShadow = 'none' }} />
                </div>

                {error && <div style={{ background: 'rgba(224,85,85,0.08)', borderLeft: '2px solid #e05555', padding: '0.7rem 0.9rem', fontSize: '0.84rem', color: '#c0392b' }}>{error}</div>}

                {!user && (
                  <div style={{ background: 'rgba(197,152,91,0.08)', borderLeft: '2px solid #c5985b', padding: '0.8rem 1rem', fontSize: '0.84rem', color: '#3a3b3b' }}>
                    Vous devez être <Link href="/connexion" style={{ color: '#c5985b', fontWeight: 500 }}>connecté</Link> pour finaliser votre réservation.
                  </div>
                )}

                <button onClick={goToStep2}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 2rem', background: '#c5985b', color: '#fff', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s', alignSelf: 'flex-start' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#8f6b36')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#c5985b')}
                >
                  Continuer <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Summary card */}
            <div style={{ background: '#212222', padding: '2rem', position: 'sticky', top: '6rem' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1.2rem' }}>Récapitulatif</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#fff', marginBottom: '1.5rem' }}>{form.type}</div>
              {nights > 0 ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Arrivée</span><span style={{ color: '#fff' }}>{formatDate(form.arrivee)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Départ</span><span style={{ color: '#fff' }}>{formatDate(form.depart)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Durée</span><span style={{ color: '#fff' }}>{nights} nuit{nights > 1 ? 's' : ''}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Voyageurs</span><span style={{ color: '#fff' }}>{form.voyageurs}</span></div>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Total estimé</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ddb87c' }}>{formatPrice(total)}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.4rem', textAlign: 'right' }}>
                    {formatPrice(prixNuit)} × {nights} nuit{nights > 1 ? 's' : ''}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>Sélectionnez vos dates pour voir le tarif estimé.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2 — confirm */}
        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }} className="max-md:grid-cols-1">
            <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: '#212222', marginBottom: '1.8rem' }}>Confirmer la réservation</h2>

              {/* Details recap */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid rgba(33,34,34,0.09)', marginBottom: '1.8rem' }}>
                {[
                  { label: "Type d'hébergement", value: form.type },
                  { label: "Date d'arrivée",      value: formatDate(form.arrivee) },
                  { label: 'Date de départ',       value: formatDate(form.depart) },
                  { label: 'Durée',                value: `${nights} nuit${nights > 1 ? 's' : ''}` },
                  { label: 'Voyageurs',            value: `${form.voyageurs} personne${parseInt(form.voyageurs) > 1 ? 's' : ''}` },
                  ...(form.demandes ? [{ label: 'Demandes spéciales', value: form.demandes }] : []),
                ].map((row, i, arr) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.9rem 1.2rem', borderBottom: i < arr.length - 1 ? '1px solid rgba(33,34,34,0.06)' : 'none', gap: '1rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b6c6c', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: '0.88rem', color: '#212222', textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Client info */}
              {user && (
                <div style={{ background: '#f7f5f1', border: '1px solid rgba(33,34,34,0.09)', padding: '1.2rem', marginBottom: '1.8rem' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.7rem' }}>Réservation pour</div>
                  <div style={{ fontSize: '0.92rem', color: '#212222', marginBottom: '0.2rem' }}>{user.prenom} {user.nom}</div>
                  <div style={{ fontSize: '0.84rem', color: '#6b6c6c' }}>{user.email}</div>
                </div>
              )}

              {error && <div style={{ background: 'rgba(224,85,85,0.08)', borderLeft: '2px solid #e05555', padding: '0.7rem 0.9rem', fontSize: '0.84rem', color: '#c0392b', marginBottom: '1rem' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => setStep(1)}
                  style={{ padding: '0.9rem 1.8rem', background: 'transparent', color: '#6b6c6c', border: '1px solid rgba(33,34,34,0.12)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#212222')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(33,34,34,0.12)')}
                >
                  ← Modifier
                </button>
                <button onClick={confirm} disabled={loading}
                  style={{ flex: 1, padding: '0.9rem 1.8rem', background: '#c5985b', color: '#fff', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.3s' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#8f6b36' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#c5985b' }}
                >
                  {loading ? 'Confirmation en cours…' : 'Confirmer la réservation'}
                </button>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: '#212222', padding: '2rem', position: 'sticky', top: '6rem' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1.5rem' }}>Récapitulatif</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#fff', marginBottom: '0.5rem' }}>{form.type}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Arrivée</span><span style={{ color: '#fff' }}>{formatDate(form.arrivee)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Départ</span><span style={{ color: '#fff' }}>{formatDate(form.depart)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Durée</span><span style={{ color: '#fff' }}>{nights} nuit{nights > 1 ? 's' : ''}</span></div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Total estimé</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ddb87c' }}>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — success */}
        {step === 3 && (
          <div style={{ background: '#fff', border: '1px solid rgba(33,34,34,0.09)', padding: '4rem 2.5rem', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
            <CheckCircle size={52} style={{ color: '#c5985b', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: '#212222', marginBottom: '0.7rem' }}>
              Réservation confirmée !
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#6b6c6c', lineHeight: 1.8, marginBottom: '0.5rem' }}>
              Votre réservation <strong style={{ color: '#212222' }}>#{reservationId}</strong> a bien été enregistrée.
            </p>
            <p style={{ fontSize: '0.88rem', color: '#6b6c6c', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              Notre équipe vous contactera sous 24h pour confirmer les détails. Un email de confirmation vous sera envoyé.
            </p>
            <div style={{ width: 40, height: '1.5px', background: '#c5985b', margin: '0 auto 2rem' }} />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/mes-reservations"
                style={{ padding: '0.9rem 1.8rem', background: '#c5985b', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', transition: 'all 0.3s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#8f6b36' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#c5985b' }}
              >
                Mes réservations
              </Link>
              <Link href="/"
                style={{ padding: '0.9rem 1.8rem', background: 'transparent', color: '#212222', border: '1px solid rgba(33,34,34,0.12)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', transition: 'all 0.3s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#212222' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(33,34,34,0.12)' }}
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReservationPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ minHeight: '100vh', paddingTop: '8rem', textAlign: 'center', color: '#bbbcc1' }}>Chargement…</div>}>
        <ReservationForm />
      </Suspense>
      <Footer />
    </>
  )
}
