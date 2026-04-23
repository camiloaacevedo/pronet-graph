'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'

export default function Mensajes() {
  const { usuario } = useAuth()
  const [conexiones, setConexiones] = useState<any[]>([])
  const [seleccionado, setSeleccionado] = useState<any>(null)
  const [mensajes, setMensajes] = useState<any[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!usuario) return
    fetch(`/api/recomendaciones?usuarioId=${usuario.id}`)
      .then(r => r.json())
      .then(d => setConexiones(d.conexionesActuales || []))
  }, [usuario])

  const abrirConversacion = async (u: any) => {
    setSeleccionado(u)
    const data = await fetch(`/api/mensajes/conversacion?deId=${usuario?.id}&paraId=${u.id}`)
      .then(r => r.json()).catch(() => [])
    setMensajes(data)
  }

  const enviar = async () => {
    if (!texto.trim() || !seleccionado || !usuario) return
    setEnviando(true)
    await fetch('/api/mensajes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deId: usuario.id, paraId: seleccionado.id, texto })
    })
    setTexto('')
    await abrirConversacion(seleccionado)
    setEnviando(false)
  }

  return (
    <div className="flex gap-0 bg-white rounded-xl border border-[#e0dfdc] overflow-hidden" style={{ height: '70vh' }}>
      {/* Lista de conversaciones */}
      <div className="w-72 border-r border-[#e0dfdc] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#e0dfdc]">
          <h2 className="font-bold text-lg">Mensajes</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {conexiones.length === 0
            ? <p className="text-sm text-[#00000099] p-4">Conecta con alguien para enviar mensajes</p>
            : conexiones.map((c, i) => (
              <button key={i} onClick={() => abrirConversacion(c)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-[#e0dfdc] ${seleccionado?.id === c.id ? 'bg-[#eef3f8]' : ''}`}>
                {c.foto
                  ? <img src={c.foto} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-12 h-12 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-bold flex-shrink-0">{c.nombre[0]}</div>
                }
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{c.nombre}</p>
                  <p className="text-xs text-[#00000099] truncate">{c.cargo}</p>
                </div>
              </button>
            ))
          }
        </div>
      </div>

      {/* Conversación */}
      <div className="flex-1 flex flex-col">
        {!seleccionado ? (
          <div className="flex-1 flex items-center justify-center text-[#00000099] text-sm">
            Selecciona una conversación
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-[#e0dfdc] flex items-center gap-3">
              {seleccionado.foto
                ? <img src={seleccionado.foto} className="w-10 h-10 rounded-full object-cover" />
                : <div className="w-10 h-10 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-bold">{seleccionado.nombre[0]}</div>
              }
              <div>
                <p className="font-semibold text-sm">{seleccionado.nombre}</p>
                <p className="text-xs text-[#00000099]">{seleccionado.cargo}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {mensajes.length === 0
                ? <p className="text-center text-sm text-[#00000099] mt-8">Inicia la conversación</p>
                : mensajes.map((m, i) => (
                  <div key={i} className={`flex ${m.deId === usuario?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      m.deId === usuario?.id
                        ? 'bg-[#0a66c2] text-white rounded-br-sm'
                        : 'bg-gray-100 text-[#000000e6] rounded-bl-sm'
                    }`}>
                      {m.texto}
                    </div>
                  </div>
                ))
              }
            </div>

            <div className="p-4 border-t border-[#e0dfdc] flex gap-2">
              <input
                className="flex-1 border border-[#c0c0c0] rounded-full px-4 py-2 text-sm outline-none focus:border-[#0a66c2]"
                placeholder="Escribe un mensaje..."
                value={texto}
                onChange={e => setTexto(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && enviar()}
              />
              <button onClick={enviar} disabled={enviando || !texto.trim()}
                className="bg-[#0a66c2] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#004182] disabled:opacity-50">
                Enviar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
