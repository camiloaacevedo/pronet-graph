'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Usuario {
  id: string
  nombre: string
  email: string
  cargo: string
  foto?: string
}

interface AuthContextType {
  usuario: Usuario | null
  login: (u: Usuario) => void
  logout: () => void
  updateFoto: (foto: string) => void
}

const AuthContext = createContext<AuthContextType>({
  usuario: null, login: () => {}, logout: () => {}, updateFoto: () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const guardado = localStorage.getItem('pronet_usuario')
    if (guardado) setUsuario(JSON.parse(guardado))
    setCargando(false)
  }, [])

  const login = (u: Usuario) => {
    setUsuario(u)
    localStorage.setItem('pronet_usuario', JSON.stringify(u))
  }

  const logout = () => {
    setUsuario(null)
    localStorage.removeItem('pronet_usuario')
  }

  const updateFoto = (foto: string) => {
    if (!usuario) return
    const actualizado = { ...usuario, foto }
    setUsuario(actualizado)
    localStorage.setItem('pronet_usuario', JSON.stringify(actualizado))
  }

  if (cargando) return null

  return (
    <AuthContext.Provider value={{ usuario, login, logout, updateFoto }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
