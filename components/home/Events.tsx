import Link from 'next/link'

export default function Events() {
  return (
    <section id="evenements" style={{ padding: '7rem 3.5rem', background: '#f7f5f1' }} className="max-md:px-8 max-sm:px-6">
      <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '4rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1.2rem' }}>
            <span style={{ width: 28, height: 1, background: '#c5985b', display: 'inline-block' }} />
            Salles & Événements
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, lineHeight: 1.15, color: '#212222' }}>
            Vos moments <em style={{ fontStyle: 'italic', color: '#c5985b' }}>inoubliables</em>
          </h2>
          <div style={{ width: 40, height: '1.5px', background: '#c5985b', margin: '1.6rem 0 0' }} />
          <p style={{ fontSize: '1rem', lineHeight: 1.95, color: '#6b6c6c', maxWidth: 540, marginTop: '1rem' }}>
            Mariages, conférences, lancements produits ou dîners privés — nos espaces modulables accueillent tous vos projets avec élégance.
          </p>
        </div>
      </div>

      {/* Event grid */}
      <div
        className="reveal"
        style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gridTemplateRows: 'auto auto', gap: '1.2rem' }}
      >
        {/* Tall left */}
        <div style={{ position: 'relative', overflow: 'hidden', background: '#212222', gridRow: 'span 2', cursor: 'pointer' }}
          onMouseEnter={e => { const img = e.currentTarget.querySelector('img') as HTMLImageElement; img.style.transform = 'scale(1.05)'; img.style.opacity = '0.85' }}
          onMouseLeave={e => { const img = e.currentTarget.querySelector('img') as HTMLImageElement; img.style.transform = 'scale(1)'; img.style.opacity = '1' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://sra-hotel.com/media/img_11.jpg" alt="Grand Ballroom" loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s, opacity 0.5s', borderRadius: 0 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.6rem 1.8rem', backgroundImage: 'linear-gradient(to top, rgba(33,34,34,0.9) 0%, transparent 100%)' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#ddb87c', marginBottom: '0.4rem' }}>Réceptions & Mariages</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#fff', marginBottom: '0.3rem' }}>Grand Ballroom</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>Jusqu&apos;à 300 invités</div>
          </div>
        </div>

        {/* Top right */}
        <div style={{ position: 'relative', overflow: 'hidden', background: '#212222', cursor: 'pointer' }}
          onMouseEnter={e => { const img = e.currentTarget.querySelector('img') as HTMLImageElement; img.style.transform = 'scale(1.05)'; img.style.opacity = '0.85' }}
          onMouseLeave={e => { const img = e.currentTarget.querySelector('img') as HTMLImageElement; img.style.transform = 'scale(1)'; img.style.opacity = '1' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://sra-hotel.com/media/img_9.jpg" alt="Salle de conférence" loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s, opacity 0.5s', borderRadius: 0 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.6rem 1.8rem', backgroundImage: 'linear-gradient(to top, rgba(33,34,34,0.9) 0%, transparent 100%)' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#ddb87c', marginBottom: '0.4rem' }}>Conférences & Séminaires</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#fff' }}>Salle Baobab</div>
          </div>
        </div>

        {/* Bottom right */}
        <div style={{ position: 'relative', overflow: 'hidden', background: '#212222', cursor: 'pointer' }}
          onMouseEnter={e => { const img = e.currentTarget.querySelector('img') as HTMLImageElement; img.style.transform = 'scale(1.05)'; img.style.opacity = '0.85' }}
          onMouseLeave={e => { const img = e.currentTarget.querySelector('img') as HTMLImageElement; img.style.transform = 'scale(1)'; img.style.opacity = '1' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://sra-hotel.com/media/img_10.jpg" alt="Terrasse extérieure" loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s, opacity 0.5s', borderRadius: 0 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.6rem 1.8rem', backgroundImage: 'linear-gradient(to top, rgba(33,34,34,0.9) 0%, transparent 100%)' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#ddb87c', marginBottom: '0.4rem' }}>Dîners & Cocktails</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#fff' }}>Terrasse Panoramique</div>
          </div>
        </div>
      </div>

      <div className="reveal" style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <Link
          href="/#reservation"
          style={{
            display: 'inline-block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em',
            textTransform: 'uppercase', padding: '0.9rem 2.2rem', background: 'transparent',
            color: '#c5985b', border: '1px solid #c5985b', transition: 'all 0.3s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#c5985b'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#c5985b'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
        >
          Demander un devis événement
        </Link>
      </div>
    </section>
  )
}
