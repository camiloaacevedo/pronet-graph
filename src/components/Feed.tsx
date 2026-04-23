'use client'
import { useEffect, useState } from 'react'

export default function Feed({ setTab }: { setTab: (t: string) => void }) {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [ofertas, setOfertas] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/usuarios').then(r => r.json()).then(setUsuarios)
    fetch('/api/ofertas').then(r => r.json()).then(setOfertas)
  }, [])

  return (
    <div className="flex gap-4">
      {/* Sidebar izquierdo */}
      <aside className="w-56 flex-shrink-0 hidden lg:block">
        <div className="bg-white rounded-xl border border-[#e0dfdc] overflow-hidden">
          <div className="h-14 bg-gradient-to-r from-[#0a66c2] to-[#004182]"></div>
          <div className="px-4 pb-4 -mt-6">
            <div className="w-12 h-12 rounded-full bg-[#0a66c2] border-2 border-white flex items-center justify-center text-white font-bold text-lg mb-2">P</div>
            <p className="font-semibold text-sm">Red ProNet</p>
            <p className="text-xs text-[#00000099]">Base de datos de grafos</p>
            <hr className="my-3 border-[#e0dfdc]" />
            <div className="flex justify-between text-xs">
              <span className="text-[#00000099]">Usuarios</span>
              <span className="text-[#0a66c2] font-semibold">{usuarios.length}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-[#00000099]">Ofertas</span>
              <span className="text-[#0a66c2] font-semibold">{ofertas.length}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Feed central */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Card de bienvenida */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-4">
          <p className="text-sm text-[#00000099] mb-3">Comparte algo con tu red...</p>
          <div className="flex gap-3">
            <button onClick={() => setTab('registrar')} className="flex items-center gap-2 text-sm text-[#00000099] hover:text-[#0a66c2] hover:bg-[#eef3f8] px-3 py-1.5 rounded-lg transition-colors border border-[#e0dfdc]">
              👤 Nuevo usuario
            </button>
            <button onClick={() => setTab('conexiones')} className="flex items-center gap-2 text-sm text-[#00000099] hover:text-[#0a66c2] hover:bg-[#eef3f8] px-3 py-1.5 rounded-lg transition-colors border border-[#e0dfdc]">
              🤝 Conectar
            </button>
          </div>
        </div>

        {/* Usuarios recientes */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-4">
          <h3 className="font-semibold text-sm mb-3">Personas en tu red</h3>
          <div className="flex flex-col gap-3">
            {usuarios.map((u, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {u.nombre[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{u.nombre}</p>
                  <p className="text-xs text-[#00000099] truncate">{u.cargo}</p>
                </div>
                <button onClick={() => setTab('conexiones')} className="text-[#0a66c2] border border-[#0a66c2] text-xs px-3 py-1 rounded-full hover:bg-[#eef3f8] transition-colors flex-shrink-0">
                  + Conectar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ofertas recientes */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-4">
          <h3 className="font-semibold text-sm mb-3">Ofertas recomendadas</h3>
          <div className="flex flex-col gap-3">
            {ofertas.map((o, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded bg-[#eef3f8] flex items-center justify-center text-lg flex-shrink-0">🏢</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{o.titulo}</p>
                  <p className="text-xs text-[#00000099]">{o.empresa}</p>
                  <p className="text-xs text-emerald-600 font-medium">{o.salario}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {o.habilidades?.slice(0, 2).map((h: string, j: number) => (
                      <span key={j} className="bg-[#eef3f8] text-[#0a66c2] text-xs px-2 py-0.5 rounded-full">{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar derecho */}
      <aside className="w-64 flex-shrink-0 hidden xl:block">
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-4">
          <h3 className="font-semibold text-sm mb-3">Noticias de ProNet</h3>
          <div className="flex flex-col gap-2 text-xs text-[#00000099]">
            <p className="hover:text-black cursor-pointer">· Red profesional basada en grafos Neo4j</p>
            <p className="hover:text-black cursor-pointer">· Encuentra conexiones entre profesionales</p>
            <p className="hover:text-black cursor-pointer">· Descubre ofertas según tus habilidades</p>
            <p className="hover:text-black cursor-pointer">· Analiza rutas entre usuarios</p>
          </div>
        </div>
      </aside>
    </div>
  )
}
