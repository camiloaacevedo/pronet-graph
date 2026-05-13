'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'

export default function Conexiones({ onVerPerfilCompleto }: { onVerPerfilCompleto?: (id: string) => void }) {
  const { usuario } = useAuth()
  const [todos, setTodos] = useState<any[]>([])
  const [recomendaciones, setRecomendaciones] = useState<any>(null)
  const [conectando, setConectando] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [panel, setPanel] = useState<any>(null)
  const [perfilData, setPerfilData] = useState<any>(null)

  const cargarDatos = async () => {
    if (!usuario) return
    const [todosRes, recsRes] = await Promise.all([
      fetch('/api/graph/usuarios').then(r => r.json()),
      fetch(`/api/recomendaciones?usuarioId=${usuario.id}`).then(r => r.json())
    ])
    setTodos(todosRes)
    setRecomendaciones(recsRes)
  }

  useEffect(() => { cargarDatos() }, [usuario])

  const idsConectados = new Set(
    recomendaciones?.conexionesActuales?.map((c: any) => c.id) || []
  )

  const verPerfil = async (u: any) => {
    setPanel(u)
    setPerfilData(null)
    const data = await fetch(`/api/perfil?id=${u.id}`).then(r => r.json())
    setPerfilData(data)
  }

  const conectar = async (u: any) => {
    if (!usuario) return
    setConectando(u.id)
    await fetch('/api/graph/conexiones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId1: usuario.id, usuarioId2: u.id })
    })
    setMensaje(`¡Conectado con ${u.nombre}!`)
    setTimeout(() => setMensaje(''), 3000)
    setConectando(null)
    await cargarDatos()
    if (panel?.id === u.id) verPerfil(u)
  }

  const eliminarConexion = async (u: any) => {
    if (!usuario) return
    setEliminando(u.id)
    await fetch('/api/graph/conexiones', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId1: usuario.id, usuarioId2: u.id })
    })
    setMensaje(`Conexión con ${u.nombre} eliminada`)
    setTimeout(() => setMensaje(''), 3000)
    setEliminando(null)
    await cargarDatos()
    if (panel?.id === u.id) verPerfil(u)
  }

  const AccionBtn = ({ u }: { u: any }) => {
    const yaConectado = idsConectados.has(u.id)
    if (u.id === usuario?.id) return null
    if (yaConectado) return (
      <button
        onClick={() => eliminarConexion(u)}
        disabled={eliminando === u.id}
        className="text-[#00000099] border border-[#c0c0c0] text-xs px-3 py-1 rounded-full hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 disabled:opacity-50"
      >
        {eliminando === u.id ? '...' : 'Quitar'}
      </button>
    )
    return (
      <button
        onClick={() => conectar(u)}
        disabled={conectando === u.id}
        className="text-[#0a66c2] border border-[#0a66c2] text-xs px-3 py-1 rounded-full hover:bg-[#eef3f8] transition-colors flex-shrink-0 disabled:opacity-50"
      >
        {conectando === u.id ? '...' : '+ Conectar'}
      </button>
    )
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {mensaje && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
            ✅ {mensaje}
          </div>
        )}

        {/* Mis conexiones */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
          <h3 className="font-semibold mb-4">
            Mis conexiones
            <span className="ml-2 text-[#0a66c2] font-normal text-sm">
              {recomendaciones?.conexionesActuales?.length || 0}
            </span>
          </h3>
          {!recomendaciones?.conexionesActuales?.length
            ? <p className="text-sm text-[#00000099]">Aún no tienes conexiones.</p>
            : (
              <div className="flex flex-col gap-2">
                {recomendaciones.conexionesActuales.map((c: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-[#e0dfdc] rounded-xl hover:bg-gray-50 transition-colors">
                    <button onClick={() => verPerfil(c)} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white font-bold flex-shrink-0 hover:opacity-80 overflow-hidden border border-[#e0dfdc]">
                      {c.foto 
                        ? <img src={c.foto} className="w-full h-full object-cover" />
                        : c.nombre[0].toUpperCase()
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <button onClick={() => verPerfil(c)} className="font-medium text-sm hover:text-[#0a66c2] hover:underline text-left">{c.nombre}</button>
                      <p className="text-xs text-[#00000099]">{c.cargo}</p>
                    </div>
                    <AccionBtn u={c} />
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Sugerencias */}
        {recomendaciones?.contactosRecomendados?.length > 0 && (
          <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
            <h3 className="font-semibold mb-4">Personas que quizás conozcas</h3>
            <div className="grid grid-cols-2 gap-3">
              {recomendaciones.contactosRecomendados.map((c: any, i: number) => (
                <div key={i} className="flex flex-col items-center text-center p-4 border border-[#e0dfdc] rounded-xl hover:shadow-sm transition-shadow">
                  <button onClick={() => verPerfil(c)} className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white font-bold text-xl mb-2 hover:opacity-80 overflow-hidden border border-[#e0dfdc]">
                    {c.foto 
                      ? <img src={c.foto} className="w-full h-full object-cover" />
                      : c.nombre[0].toUpperCase()
                    }
                  </button>
                  <button onClick={() => verPerfil(c)} className="font-medium text-sm hover:text-[#0a66c2] hover:underline">{c.nombre}</button>
                  <p className="text-xs text-[#00000099] mb-1">{c.cargo}</p>
                  <p className="text-xs text-[#00000099] mb-3">{c.contactosComunes} contacto(s) en común</p>
                  <AccionBtn u={c} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todas las personas */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
          <h3 className="font-semibold mb-4">Más personas en ProNet</h3>
          <div className="flex flex-col gap-2">
            {todos.filter(u => u.id !== usuario?.id).map((u, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-[#e0dfdc] rounded-xl hover:bg-gray-50 transition-colors">
                <button onClick={() => verPerfil(u)} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white font-bold flex-shrink-0 hover:opacity-80 overflow-hidden border border-[#e0dfdc]">
                  {u.foto 
                    ? <img src={u.foto} className="w-full h-full object-cover" />
                    : u.nombre[0].toUpperCase()
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <button onClick={() => verPerfil(u)} className="font-medium text-sm hover:text-[#0a66c2] hover:underline text-left">{u.nombre}</button>
                  <p className="text-xs text-[#00000099]">{u.cargo}</p>
                </div>
                <AccionBtn u={u} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel lateral tipo LinkedIn */}
      {panel && (
        <aside className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#e0dfdc] overflow-hidden sticky top-20">
            <div className="h-20 bg-gradient-to-r from-[#0a66c2] to-[#004182] relative">
              <button onClick={() => { setPanel(null); setPerfilData(null) }} className="absolute top-2 right-3 text-white/70 hover:text-white text-xl">✕</button>
            </div>
            <div className="px-5 pb-5 -mt-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] border-4 border-white flex items-center justify-center text-white font-bold text-2xl mb-2 overflow-hidden shadow-sm">
                {panel.foto 
                  ? <img src={panel.foto} className="w-full h-full object-cover" />
                  : panel.nombre[0].toUpperCase()
                }
              </div>
              <p className="font-bold text-base">{panel.nombre}</p>
              <p className="text-sm text-[#00000099]">{panel.cargo}</p>
              <p className="text-xs text-[#00000099] mb-3">{panel.email}</p>
              <div className="flex flex-col gap-2">
                <AccionBtn u={panel} />
                {onVerPerfilCompleto && (
                  <button
                    onClick={() => onVerPerfilCompleto(panel.id)}
                    className="w-full text-center text-sm font-semibold text-[#0a66c2] border border-[#0a66c2] py-1.5 rounded-full hover:bg-[#eef3f8] transition-colors"
                  >
                    Ver perfil completo
                  </button>
                )}
              </div>

              {!perfilData ? (
                <div className="mt-4 text-center text-sm text-[#00000099] py-4">Cargando...</div>
              ) : (
                <>
                  <hr className="border-[#e0dfdc] my-4" />

                  {/* Habilidades */}
                  <p className="text-xs font-semibold text-[#00000099] uppercase mb-2">Habilidades</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {perfilData.habilidades.length === 0
                      ? <p className="text-xs text-[#00000099]">Sin habilidades</p>
                      : perfilData.habilidades.map((h: string, i: number) => (
                        <span key={i} className="bg-[#eef3f8] text-[#0a66c2] text-xs px-2 py-0.5 rounded-full">{h}</span>
                      ))
                    }
                  </div>

                  {/* Proyectos */}
                  {perfilData.proyectos.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-[#00000099] uppercase mb-2">Proyectos</p>
                      <div className="flex flex-col gap-2 mb-4">
                        {perfilData.proyectos.map((p: any, i: number) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs font-medium">{p.nombre}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.tecnologias?.map((t: string, j: number) => (
                                <span key={j} className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded">{t}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Conexiones en común */}
                  <p className="text-xs font-semibold text-[#00000099] uppercase mb-2">
                    Conexiones · {perfilData.conexiones.length}
                  </p>
                  <div className="flex flex-col gap-1">
                    {perfilData.conexiones.slice(0, 3).map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                          {c.foto 
                            ? <img src={c.foto} className="w-full h-full object-cover" />
                            : c.nombre[0].toUpperCase()
                          }
                        </div>
                        <p className="text-xs truncate">{c.nombre}</p>
                      </div>
                    ))}
                    {perfilData.conexiones.length > 3 && (
                      <p className="text-xs text-[#00000099] mt-1">+{perfilData.conexiones.length - 3} más</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
