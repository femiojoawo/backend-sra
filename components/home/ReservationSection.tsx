'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

const hebergements = [
  '', 'Chambre Standard', 'Chambre Supérieure', 'Chambre Twin',
  'Chambre Premium', 'Suite', 'Appartement 3 Pièces', 'Appartement 4 Pièces',
]

const contactItems = [
  { icon: '📍', label: 'Adresse',            value: 'Quartier Cocody M\'badon, près de l\'ambassade de Chine, Abidjan\nCôte d\'Ivoire' },
  { icon: '📞', label: 'Téléphone',           value: '+225 01 50 67 86 95' },
  { icon: '✉️', label: 'Email',               value: 'reception@sra-hotel.com' },
  { icon: '🕐', label: 'Check-in / Check-out', value: 'Check-in : à partir de 14h00\nCheck-out : avant 12h00' },
]

export default function ReservationSection() {
  const { user } = useAuth()
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({ prenom: '', nom: '', email: '', tel: '', arrivee: '', depart: '', type: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function update(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit() {
    const { prenom, nom, email, arrivee, depart, type } = form
    if (!prenom || !nom || !email || !arrivee || !depart || !type) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.'); return
    }
    if (new Date(depart) <= new Date(arrivee)) {
      setErrorMsg("La date de départ doit être après l'arrivée."); return
    }
    setErrorMsg('')
    setStatus('sending')
    // Simulate send (no email service configured)
    await new Promise(r => setTimeout(r, 1200))
    setStatus('done')
  }

  const inputStyle: React.CSSProperties = {
    background: '#fff', border: '1px solid rgba(33,34,34,0.09)', fontFamily: 'var(--font-sans)',
    fontSize: '0.88rem', fontWeight: 300, color: '#212222', padding: '0.8rem 1rem',
    outline: 'none', width: '100%', transition: 'border-color 0.3s, box-shadow 0.3s',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: '#c5985b',
  }

  return (
    <div id="reservation">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 700 }} className="max-md:grid-cols-1">
        {/* Left — dark info panel */}
        <div style={{ background: '#212222', padding: '6rem 4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
          className="max-sm:px-6 max-sm:py-16"
        >
          <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(197,152,91,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(197,152,91,0.04)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#ddb87c', marginBottom: '1.2rem' }}>
              <span style={{ width: 28, height: 1, background: '#ddb87c', display: 'inline-block' }} />
              Réservation
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 400, lineHeight: 1.15, color: '#fff' }}>
              Réservez votre <em style={{ fontStyle: 'italic', color: '#ddb87c' }}>séjour</em> en quelques instants
            </h2>
            <div style={{ width: 40, height: '1.5px', background: '#c5985b', margin: '1.6rem 0' }} />
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: 320 }}>
              Notre équipe vous confirme la disponibilité sous 24 heures et prend en charge chaque détail de votre séjour.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', marginTop: '3rem' }}>
              {contactItems.map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: 38, height: 38, border: '1px solid rgba(197,152,91,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem', fontSize: '0.9rem' }}>
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.3rem' }}>{c.label}</div>
                    <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div style={{ background: '#f7f5f1', padding: '6rem 4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          className="max-sm:px-6 max-sm:py-16"
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1.2rem' }}>
            <span style={{ width: 28, height: 1, background: '#c5985b', display: 'inline-block' }} />
            Votre demande
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 400, color: '#212222', marginBottom: '0.4rem' }}>Formulaire de réservation</h3>

          {user && (
            <div style={{ background: 'rgba(197,152,91,0.08)', borderLeft: '2px solid #c5985b', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#3a3b3b' }}>
              Connecté en tant que <strong>{user.prenom} {user.nom}</strong> —{' '}
              <Link href="/reservation" style={{ color: '#c5985b', fontWeight: 500 }}>Réserver via mon compte</Link>
            </div>
          )}

          {status === 'done' ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✓</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#212222', marginBottom: '0.5rem' }}>Demande envoyée !</div>
              <p style={{ color: '#6b6c6c', lineHeight: 1.7 }}>Notre équipe vous contactera sous 24h pour confirmer votre séjour.</p>
              <button onClick={() => { setStatus('idle'); setForm({ prenom: '', nom: '', email: '', tel: '', arrivee: '', depart: '', type: '', message: '' }) }}
                style={{ marginTop: '1.5rem', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                Nouvelle demande
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }} className="max-sm:grid-cols-1">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Prénom *</label>
                  <input style={inputStyle} type="text" placeholder="Jean-Marc" value={form.prenom} onChange={e => update('prenom', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.09)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Nom *</label>
                  <input style={inputStyle} type="text" placeholder="Kouassi" value={form.nom} onChange={e => update('nom', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.09)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} type="email" placeholder="contact@email.com" value={form.email} onChange={e => update('email', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.09)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Téléphone</label>
                <input style={inputStyle} type="tel" placeholder="+225 01 50 67 86 95" value={form.tel} onChange={e => update('tel', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.09)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }} className="max-sm:grid-cols-1">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>{"Date d'arrivée *"}</label>
                  <input style={inputStyle} type="date" min={today} value={form.arrivee} onChange={e => update('arrivee', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.09)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Date de départ *</label>
                  <input style={inputStyle} type="date" min={form.arrivee || today} value={form.depart} onChange={e => update('depart', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.09)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>{"Type d'hébergement *"}</label>
                <select style={{ ...inputStyle, appearance: 'none' }} value={form.type} onChange={e => update('type', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.09)'; e.target.style.boxShadow = 'none' }}
                >
                  {hebergements.map(h => <option key={h} value={h}>{h || 'Choisir...'}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Demandes spéciales</label>
                <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} placeholder="Précisez vos demandes, allergies alimentaires, besoins particuliers..." value={form.message} onChange={e => update('message', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#c5985b'; e.target.style.boxShadow = '0 0 0 3px rgba(197,152,91,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(33,34,34,0.09)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              {errorMsg && <p style={{ color: '#e05555', fontSize: '0.82rem' }}>{errorMsg}</p>}
              <button
                onClick={handleSubmit}
                disabled={status === 'sending'}
                style={{
                  width: '100%', padding: '1.1rem', background: '#c5985b', color: '#fff', border: 'none',
                  fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em',
                  textTransform: 'uppercase', cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                  opacity: status === 'sending' ? 0.65 : 1, transition: 'all 0.3s',
                }}
                onMouseEnter={e => { if (status !== 'sending') (e.currentTarget.style.background = '#8f6b36') }}
                onMouseLeave={e => { e.currentTarget.style.background = '#c5985b' }}
              >
                {status === 'sending' ? 'Envoi en cours…' : 'Envoyer ma demande de réservation'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
