'use client'
import { useEffect, useState } from 'react'

export default function BuscarUsuarios() {
  const [todos, setTodos] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [recomendaciones, setRecomendaciones] = useState<any>(null)
  const [seleccionado, setSeleccionado] = useState<any>(null)

  useEffect(() => {
    fetch('/api/graph/usuarios').then(r => r.json()).then(setTodos)
  }, [])

  const filtrados = todos.filter(u =>
    u.nombre.toLowerCase().includes(query.toLowerCase()) ||
    u.cargo.toLowerCase().includes(query.toLowerCase())
  )

  const verPerfil = async (u: any) => {
    setSeleccionado(u)
    const res = await fetch(`/api/recomendaciones?usuarioId=${u.id}`)
    setRecomendaciones(await res.json())
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1 flex flex-col gap-3">
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-4">
          <input
            className="w-full bg-[#eef3f8] rounded-lg px-4 py-2 text-sm outline-none border border-transparent focus:border-[#0a66c2] focus:bg-white transition-colors"
            placeholder="Buscar por nombre o cargo..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filtrados.map((u, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#e0dfdc] p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white font-bold text-xl mb-2">
                {u.nombre[0]}
              </div>
              <p className="font-semibold text-sm">{u.nombre}</p>
              <p className="text-xs text-[#00000099] mb-3">{u.cargo}</p>
              <button
                onClick={() => verPerfil(u)}
                className="text-[#0a66c2] border border-[#0a66c2] text-xs px-4 py-1.5 rounded-full hover:bg-[#eef3f8] transition-colors w-full"
              >
                Ver perfil
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de perfil */}
      {seleccionado && recomendaciones && (
        <aside className="w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#e0dfdc] overflow-hidden sticky top-20">
            <div className="h-16 bg-gradient-to-r from-[#0a66c2] to-[#004182]"></div>
            <div className="px-4 pb-4 -mt-6">
              <div className="w-12 h-12 rounded-full bg-[#0a66c2] border-2 border-white flex items-center justify-center text-white font-bold mb-2">
                {seleccionado.nombre[0]}
              </div>
              <p className="font-bold text-sm">{seleccionado.nombre}</p>
              <p className="text-xs text-[#00000099] mb-3">{seleccionado.cargo}</p>
              <hr className="border-[#e0dfdc] mb-3" />
              <p className="text-xs font-semibold text-[#00000099] uppercase mb-2">Ofertas compatibles</p>
              {recomendaciones.ofertasRecomendadas.length === 0
                ? <p className="text-xs text-[#00000099]">Sin ofertas</p>
                : recomendaciones.ofertasRecomendadas.map((o: any, i: number) => (
                  <div key={i} className="mb-2">
                    <p className="text-xs font-medium">{o.oferta}</p>
                    <p className="text-xs text-[#00000099]">{o.empresa}</p>
                  </div>
                ))
              }
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
