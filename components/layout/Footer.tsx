import Link from 'next/link'

const hebergements = ['Chambre Standard', 'Chambre Supérieure', 'Chambre Twin', 'Chambre Premium', 'Suite', 'Appartement 3 pièces', 'Appartement 4 pièces']
const experiences  = [
  { href: '/#restaurant', label: 'Restaurant & lounge' },
  { href: '/#spa',        label: 'Spa & Bien-être' },
  { href: '/#evenements', label: "Salles d'événements" },
  { href: '/#services',   label: 'Conciergerie' },
]
const infos = [
  { href: '/#reservation', label: 'Réservation' },
  { href: '#',             label: 'Politique annulation' },
  { href: '#',             label: 'Accès & Transports' },
  { href: '#',             label: 'Contact' },
]

export default function Footer() {
  return (
    <footer style={{ background: '#212222', borderTop: '3px solid #c5985b' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2.2fr 1fr 1fr 1fr',
          gap: '3rem',
          padding: '4rem 3.5rem',
        }}
        className="max-md:grid-cols-2 max-sm:grid-cols-1"
      >
        {/* Brand */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://sra-hotel.com/media/logo-SweetRestAparthotel_color.png"
            alt="Sweet Rest Aparthotel"
            style={{ maxWidth: '180px', marginBottom: '1rem' }}
          />
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: 250, marginBottom: '1.4rem' }}>
            {"L'hospitalité ivoirienne dans toute sa splendeur, au cœur du quartier résidentiel de Cocody, Abidjan."}
          </p>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            {['f', 'ig', 'wa', 'in'].map(s => (
              <a
                key={s}
                href="#"
                style={{
                  width: 34, height: 34, border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: '#bbbcc1', transition: 'all 0.3s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#c5985b'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#c5985b'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLAnchorElement).style.color = '#bbbcc1' }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Hébergements */}
        <div>
          <p style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1.2rem' }}>
            Hébergements
          </p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {hebergements.map(h => (
              <li key={h}>
                <Link href="/#hebergements" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', transition: 'color 0.3s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ddb87c')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                >{h}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Expériences */}
        <div>
          <p style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1.2rem' }}>
            Expériences
          </p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {experiences.map(e => (
              <li key={e.href}>
                <Link href={e.href} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', transition: 'color 0.3s' }}
                  onMouseEnter={ev => (ev.currentTarget.style.color = '#ddb87c')}
                  onMouseLeave={ev => (ev.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                >{e.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Informations */}
        <div>
          <p style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1.2rem' }}>
            Informations
          </p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {infos.map(i => (
              <li key={i.label}>
                <Link href={i.href} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', transition: 'color 0.3s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ddb87c')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                >{i.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{
        padding: '1.2rem 3.5rem',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)',
      }}
        className="max-sm:flex-col max-sm:gap-1 max-sm:text-center"
      >
        <span>© 2026 Sweet Rest Aparthotel · Cocody, Abidjan, Côte d&apos;Ivoire. Tous droits réservés.</span>
        <span>
          <Link href="#" style={{ color: '#c5985b', opacity: 0.8 }}>Mentions légales</Link>
          {' · '}
          <Link href="#" style={{ color: '#c5985b', opacity: 0.8 }}>Confidentialité</Link>
        </span>
      </div>
    </footer>
  )
}
