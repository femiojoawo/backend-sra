import Link from 'next/link'

const menu = [
  { name: 'Thiéboudienne Royal', sub: 'Riz au poisson, légumes de saison, sauce tomate maison' },
  { name: 'Filet de Capitaine Grillé', sub: "Attiéké frais, sauce claire, légumes du marché" },
  { name: 'Buffet du Matin', sub: 'Viennoiseries, fruits frais, jus naturels, œufs à la carte' },
  { name: 'Cocktail Gingembre & Citron', sub: 'Recette signature maison · version sans alcool disponible' },
]

export default function Restaurant() {
  return (
    <section id="restaurant" style={{ padding: '7rem 3.5rem', background: '#f7f5f1' }} className="max-md:px-8 max-sm:px-6">
      <div
        style={{ display: 'grid', gridTemplateColumns: '5fr 4fr', gap: '5rem', alignItems: 'center', marginTop: '0' }}
        className="max-md:grid-cols-1 max-md:gap-12"
      >
        {/* Image */}
        <div className="reveal" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', height: 580, overflow: 'hidden' }} className="max-md:h-96">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://sra-hotel.com/media/img_2.jpg" alt="Restaurant & Lounge" loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
          </div>
          <div style={{
            position: 'absolute', bottom: '-1.5rem', right: '-1.5rem',
            width: '60%', height: '50%', border: '3px solid #c5985b', pointerEvents: 'none', zIndex: 2,
          }} />
        </div>

        {/* Text */}
        <div className="reveal">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1.2rem' }}>
            <span style={{ width: 28, height: 1, background: '#c5985b', display: 'inline-block' }} />
            Restaurant & lounge
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, lineHeight: 1.15, color: '#212222' }}>
            La saveur<br /><em style={{ fontStyle: 'italic', color: '#c5985b' }}>ivoirienne</em> au sommet
          </h2>
          <div style={{ width: 40, height: '1.5px', background: '#c5985b', margin: '1.6rem 0' }} />
          <p style={{ fontSize: '1rem', lineHeight: 1.95, color: '#6b6c6c', maxWidth: 540 }}>
            Notre chef propose une cuisine fusion mêlant les saveurs ivoiriennes aux techniques gastronomiques internationales. Ouvert 7j/7 de 7h à 23h.
          </p>

          <div style={{ marginTop: '2rem' }}>
            {menu.map((item, i) => (
              <div key={item.name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '1.1rem 0', borderBottom: i < menu.length - 1 ? '1px solid rgba(33,34,34,0.09)' : 'none',
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#212222', marginBottom: '0.25rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b6c6c' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/#reservation"
            style={{
              display: 'inline-block', marginTop: '2.2rem', fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '0.9rem 2.2rem', background: '#212222', color: '#fff', transition: 'all 0.3s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#3a3b3b'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#212222'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
          >
            Réserver une table
          </Link>
        </div>
      </div>
    </section>
  )
}
