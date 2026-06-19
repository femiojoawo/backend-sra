import Link from 'next/link'

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        height: '100vh', minHeight: 680, position: 'relative',
        overflow: 'hidden', display: 'flex', alignItems: 'flex-end',
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(155deg, rgba(33,34,34,0.6) 0%, rgba(33,34,34,0.3) 45%, rgba(33,34,34,1) 100%), url('https://sra-hotel.com/media/image-hero-bg.jpg')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative', zIndex: 2, padding: '0 3.5rem 6rem',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          alignItems: 'flex-end', gap: '3rem', width: '100%',
        }}
        className="max-md:grid-cols-1 max-md:px-8 max-sm:px-6 max-sm:pb-18"
      >
        <div>
          <p
            style={{
              fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.45em',
              textTransform: 'uppercase', color: '#ddb87c', marginBottom: '1.4rem',
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              animation: 'fadeUp 0.9s 0.2s both',
            }}
          >
            <span style={{ width: 32, height: 1, background: '#ddb87c', display: 'inline-block' }} />
            Cocody · Abidjan · Côte d&apos;Ivoire
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(3.2rem, 7vw, 6.2rem)',
              fontWeight: 400, lineHeight: 1.08, color: '#fff',
              animation: 'fadeUp 0.9s 0.4s both',
            }}
          >
            {"L'art de vivre"}
            <br />
            à <em style={{ fontStyle: 'italic', color: '#ddb87c' }}>Abidjan</em>
          </h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.4rem', flexWrap: 'wrap', animation: 'fadeUp 0.9s 0.7s both' }}>
            <Link
              href="/#reservation"
              style={{
                display: 'inline-block', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
                padding: '0.9rem 2.2rem', background: '#c5985b', color: '#fff',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#8f6b36'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#c5985b'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
            >
              Réserver maintenant
            </Link>
            <Link
              href="/#hebergements"
              style={{
                display: 'inline-block', fontSize: '0.72rem', fontWeight: 600,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                padding: '0.9rem 2.2rem', background: 'transparent', color: '#fff',
                border: '1px solid rgba(255,255,255,0.5)', transition: 'all 0.3s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
            >
              Découvrir
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex', flexDirection: 'column', gap: '1.4rem', alignSelf: 'flex-end',
            animation: 'fadeUp 0.9s 0.6s both',
          }}
          className="max-md:flex-row max-md:flex-wrap"
        >
          {[
            { n: '3',   l: "Types d'hébergement\nAppartements · Suites · Chambres" },
            { n: '24/7', l: "Service de conciergerie\nà votre disposition" },
          ].map(s => (
            <div
              key={s.n}
              style={{
                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.14)', padding: '1.1rem 1.4rem',
              }}
              className="max-md:flex-1"
            >
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 500, color: '#ddb87c', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, marginTop: '0.25rem', whiteSpace: 'pre-line' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div
        style={{
          position: 'absolute', bottom: '2.2rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          animation: 'fadeUp 1s 1s both',
        }}
      >
        <div style={{ width: 1, height: 36, background: '#ddb87c', animation: 'bar 1.6s infinite' }} />
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#ddb87c' }}>Défiler</span>
      </div>
    </section>
  )
}
