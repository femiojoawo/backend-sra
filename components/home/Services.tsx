const services = [
  { n: '01', name: 'Transfert Aéroport',  desc: "Navette privée depuis l'aéroport Félix-Houphouët-Boigny, disponible 24h/24." },
  { n: '02', name: 'Room Service 24h',    desc: 'Notre cuisine est disponible à toute heure pour satisfaire votre appétit.' },
  { n: '03', name: 'Business Center',     desc: 'Espace de travail : impression, visioconférence, connexion fibre optique.' },
  { n: '04', name: 'Conciergerie',        desc: 'Réservations restaurants, billets, excursions — notre équipe gère tout.' },
]

export default function Services() {
  return (
    <section id="services" style={{ padding: '7rem 3.5rem' }} className="max-md:px-8 max-sm:px-6">
      <div
        style={{ display: 'grid', gridTemplateColumns: '4fr 5fr', gap: '5rem', alignItems: 'start' }}
        className="max-md:grid-cols-1 max-md:gap-12"
      >
        {/* Image */}
        <div className="reveal" style={{ position: 'relative' }}>
          <div style={{ height: 520, overflow: 'hidden' }} className="max-md:h-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://sra-hotel.com/media/img_1.jpg" alt="Conciergerie Sweet Rest" loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} />
          </div>
          <div style={{
            position: 'absolute', bottom: '2rem', left: 0, background: '#c5985b', color: '#fff',
            fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
            padding: '0.6rem 1.2rem',
          }}>
            Service 24h/24 · 7j/7
          </div>
        </div>

        {/* Text */}
        <div className="reveal">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1.2rem' }}>
            <span style={{ width: 28, height: 1, background: '#c5985b', display: 'inline-block' }} />
            Conciergerie & Services
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, lineHeight: 1.15, color: '#212222' }}>
            Tout ce dont vous avez <em style={{ fontStyle: 'italic', color: '#c5985b' }}>besoin</em>
          </h2>
          <div style={{ width: 40, height: '1.5px', background: '#c5985b', margin: '1.6rem 0' }} />
          <p style={{ fontSize: '1rem', lineHeight: 1.95, color: '#6b6c6c', maxWidth: 540 }}>
            Notre équipe dédiée est disponible à toute heure pour rendre votre séjour parfaitement fluide, qu&apos;il soit professionnel ou touristique.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '2.5rem' }}>
            {services.map((s, i) => (
              <div key={s.n} style={{
                display: 'grid', gridTemplateColumns: '3rem 1fr', gap: '1.2rem', alignItems: 'start',
                padding: '1.4rem 0', borderBottom: i < services.length - 1 ? '1px solid rgba(33,34,34,0.09)' : 'none',
              }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'rgba(197,152,91,0.3)', lineHeight: 1, paddingTop: '0.2rem' }}>{s.n}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#212222', marginBottom: '0.3rem' }}>{s.name}</div>
                  <p style={{ fontSize: '0.9rem', color: '#6b6c6c', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
