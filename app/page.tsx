'use client'

import { useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/home/Hero'
import BookingStrip from '@/components/home/BookingStrip'
import Rooms from '@/components/home/Rooms'
import Restaurant from '@/components/home/Restaurant'
import Spa from '@/components/home/Spa'
import Events from '@/components/home/Events'
import Services from '@/components/home/Services'
import ReservationSection from '@/components/home/ReservationSection'

export default function HomePage() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.transitionDelay = `${(i % 3) * 0.12}s`
            entry.target.classList.add('in')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 },
    )
    document.querySelectorAll('.reveal').forEach(r => obs.observe(r))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BookingStrip />
        <Rooms />
        <Restaurant />
        <Spa />
        <Events />
        <Services />
        <ReservationSection />
      </main>
      <Footer />
    </>
  )
}
