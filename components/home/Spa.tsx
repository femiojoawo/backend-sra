const services = [
  { name: 'Massage Traditionnel', desc: 'Techniques africaines ancestrales pour un relâchement profond des tensions musculaires.' },
  { name: 'Soin du Visage',       desc: 'Formule hydratante aux huiles naturelles — beurre de karité, huile d\'argan pressée à froid.' },
  { name: 'Hammam & Gommage',    desc: 'Rituel de purification complet dans notre bain de vapeur privé, gommage au savon noir.' },
  { name: 'Piscine & Jacuzzi',   desc: 'Piscine extérieure chauffée en accès libre pour les résidents. Jacuzzi privatisable.' },
  { name: 'Yoga & Sport',        desc: 'Séances du matin animées par nos instructeurs certifiés, plein air ou en salle.' },
  { name: 'Beauté & Coiffure',   desc: 'Salon complet : manucure, pédicure, coiffure, maquillage pour toutes occasions.' },
]

export default function Spa() {
  return (
    <section id="spa" style={{ paddingTop: 0, paddingBottom: '7rem' }}>
      {/* Full-width hero image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://sra-hotel.com/media/img_8.jpg"
        alt="Spa & Bien-être"
        className="reveal"
        style={{ width: '100%', height: 460, objectFit: 'cover', objectPosition: 'center 60%', display: 'block', borderRadius: 0 }}
        loading="lazy"
      />

      <div style={{ padding: '6rem 3.5rem 0' }} className="max-md:px-8 max-sm:px-6">
        {/* Header */}
        <div className="reveal" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1.2rem' }}>
            <span style={{ width: 28, height: 1, background: '#c5985b', display: 'inline-block' }} />
            Spa & Bien-être
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, lineHeight: 1.15, color: '#212222' }}>
            Retrouvez votre<br /><em style={{ fontStyle: 'italic', color: '#c5985b' }}>équilibre</em> intérieur
          </h2>
          <div style={{ width: 40, height: '1.5px', background: '#c5985b', margin: '1.6rem 0 0' }} />
          <p style={{ fontSize: '1rem', lineHeight: 1.95, color: '#6b6c6c', maxWidth: 540, marginTop: '1rem' }}>
            Notre espace bien-être marie les traditions africaines aux soins modernes pour restaurer corps et esprit dans un cadre d&apos;exception.
          </p>
        </div>

        {/* Grid */}
        <div
          className="reveal"
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px', background: 'rgba(33,34,34,0.09)', marginTop: '3.5rem',
          }}
        >
          {services.map(s => (
            <div
              key={s.name}
              style={{
                background: '#fff', padding: '2.4rem 2rem', textAlign: 'center',
                borderTop: '2px solid transparent', transition: 'border-color 0.3s, background 0.3s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderTopColor = '#c5985b'; (e.currentTarget as HTMLDivElement).style.background = '#f7f5f1' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderTopColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.background = '#fff' }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '50%', background: '#f7f5f1',
                border: '1px solid rgba(197,152,91,0.28)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 1.2rem',
              }}>
                <span style={{ fontSize: '1.3rem' }}>✦</span>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#212222', marginBottom: '0.5rem' }}>{s.name}</div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#6b6c6c' }}>{s.desc}</p>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5985b', marginTop: '0.8rem' }}>Sur rendez-vous</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
