'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type UserRole = 'CLIENT' | 'RECEPTION' | 'MENAGE' | 'ADMIN'

export interface AuthUser {
  clientId: number
  token: string
  nom: string
  prenom: string
  email: string
  role: UserRole
}

interface AuthContextValue {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
})

const STORAGE_KEY = 'sra_auth'

// ── Mock credentials for demo ─────────────────────────────────────────────────
export const MOCK_CREDENTIALS: Array<{
  email: string
  password: string
  user: AuthUser
}> = [
  {
    email: 'admin@sra-hotel.com',
    password: 'Admin2024!',
    user: {
      clientId: 1,
      token: 'mock-admin-token',
      nom: 'Koné',
      prenom: 'Mamadou',
      email: 'admin@sra-hotel.com',
      role: 'ADMIN',
    },
  },
  {
    email: 'reception@sra-hotel.com',
    password: 'Reception2024!',
    user: {
      clientId: 2,
      token: 'mock-reception-token',
      nom: 'Diabaté',
      prenom: 'Fatou',
      email: 'reception@sra-hotel.com',
      role: 'RECEPTION',
    },
  },
  {
    email: 'menage@sra-hotel.com',
    password: 'Menage2024!',
    user: {
      clientId: 3,
      token: 'mock-menage-token',
      nom: 'Coulibaly',
      prenom: 'Aminata',
      email: 'menage@sra-hotel.com',
      role: 'MENAGE',
    },
  },
  {
    email: 'client@sra-hotel.com',
    password: 'Client2024!',
    user: {
      clientId: 4,
      token: 'mock-client-token',
      nom: 'Traoré',
      prenom: 'Ibrahima',
      email: 'client@sra-hotel.com',
      role: 'CLIENT',
    },
  },
]

export function mockLogin(email: string, password: string): AuthUser | null {
  const found = MOCK_CREDENTIALS.find(
    c => c.email === email && c.password === password,
  )
  return found ? found.user : null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {}
    setIsLoading(false)
  }, [])

  function loginFn(authUser: AuthUser) {
    setUser(authUser)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    } catch {}
  }

  function logout() {
    setUser(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, login: loginFn, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
