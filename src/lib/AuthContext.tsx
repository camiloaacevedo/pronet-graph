// src/lib/AuthContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface Usuario {
  id: string
  nombre: string
  email: string
  cargo: string
}

interface AuthContextType {
  usuario: Usuario | null
  login: (u: Usuario) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const login = (u: Usuario) => setUsuario(u)
  const logout = () => setUsuario(null)
  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)