import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#f7f5f1',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://sra-hotel.com/media/logo-SweetRestAparthotel_color.png"
        alt="Sweet Rest Aparthotel"
        style={{ height: 48, marginBottom: '3rem', opacity: 0.7 }}
      />
      <div style={{
        fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.35em',
        textTransform: 'uppercase', color: '#c5985b', marginBottom: '1rem',
      }}>
        Erreur 404
      </div>
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 8vw, 5rem)',
        fontWeight: 400, color: '#212222', margin: 0, marginBottom: '1rem', lineHeight: 1.1,
      }}>
        Page introuvable
      </h1>
      <p style={{
        fontSize: '0.95rem', color: '#6b6c6c', lineHeight: 1.7,
        maxWidth: 440, marginBottom: '2.5rem',
      }}>
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
        Retournez à l&apos;accueil ou explorez nos hébergements.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/"
          style={{
            background: '#c5985b', color: '#fff', padding: '0.9rem 2rem',
            textDecoration: 'none', fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'opacity 0.2s',
          }}>
          Retour à l&apos;accueil
        </Link>
        <Link href="/recherche"
          style={{
            background: 'transparent', border: '1px solid rgba(33,34,34,0.2)',
            color: '#212222', padding: '0.9rem 2rem', textDecoration: 'none',
            fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
          Voir les chambres
        </Link>
      </div>
    </div>
  )
}
