'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, LogOut, Menu, X, CalendarDays, ShoppingCart } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'

const navLinks = [
  { href: '/#hebergements', label: 'Hébergements' },
  { href: '/recherche',     label: 'Disponibilités' },
  { href: '/#restaurant',   label: 'Restaurant' },
  { href: '/#spa',          label: 'Spa' },
  { href: '/#evenements',   label: 'Événements' },
  { href: '/#services',     label: 'Services' },
]

export default function Navbar() {
  const [solid, setSolid]       = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout }        = useAuth()
  const { count: cartCount }    = useCart()
  const pathname                = usePathname()
  const isHome                = pathname === '/'

  useEffect(() => {
    function onScroll() {
      setSolid(window.scrollY > 60)
    }
    if (!isHome) {
      setSolid(true)
      return
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  const linkClass = solid
    ? 'text-[#3a3b3b] hover:text-[#c5985b]'
    : 'text-white/82 hover:text-[#c5985b]'

  const logoSrc = solid
    ? 'https://sra-hotel.com/media/logo-SweetRestAparthotel_color.png'
    : 'https://sra-hotel.com/media/logo-SweetRestAparthotel.png'

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: solid ? '1rem 3.5rem' : '1.6rem 3.5rem',
          background: solid ? 'rgba(255,255,255,0.97)' : 'rgba(0,0,0,0.10)',
          backdropFilter: 'blur(20px)',
          boxShadow: solid ? '0 1px 0 rgba(33,34,34,0.09)' : 'none',
          transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="Sweet Rest Aparthotel" style={{ height: 40, transition: 'opacity 0.3s' }} />
        </Link>

        {/* Desktop nav links */}
        <ul style={{ display: 'flex', gap: '2.4rem', listStyle: 'none', margin: 0, padding: 0 }}
            className="hidden md:flex">
          {navLinks.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                style={{
                  fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.18em',
                  textTransform: 'uppercase', transition: 'color 0.3s',
                }}
                className={linkClass}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Cart icon */}
          <Link
            href="/panier"
            aria-label={`Panier — ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
            style={{
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36,
              color: solid ? '#3a3b3b' : 'rgba(255,255,255,0.82)',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c5985b')}
            onMouseLeave={e => (e.currentTarget.style.color = solid ? '#3a3b3b' : 'rgba(255,255,255,0.82)')}
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 1, right: 1,
                minWidth: 16, height: 16, borderRadius: '50%',
                background: '#c5985b', color: '#fff',
                fontSize: '0.58rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
          {/* Auth actions */}
          {user ? (
            <>
              <Link
                href="/mes-reservations"
                style={{
                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em',
                  textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.55rem 1.2rem', border: '1px solid rgba(197,152,91,0.6)',
                  color: '#c5985b', transition: 'all 0.3s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#c5985b'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#c5985b' }}
              >
                <CalendarDays size={13} />
                Mes réservations
              </Link>
              <Link
                href="/profil"
                style={{
                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em',
                  textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem',
                  color: solid ? '#3a3b3b' : 'rgba(255,255,255,0.82)', transition: 'color 0.3s',
                }}
                className="hover:!text-[#c5985b]"
              >
                <User size={13} />
                {user.prenom}
              </Link>
              <button
                onClick={logout}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 500,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: solid ? '#3a3b3b' : 'rgba(255,255,255,0.82)', transition: 'color 0.3s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c5985b')}
                onMouseLeave={e => (e.currentTarget.style.color = solid ? '#3a3b3b' : 'rgba(255,255,255,0.82)')}
              >
                <LogOut size={13} />
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                style={{
                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em',
                  textTransform: 'uppercase', transition: 'color 0.3s',
                }}
                className={linkClass}
              >
                Connexion
              </Link>
              <Link
                href="/recherche"
                style={{
                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: '#c5985b',
                  border: '1px solid rgba(197,152,91,0.6)', padding: '0.55rem 1.4rem',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#c5985b'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#c5985b' }}
              >
                Réserver
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: solid ? '#212222' : '#fff' }}
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 199, background: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '2.2rem',
          }}
        >
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'absolute', top: '1.5rem', right: '1.8rem',
              background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer', color: '#212222',
            }}
            aria-label="Fermer le menu"
          >
            <X size={24} />
          </button>
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#212222',
                letterSpacing: '0.04em', transition: 'color 0.3s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c5985b')}
              onMouseLeave={e => (e.currentTarget.style.color = '#212222')}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ width: 40, height: 1, background: 'rgba(197,152,91,0.4)' }} />
          {user ? (
            <>
              <Link href="/profil"         onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#c5985b' }}>Mon profil</Link>
              <Link href="/mes-reservations" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#c5985b' }}>Mes réservations</Link>
              <button onClick={() => { logout(); setMenuOpen(false) }} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#6b6c6c', cursor: 'pointer' }}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/connexion"  onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#c5985b' }}>Connexion</Link>
              <Link href="/inscription" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#c5985b' }}>Créer un compte</Link>
            </>
          )}
        </div>
      )}
    </>
  )
}
