'use client'
import { useEffect, useState } from 'react'

interface Props {
  perfilId: string
  onVerPerfil: (id: string) => void
  onVolver: () => void
}

export default function ConexionesDelPerfil({ perfilId, onVerPerfil, onVolver }: Props) {
  const [perfil, setPerfil] = useState<any>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    setCargando(true)
    fetch(`/api/perfil?id=${perfilId}`)
      .then(r => r.json())
      .then(data => {
        setPerfil(data)
        setCargando(false)
      })
  }, [perfilId])

  if (cargando) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 text-[#0a66c2] text-sm hover:underline w-fit"
        >
          ← Volver
        </button>
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-8 text-center text-[#00000099] text-sm">
          Cargando conexiones...
        </div>
      </div>
    )
  }

  const conexiones: any[] = perfil?.conexiones || []

  return (
    <div className="flex flex-col gap-4">
      {/* Botón volver */}
      <button
        onClick={onVolver}
        className="flex items-center gap-2 text-[#0a66c2] text-sm hover:underline w-fit"
      >
        ← Volver
      </button>

      {/* Header del perfil dueño */}
      <div className="bg-white rounded-xl border border-[#e0dfdc] overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-[#0a66c2] to-[#004182]" />
        <div className="px-6 pb-5 -mt-10 flex items-end gap-4">
          {perfil.foto
            ? <img src={perfil.foto} className="w-16 h-16 rounded-full object-cover border-4 border-white flex-shrink-0" />
            : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] border-4 border-white flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {perfil.nombre?.[0]}
              </div>
            )
          }
          <div className="pb-1">
            <p className="font-bold text-lg">{perfil.nombre}</p>
            <p className="text-sm text-[#00000099]">{perfil.cargo}</p>
          </div>
        </div>
      </div>

      {/* Lista de conexiones */}
      <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
        <h3 className="font-semibold mb-4 text-lg">
          Conexiones
          <span className="ml-2 text-[#0a66c2] font-normal text-sm">{conexiones.length}</span>
        </h3>

        {conexiones.length === 0 ? (
          <p className="text-sm text-[#00000099]">Este perfil aún no tiene conexiones.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {conexiones.map((c: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 border border-[#e0dfdc] rounded-xl hover:bg-[#f3f2ef] transition-colors"
              >
                {/* Foto / avatar — clickeable */}
                <button
                  onClick={() => onVerPerfil(c.id)}
                  className="flex-shrink-0 hover:opacity-80 transition-opacity"
                  title={`Ver perfil de ${c.nombre}`}
                >
                  {c.foto
                    ? <img src={c.foto} className="w-12 h-12 rounded-full object-cover border-2 border-[#e0dfdc]" />
                    : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white font-bold text-lg">
                        {c.nombre?.[0]}
                      </div>
                    )
                  }
                </button>

                {/* Nombre y cargo — clickeable */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onVerPerfil(c.id)}
                    className="font-semibold text-sm hover:text-[#0a66c2] hover:underline text-left block truncate w-full"
                  >
                    {c.nombre}
                  </button>
                  <p className="text-xs text-[#00000099] truncate">{c.cargo}</p>
                  {c.empresa && (
                    <p className="text-xs text-[#00000099] truncate">🏢 {c.empresa.nombre ?? c.empresa}</p>
                  )}
                </div>

                {/* Botón ver perfil */}
                <button
                  onClick={() => onVerPerfil(c.id)}
                  className="flex-shrink-0 text-xs text-[#0a66c2] border border-[#0a66c2] px-3 py-1.5 rounded-full hover:bg-[#eef3f8] transition-colors"
                >
                  Ver perfil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
