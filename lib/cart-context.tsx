'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { MockRoom } from '@/lib/mock-rooms'

// ── Types aligned with RESERVATION_LIGNE schema ────────────────────────────
export interface CartLine {
  /** Unique client-side key for this line */
  key: string
  /** FK → TYPE_CHAMBRE.id  (= MockRoom.id in V1 mock) */
  room_id: number
  /** Snapshot of the room at add-to-cart time */
  room_nom: string
  room_type: string
  room_photo: string
  /** RESERVATION_LIGNE fields */
  check_in: string
  check_out: string
  adultes: number
  enfants: number
  /** Copie du prix au moment de l'ajout (historisation) */
  prix_unitaire_nuit: number
  /** (check_out - check_in) * prix_unitaire_nuit */
  prix_total_ligne: number
  /** options_souscrites JSON */
  options: { petit_dejeuner?: boolean; transfert?: boolean; spa?: boolean }
}

interface CartContextValue {
  lines: CartLine[]
  count: number
  total: number
  addLine: (room: MockRoom, check_in: string, check_out: string, adultes: number, enfants: number, options?: CartLine['options']) => void
  removeLine: (key: string) => void
  updateOptions: (key: string, options: CartLine['options']) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue>({
  lines: [], count: 0, total: 0,
  addLine: () => {},
  removeLine: () => {},
  updateOptions: () => {},
  clearCart: () => {},
})

const STORAGE_KEY = 'sra_cart_v2'

function diffNights(a: string, b: string) {
  if (!a || !b) return 0
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])

  // Rehydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setLines(JSON.parse(stored))
    } catch {}
  }, [])

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {}
  }, [lines])

  const addLine = useCallback((
    room: MockRoom,
    check_in: string,
    check_out: string,
    adultes: number,
    enfants: number,
    options: CartLine['options'] = {},
  ) => {
    const nights = diffNights(check_in, check_out)
    const prix_total_ligne = room.prix_nuit * Math.max(nights, 1)
    const key = `${room.id}-${check_in}-${check_out}-${Date.now()}`
    const line: CartLine = {
      key,
      room_id: room.id,
      room_nom: room.nom,
      room_type: room.type_hebergement,
      room_photo: room.photos[0] ?? '',
      check_in,
      check_out,
      adultes,
      enfants,
      prix_unitaire_nuit: room.prix_nuit,
      prix_total_ligne,
      options,
    }
    setLines(prev => [...prev, line])
  }, [])

  const removeLine = useCallback((key: string) => {
    setLines(prev => prev.filter(l => l.key !== key))
  }, [])

  const updateOptions = useCallback((key: string, options: CartLine['options']) => {
    setLines(prev => prev.map(l => l.key === key ? { ...l, options } : l))
  }, [])

  const clearCart = useCallback(() => {
    setLines([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  const count = lines.length
  const total = lines.reduce((s, l) => s + l.prix_total_ligne, 0)

  return (
    <CartContext.Provider value={{ lines, count, total, addLine, removeLine, updateOptions, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
