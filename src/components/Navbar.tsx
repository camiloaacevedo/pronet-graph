'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'

const navItems = [
  { id: 'feed', label: 'Inicio', icon: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M23 9v2h-2v7a3 3 0 01-3 3h-4v-6h-4v6H6a3 3 0 01-3-3v-7H1V9l11-7 11 7z"/>
    </svg>
  )},
  { id: 'red', label: 'Mi red', icon: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
    </svg>
  )},
  { id: 'empleos', label: 'Empleos', icon: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-10-2h4v2h-4V5zm10 15H4V9h16v11z"/>
    </svg>
  )},
  { id: 'mensajes', label: 'Mensajes', icon: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/>
    </svg>
  )},
  { id: 'notificaciones', label: 'Notificaciones', icon: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11a6 6 0 00-5-5.92V4a1 1 0 00-2 0v1.08A6 6 0 007 11v5l-2 2v1h14v-1l-2-2z"/>
    </svg>
  )},
  { id: 'analisis', label: 'Análisis', icon: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
    </svg>
  )},
]

export default function Navbar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const { usuario, logout } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e0dfdc] shadow-sm">
      <div className="max-w-5xl mx-auto px-4 flex items-center h-14 gap-2">

        {/* Logo */}
        <button onClick={() => setTab('feed')} className="flex-shrink-0">
          <div className="w-9 h-9 bg-[#0a66c2] rounded flex items-center justify-center">
            <span className="text-white font-black text-lg">P</span>
          </div>
        </button>

        {/* Barra de búsqueda */}
        <div className="flex items-center bg-[#eef3f8] rounded-md px-3 py-1.5 gap-2 w-64 flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#00000099] flex-shrink-0" fill="currentColor">
            <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
          <input
            className="bg-transparent text-sm outline-none w-full text-[#000000e6] placeholder-[#00000099]"
            placeholder="Buscar"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setTab('buscar'); setBusqueda('') } }}
          />
        </div>

        {/* Nav items */}
        <nav className="flex items-center ml-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center px-3 py-1 text-xs transition-colors min-w-[64px] h-14 justify-center border-b-2 ${
                tab === item.id
                  ? 'text-black border-black'
                  : 'text-[#00000099] border-transparent hover:text-black hover:border-black'
              }`}
            >
              {item.icon}
              <span className="hidden md:block mt-0.5">{item.label}</span>
            </button>
          ))}

          {/* Separador */}
          <div className="w-px h-8 bg-[#e0dfdc] mx-1" />

          {/* Menú perfil */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuAbierto(v => !v)}
              className="flex flex-col items-center px-3 py-1 text-xs text-[#00000099] hover:text-black min-w-[64px] h-14 justify-center"
            >
              {usuario?.foto
                ? <img src={usuario.foto} className="w-6 h-6 rounded-full object-cover" />
                : <div className="w-6 h-6 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-bold text-xs">{usuario?.nombre[0]}</div>
              }
              <span className="hidden md:flex items-center gap-0.5 mt-0.5">
                Yo
                <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor"><path d="M8 11L3 6h10z"/></svg>
              </span>
            </button>

            {menuAbierto && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl border border-[#e0dfdc] shadow-lg z-50 overflow-hidden">
                {/* Header del menú */}
                <div className="p-4 flex gap-3 items-center border-b border-[#e0dfdc]">
                  {usuario?.foto
                    ? <img src={usuario.foto} className="w-12 h-12 rounded-full object-cover border border-[#e0dfdc]" />
                    : <div className="w-12 h-12 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-bold text-lg">{usuario?.nombre[0]}</div>
                  }
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{usuario?.nombre}</p>
                    <p className="text-xs text-[#00000099] truncate">{usuario?.cargo}</p>
                  </div>
                </div>
                <div className="p-2">
                  <button onClick={() => { setTab('perfil'); setMenuAbierto(false) }}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-gray-50 font-medium text-[#0a66c2]">
                    Ver perfil
                  </button>
                  <button onClick={() => { setTab('configuracion'); setMenuAbierto(false) }}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-gray-50 text-[#000000e6]">
                    Configuración
                  </button>
                  <hr className="my-1 border-[#e0dfdc]" />
                  <button onClick={logout}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-gray-50 text-[#000000e6]">
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Para empresas */}
          <div className="relative ml-1 flex-shrink-0">
            <button
              onClick={() => setTab('empresas')}
              className="flex flex-col items-center px-2 py-1 text-xs text-[#00000099] hover:text-black h-14 justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/>
              </svg>
              <span className="hidden md:block mt-0.5 whitespace-nowrap">Para empresas</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}