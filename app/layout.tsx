import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Raleway } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import './globals.css'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sweet Rest Aparthotel — Cocody, Abidjan',
  description:
    "L'art de vivre à Abidjan. Appartements, suites et chambres élégantes au cœur de Cocody. Réservez votre séjour en ligne.",
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#c5985b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${raleway.variable} ${playfair.variable} bg-[#f7f5f1]`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
