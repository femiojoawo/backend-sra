import Link from 'next/link'

interface Room {
  id: number
  img: string
  alt: string
  cat: string
  name: string
  desc: string
  amenities: string[]
  price: string
  badge?: string
}

const rooms: Room[] = [
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', alt: 'Chambre Standard',
    cat: 'Chambre · 1 grand lit', name: 'Standards',
    desc: "Fonctionnelle et soignée, elle offre tout le nécessaire pour un séjour agréable : literie confortable, salle de bain moderne et connexion Wi-Fi haut débit.",
    amenities: ['Queen size', '2 pers.', '30 m²', 'Wi-fi', 'Réfrigérateur', 'TV HD', 'Coffre fort', 'Bureau'],
    price: '60 000',
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80', alt: 'Chambre Supérieure',
    cat: 'Chambre · 1 grand lit', name: 'Supérieurs',
    desc: "Un niveau au-dessus. Spacieuse et lumineuse, la Supérieure offre une décoration plus raffinée, un bureau de travail et une literie haut de gamme.",
    amenities: ['Queen size', '2 pers.', '35 m²', 'Wi-fi', 'Réfrigérateur', 'TV HD', 'Coffre fort', 'Bureau'],
    price: '80 000',
  },
  {
    id: 3,
    img: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80', alt: 'Chambre Twin',
    cat: 'Chambre · 2 lits 1 place', name: 'Twins',
    desc: "Deux lits individuels, une même qualité d'accueil. Idéale pour les collègues en déplacement ou les amis voyageant ensemble.",
    amenities: ['2 lits simples', '2 pers.', '30 m²', 'Wi-fi', 'Réfrigérateur', 'TV HD', 'Coffre fort', 'Bureau'],
    price: '80 000',
  },
  {
    id: 4,
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', alt: 'Chambre Premium',
    cat: 'Chambre · 1 lit king-size', name: 'Premium',
    desc: "Le meilleur des chambres. Lit king-size, mobilier sélectionné, salle de bain avec baignoire et douche séparée.",
    amenities: ['Lit King size', '2 pers.', '40 m²', 'Wi-fi', 'TV OLED 55"', 'Produits Hermès', 'Baignoire'],
    price: '120 000',
    badge: 'Best seller',
  },
  {
    id: 5,
    img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80', alt: 'Suite',
    cat: 'Suite · Salon séparé', name: 'Suites',
    desc: "La Suite dispose d'un salon privé, d'une chambre spacieuse avec lit king-size et d'une salle de bain de luxe.",
    amenities: ['Lit King size', '2 pers.', '85 m²', 'Salon privé', 'Terrasse', 'Majordome'],
    price: '130 000',
  },
  {
    id: 6,
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', alt: 'Appartement 3 pièces',
    cat: 'Appartement · 3 pièces', name: 'Appartement 3 pièces',
    desc: "Salon, cuisine équipée et deux chambres indépendantes. Conçu pour les familles ou les séjours prolongés.",
    amenities: ['1 King + 1 Queen', '4 pers.', '130 m²', 'Cuisine équipée', 'Wi-fi', 'TV HD'],
    price: '180 000',
  },
  {
    id: 7,
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', alt: 'Appartement 4 pièces',
    cat: 'Appartement · 4 pièces', name: 'Appart 4 pièces',
    desc: "Trois chambres, un salon généreux, une cuisine entièrement équipée et deux salles de bain.",
    amenities: ['1 King + 2 Queen', '6 pers.', '160 m²', 'Cuisine pro', 'Parking', '2 salles de bain'],
    price: '180 000',
  },
]

function RoomCard({ room }: { room: Room }) {
  return (
    <div
      style={{
        background: '#fff', border: '1px solid rgba(33,34,34,0.09)', overflow: 'hidden',
        transition: 'box-shadow 0.4s, transform 0.35s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px rgba(33,34,34,0.14)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
    >
      {/* Image */}
      <div style={{ height: 240, overflow: 'hidden', position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={room.img} alt={room.alt} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1)', borderRadius: 0 }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.07)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
        {room.badge && (
          <div style={{
            position: 'absolute', top: '1rem', left: '1rem', background: '#c5985b', color: '#fff',
            fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
            padding: '0.35rem 0.8rem',
          }}>
            {room.badge}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '1.6rem 1.8rem 2rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '0.5rem' }}>{room.cat}</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: '#212222', marginBottom: '0.7rem' }}>{room.name}</div>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.85, color: '#6b6c6c', marginBottom: '1.2rem' }}>{room.desc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.4rem' }}>
          {room.amenities.map(a => (
            <span key={a} style={{ fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#212222', border: '1px solid rgba(33,34,34,0.09)', padding: '0.25rem 0.65rem' }}>{a}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.2rem', borderTop: '1px solid rgba(33,34,34,0.09)' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#c5985b' }}>
            A partir {room.price} <sub style={{ fontSize: '0.7rem', fontFamily: 'var(--font-sans)', color: '#6b6c6c' }}>FCFA / nuit</sub>
          </div>
          <Link
            href={`/chambres/${room.id}`}
            style={{
              fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '0.65rem 1.4rem', background: 'transparent', color: '#c5985b',
              border: '1px solid #c5985b', transition: 'all 0.3s', cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#c5985b'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#c5985b'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
          >
            Voir la fiche
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Rooms() {
  return (
    <section id="hebergements" style={{ padding: '7rem 3.5rem' }} className="max-md:px-8 max-sm:px-6">
      <div className="reveal">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c5985b', marginBottom: '1.2rem' }}>
          <span style={{ width: 28, height: 1, background: '#c5985b', display: 'inline-block' }} />
          Hébergements
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 400, lineHeight: 1.15, color: '#212222' }}>
          Un espace pensé pour<br />chaque <em style={{ fontStyle: 'italic', color: '#c5985b' }}>séjour</em>
        </h2>
        <div style={{ width: 40, height: '1.5px', background: '#c5985b', margin: '1.6rem 0' }} />
        <p style={{ fontSize: '1rem', lineHeight: 1.95, color: '#6b6c6c', maxWidth: 540, marginTop: '1rem' }}>
          Appartements entièrement équipés, suites ou chambres élégantes — chaque espace a été conçu pour allier confort, intimité et raffinement au cœur de Cocody, Abidjan.
        </p>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '4rem' }}
        className="max-md:grid-cols-2 max-sm:grid-cols-1"
      >
        {rooms.map(r => <RoomCard key={r.name} room={r} />)}
      </div>
    </section>
  )
}
