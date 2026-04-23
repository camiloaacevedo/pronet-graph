'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'

export default function TablaOfertas() {
  const { usuario } = useAuth()
  const [ofertas, setOfertas] = useState<any[]>([])
  const [candidatos, setCandidatos] = useState<any[]>([])
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<any>(null)
  const [aplicando, setAplicando] = useState<string | null>(null)
  const [yaAplico, setYaAplico] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/ofertas').then(r => r.json()).then(setOfertas)
    if (usuario) {
      fetch(`/api/perfil?id=${usuario.id}`)
        .then(r => r.json())
        .then(p => setYaAplico(new Set(p.aplicaciones?.map((a: any) => a.ofertaId) || [])))
    }
  }, [usuario])

  const verCandidatos = async (oferta: any) => {
    setOfertaSeleccionada(oferta)
    const data = await fetch(`/api/aplicaciones?ofertaId=${oferta.id}`).then(r => r.json())
    setCandidatos(data)
  }

  const aplicar = async (ofertaId: string) => {
    setAplicando(ofertaId)
    await fetch('/api/aplicaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: usuario?.id, ofertaId })
    })
    setYaAplico(prev => new Set([...prev, ofertaId]))
    setAplicando(null)
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1 flex flex-col gap-3">
        {ofertas.map((o, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e0dfdc] p-5 hover:shadow-sm transition-shadow">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#eef3f8] flex items-center justify-center text-2xl flex-shrink-0">🏢</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{o.titulo}</h3>
                <p className="text-sm text-[#00000099]">{o.empresa}</p>
                <p className="text-sm text-emerald-600 font-medium">{o.salario}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {o.habilidades?.map((h: string, j: number) => (
                    <span key={j} className="bg-[#eef3f8] text-[#0a66c2] text-xs px-2 py-0.5 rounded-full">{h}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                {yaAplico.has(o.id)
                  ? <span className="text-xs text-emerald-600 border border-emerald-300 px-3 py-1.5 rounded-full text-center">✓ Aplicado</span>
                  : <button
                      onClick={() => aplicar(o.id)}
                      disabled={aplicando === o.id}
                      className="bg-[#0a66c2] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#004182] transition-colors disabled:opacity-50"
                    >
                      {aplicando === o.id ? '...' : 'Aplicar'}
                    </button>
                }
                <button
                  onClick={() => verCandidatos(o)}
                  className="border border-[#c0c0c0] text-[#00000099] text-xs px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors text-center"
                >
                  Ver candidatos
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Panel candidatos */}
      {ofertaSeleccionada && (
        <aside className="w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#e0dfdc] p-4 sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Candidatos · {candidatos.length}</h3>
              <button onClick={() => setOfertaSeleccionada(null)} className="text-[#00000099] hover:text-black">✕</button>
            </div>
            <p className="text-xs text-[#00000099] mb-4">{ofertaSeleccionada.titulo}</p>
            {candidatos.length === 0
              ? <p className="text-sm text-[#00000099] text-center py-4">Sin candidatos aún</p>
              : candidatos.map((c, i) => (
                <div key={i} className="flex items-center gap-3 mb-3 pb-3 border-b border-[#e0dfdc] last:border-0 last:mb-0 last:pb-0">
                  {c.foto
                    ? <img src={c.foto} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    : <div className="w-9 h-9 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{c.nombre[0]}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{c.nombre}</p>
                    <p className="text-xs text-[#00000099] truncate">{c.cargo}</p>
                    <p className="text-xs text-[#00000099] truncate">{c.email}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </aside>
      )}
    </div>
  )
}
