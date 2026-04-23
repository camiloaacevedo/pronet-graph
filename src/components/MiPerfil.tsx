'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'

export default function MiPerfil() {
  const { usuario } = useAuth()
  const [perfil, setPerfil] = useState<any>(null)

  useEffect(() => {
    if (!usuario) return
    fetch(`/api/perfil?id=${usuario.id}`)
      .then(r => r.json())
      .then(setPerfil)
  }, [usuario])

  if (!usuario) return null

  return (
    <div className="flex gap-4">
      <div className="flex-1 flex flex-col gap-3">
        {/* Header perfil */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-[#0a66c2] to-[#004182]"></div>
          <div className="px-6 pb-6 -mt-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] border-4 border-white flex items-center justify-center text-white font-bold text-3xl mb-3">
              {usuario.nombre[0]}
            </div>
            <h2 className="text-2xl font-bold">{usuario.nombre}</h2>
            <p className="text-[#00000099]">{usuario.cargo}</p>
            <p className="text-[#00000099] text-sm">{usuario.email}</p>
            {perfil && (
              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-[#0a66c2] font-semibold">{perfil.conexiones.length} conexiones</span>
                <span className="text-[#00000099]">·</span>
                <span className="text-[#00000099]">{perfil.habilidades.length} habilidades</span>
              </div>
            )}
          </div>
        </div>

        {perfil && (
          <>
            {/* Habilidades */}
            <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
              <h3 className="font-semibold mb-3">Habilidades</h3>
              <div className="flex flex-wrap gap-2">
                {perfil.habilidades.map((h: string, i: number) => (
                  <span key={i} className="bg-[#eef3f8] text-[#0a66c2] text-sm px-3 py-1 rounded-full font-medium">{h}</span>
                ))}
              </div>
            </div>

            {/* Proyectos */}
            <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
              <h3 className="font-semibold mb-3">Proyectos</h3>
              {perfil.proyectos.length === 0
                ? <p className="text-sm text-[#00000099]">Sin proyectos registrados</p>
                : perfil.proyectos.map((p: any, i: number) => (
                  <div key={i} className="mb-3 pb-3 border-b border-[#e0dfdc] last:border-0 last:mb-0 last:pb-0">
                    <p className="font-medium text-sm">{p.nombre}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.tecnologias?.map((t: string, j: number) => (
                        <span key={j} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Conexiones */}
            <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
              <h3 className="font-semibold mb-3">Conexiones ({perfil.conexiones.length})</h3>
              <div className="grid grid-cols-2 gap-3">
                {perfil.conexiones.map((c: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {c.nombre[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.nombre}</p>
                      <p className="text-xs text-[#00000099] truncate">{c.cargo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ofertas recomendadas */}
            <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
              <h3 className="font-semibold mb-3">Ofertas recomendadas para ti</h3>
              {perfil.ofertas.length === 0
                ? <p className="text-sm text-[#00000099]">Sin ofertas compatibles</p>
                : perfil.ofertas.map((o: any, i: number) => (
                  <div key={i} className="flex gap-3 items-start mb-4 pb-4 border-b border-[#e0dfdc] last:border-0 last:mb-0 last:pb-0">
                    <div className="w-10 h-10 rounded bg-[#eef3f8] flex items-center justify-center text-lg flex-shrink-0">🏢</div>
                    <div>
                      <p className="font-medium text-sm">{o.titulo}</p>
                      <p className="text-xs text-[#00000099]">{o.empresa}</p>
                      <p className="text-xs text-emerald-600 font-medium">{o.salario}</p>
                      <p className="text-xs text-[#0a66c2] mt-0.5">{o.match} habilidad(es) coinciden</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        )}
      </div>
    </div>
  )
}
