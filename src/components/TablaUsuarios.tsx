'use client'
import { useEffect, useState } from 'react'

interface Usuario {
  id: string
  nombre: string
  email: string
  cargo: string
}

export default function TablaUsuarios({ refresh }: { refresh: number }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [recomendaciones, setRecomendaciones] = useState<any>(null)
  const [seleccionado, setSeleccionado] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/usuarios').then(r => r.json()).then(setUsuarios)
  }, [refresh])

  const verRecomendaciones = async (id: string) => {
    setSeleccionado(id)
    const res = await fetch(`/api/recomendaciones?usuarioId=${id}`)
    const data = await res.json()
    setRecomendaciones(data)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="border-b border-white/10 text-white/50 text-xs uppercase">
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Cargo</th>
              <th className="text-left px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium">{u.nombre}</td>
                <td className="px-4 py-3 text-white/60">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="bg-violet-500/20 text-violet-300 text-xs px-2 py-1 rounded-full">{u.cargo}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => verRecomendaciones(u.id)}
                    className="text-cyan-400 hover:text-cyan-300 text-xs underline transition-colors"
                  >
                    Ver recomendaciones
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recomendaciones && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
          <h4 className="text-white font-bold">Recomendaciones</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/50 text-xs uppercase mb-2">Contactos sugeridos</p>
              {recomendaciones.contactosRecomendados.length === 0
                ? <p className="text-white/30 text-sm">Sin sugerencias</p>
                : recomendaciones.contactosRecomendados.map((c: any, i: number) => (
                  <div key={i} className="bg-violet-500/10 rounded-lg px-3 py-2 mb-2">
                    <p className="text-white font-medium text-sm">{c.nombre}</p>
                    <p className="text-white/50 text-xs">{c.cargo} · {c.contactosComunes} contacto(s) en común</p>
                  </div>
                ))
              }
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase mb-2">Ofertas compatibles</p>
              {recomendaciones.ofertasRecomendadas.length === 0
                ? <p className="text-white/30 text-sm">Sin ofertas</p>
                : recomendaciones.ofertasRecomendadas.map((o: any, i: number) => (
                  <div key={i} className="bg-cyan-500/10 rounded-lg px-3 py-2 mb-2">
                    <p className="text-white font-medium text-sm">{o.oferta}</p>
                    <p className="text-white/50 text-xs">{o.empresa} · {o.habilidadesMatch} habilidad(es)</p>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}