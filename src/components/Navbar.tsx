'use client'
import { useAuth } from '@/lib/AuthContext'

const navItems = [
  { id: 'feed', label: 'Inicio', icon: '🏠' },
  { id: 'perfil', label: 'Mi perfil', icon: '👤' },
  { id: 'conexiones', label: 'Conexiones', icon: '🤝' },
  { id: 'ofertas', label: 'Ofertas', icon: '💼' },
  { id: 'empresas', label: 'Empresas', icon: '🏢' },
  { id: 'buscar', label: 'Buscar', icon: '🔍' },
]

export default function Navbar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const { usuario, logout } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e0dfdc] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-4 h-14">
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-8 h-8 bg-[#0a66c2] rounded flex items-center justify-center">
            <span className="text-white font-black text-sm">P</span>
          </div>
          <span className="font-black text-[#0a66c2] text-xl hidden sm:block">ProNet</span>
        </div>

        <nav className="flex items-center gap-1 mx-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center px-3 py-1 rounded text-xs transition-colors min-w-[56px] ${
                tab === item.id
                  ? 'text-[#0a66c2] border-b-2 border-[#0a66c2]'
                  : 'text-[#00000099] hover:text-black hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-bold text-sm">
            {usuario?.nombre[0]}
          </div>
          <span className="text-sm font-medium hidden md:block">{usuario?.nombre.split(' ')[0]}</span>
          <button
            onClick={logout}
            className="text-xs text-[#00000099] hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
