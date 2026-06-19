'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const hebergements = [
  '', 'Chambre Standard', 'Chambre Supérieure', 'Chambre Twin',
  'Chambre Premium', 'Suite', 'Appartement 3 Pièces', 'Appartement 4 Pièces',
]

export default function BookingStrip() {
  const router = useRouter()
  const [arrivee, setArrivee]     = useState('')
  const [depart, setDepart]       = useState('')
  const [adultes, setAdultes]     = useState('1')
  const [enfants, setEnfants]     = useState('0')
  const [type, setType]           = useState('')
  const [error, setError]         = useState('')

  function handleCheck() {
    if (!arrivee || !depart) { setError('Veuillez renseigner vos dates.'); return }
    if (new Date(depart) <= new Date(arrivee)) { setError("La date de départ doit être après l'arrivée."); return }
    setError('')
    const params = new URLSearchParams({ arrivee, depart, adultes, enfants, ...(type ? { type } : {}) })
    router.push(`/recherche?${params.toString()}`)
  }

  const today = new Date().toISOString().split('T')[0]

  const fieldStyle: React.CSSProperties = {
    padding: '1.4rem 1.6rem', borderRight: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', flexDirection: 'column', gap: '0.4rem',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.22em',
    textTransform: 'uppercase', color: '#c5985b',
  }
  const inputStyle: React.CSSProperties = {
    background: 'transparent', border: 'none', fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem', fontWeight: 300, color: 'rgba(255,255,255,0.85)',
    outline: 'none', width: '100%', colorScheme: 'dark' as unknown as string,
  }

  return (
    <div>
      <div
        style={{
          background: '#212222', padding: '0 3.5rem',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto',
        }}
        className="max-md:grid-cols-2 max-md:px-8 max-sm:grid-cols-2 max-sm:px-6"
      >
        <div style={fieldStyle}>
          <span style={labelStyle}>Arrivée</span>
          <input type="date" value={arrivee} min={today} onChange={e => setArrivee(e.target.value)} style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <span style={labelStyle}>Départ</span>
          <input type="date" value={depart} min={arrivee || today} onChange={e => setDepart(e.target.value)} style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <span style={labelStyle}>Adultes</span>
          <select value={adultes} onChange={e => setAdultes(e.target.value)} style={{ ...inputStyle }}>
            {['1', '2', '3', '4', '5', '6'].map(v => (
              <option key={v} value={v} style={{ background: '#212222' }}>{v} adulte{Number(v) > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        <div style={fieldStyle}>
          <span style={labelStyle}>Enfants</span>
          <select value={enfants} onChange={e => setEnfants(e.target.value)} style={{ ...inputStyle }}>
            {['0', '1', '2', '3', '4'].map(v => (
              <option key={v} value={v} style={{ background: '#212222' }}>{v} enfant{Number(v) > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        <div style={fieldStyle}>
          <span style={labelStyle}>Type (optionnel)</span>
          <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle }}>
            {hebergements.map((h, i) => (
              <option key={i} value={h} style={{ background: '#212222' }}>{h || 'Tous les hébergements'}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCheck}
          style={{
            display: 'flex', alignItems: 'center', padding: '0 2rem',
            background: '#c5985b', fontFamily: 'var(--font-sans)', fontSize: '0.7rem',
            fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#fff', cursor: 'pointer', border: 'none', transition: 'background 0.3s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#8f6b36')}
          onMouseLeave={e => (e.currentTarget.style.background = '#c5985b')}
          className="max-sm:col-span-2 max-sm:justify-center max-sm:py-4"
        >
          Vérifier les disponibilités →
        </button>
      </div>
      {error && (
        <div style={{ background: '#212222', padding: '0.5rem 3.5rem 1rem', fontSize: '0.8rem', color: '#e05555' }}>
          {error}
        </div>
      )}
    </div>
  )
}
