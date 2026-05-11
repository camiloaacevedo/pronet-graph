'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'

export default function Feed({ setTab }: { setTab: (t: string) => void }) {
  const { usuario } = useAuth()
  const [publicaciones, setPublicaciones] = useState<any[]>([])
  const [texto, setTexto] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [ofertas, setOfertas] = useState<any[]>([])

  const cargar = async () => {
    const [pubs, usrs, offs] = await Promise.all([
      fetch('/api/business/publicaciones').then(r => r.json()),
      fetch('/api/graph/usuarios').then(r => r.json()),
      fetch('/api/business/ofertas').then(r => r.json()),
    ])
    setPublicaciones(pubs)
    setUsuarios(usrs)
    setOfertas(offs)
  }

  useEffect(() => { cargar() }, [])

  const publicar = async () => {
    if (!texto.trim() || !usuario) return
    setPublicando(true)
    await fetch('/api/business/publicaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: usuario.id, texto })
    })
    setTexto('')
    await cargar()
    setPublicando(false)
  }

  const formatFecha = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex gap-4">
      {/* Sidebar izquierdo */}
      <aside className="w-56 flex-shrink-0 hidden lg:block">
        <div className="bg-white rounded-xl border border-[#e0dfdc] overflow-hidden">
          <div className="h-14 bg-gradient-to-r from-[#0a66c2] to-[#004182]"></div>
          <div className="px-4 pb-4 -mt-6">
            {usuario?.foto
              ? <img src={usuario.foto} className="w-12 h-12 rounded-full border-2 border-white object-cover mb-2" />
              : <div className="w-12 h-12 rounded-full bg-[#0a66c2] border-2 border-white flex items-center justify-center text-white font-bold text-lg mb-2">{usuario?.nombre[0]}</div>
            }
            <p className="font-semibold text-sm">{usuario?.nombre}</p>
            <p className="text-xs text-[#00000099]">{usuario?.cargo}</p>
            <hr className="my-3 border-[#e0dfdc]" />
            <div className="flex justify-between text-xs">
              <span className="text-[#00000099]">Usuarios</span>
              <span className="text-[#0a66c2] font-semibold">{usuarios.length}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-[#00000099]">Ofertas</span>
              <span className="text-[#0a66c2] font-semibold">{ofertas.length}</span>
            </div>
            <hr className="my-3 border-[#e0dfdc]" />
            <button onClick={() => setTab('perfil')} className="text-xs text-[#0a66c2] hover:underline">Ver mi perfil</button>
          </div>
        </div>
      </aside>

      {/* Feed central */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Crear publicación */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-4">
          <div className="flex gap-3 mb-3">
            {usuario?.foto
              ? <img src={usuario.foto} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              : <div className="w-10 h-10 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-bold flex-shrink-0">{usuario?.nombre[0]}</div>
            }
            <textarea
              className="flex-1 border border-[#c0c0c0] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0a66c2] resize-none transition-colors"
              placeholder="Comparte algo con tu red..."
              rows={3}
              value={texto}
              onChange={e => setTexto(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={publicar}
              disabled={!texto.trim() || publicando}
              className="bg-[#0a66c2] hover:bg-[#004182] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors disabled:opacity-40"
            >
              {publicando ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>

        {/* Publicaciones */}
        {publicaciones.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e0dfdc] p-8 text-center text-[#00000099] text-sm">
            No hay publicaciones aún. ¡Sé el primero en compartir algo!
          </div>
        ) : publicaciones.map((p, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e0dfdc] p-4">
            <div className="flex gap-3 mb-3">
              {p.foto
                ? <img src={p.foto} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                : <div className="w-10 h-10 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-bold flex-shrink-0">{p.autor[0]}</div>
              }
              <div>
                <p className="font-semibold text-sm">{p.autor}</p>
                <p className="text-xs text-[#00000099]">{p.cargo}</p>
                <p className="text-xs text-[#00000099]">{formatFecha(p.fecha)}</p>
              </div>
            </div>
            <p className="text-sm text-[#000000e6] leading-relaxed whitespace-pre-wrap">{p.texto}</p>
          </div>
        ))}
      </div>

      {/* Sidebar derecho */}
      <aside className="w-64 flex-shrink-0 hidden xl:block">
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-4 mb-3">
          <h3 className="font-semibold text-sm mb-3">Ofertas destacadas</h3>
          {ofertas.slice(0, 3).map((o, i) => (
            <div key={i} className="mb-3 pb-3 border-b border-[#e0dfdc] last:border-0 last:mb-0 last:pb-0">
              <p className="text-sm font-medium">{o.titulo}</p>
              <p className="text-xs text-[#00000099]">{o.empresa}</p>
              <p className="text-xs text-emerald-600">{o.salario}</p>
            </div>
          ))}
          <button onClick={() => setTab('ofertas')} className="text-xs text-[#0a66c2] hover:underline mt-1">Ver todas →</button>
        </div>
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-4">
          <h3 className="font-semibold text-sm mb-3">Personas en tu red</h3>
          {usuarios.filter(u => u.id !== usuario?.id).slice(0, 4).map((u, i) => (
            <div key={i} className="flex items-center gap-2 mb-3 last:mb-0">
              {u.foto
                ? <img src={u.foto} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                : <div className="w-8 h-8 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{u.nombre[0]}</div>
              }
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{u.nombre}</p>
                <p className="text-xs text-[#00000099] truncate">{u.cargo}</p>
              </div>
            </div>
          ))}
          <button onClick={() => setTab('buscar')} className="text-xs text-[#0a66c2] hover:underline mt-1">Ver todos →</button>
        </div>
      </aside>
    </div>
  )
}
