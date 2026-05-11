'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'

export default function Empresas() {
  const { usuario } = useAuth()
  const [empresas, setEmpresas] = useState<any[]>([])
  const [seleccionada, setSeleccionada] = useState<any>(null)
  const [ofertas, setOfertas] = useState<any[]>([])
  const [candidatos, setCandidatos] = useState<Record<string, any[]>>({})
  const [creando, setCreando] = useState(false)
  const [formOferta, setFormOferta] = useState({ titulo: '', salario: '', habilidades: '' })
  const [nuevaEmpresa, setNuevaEmpresa] = useState(false)
  const [formEmpresa, setFormEmpresa] = useState({ nombre: '', sector: '' })

  useEffect(() => {
    fetch('/api/empresas').then(r => r.json()).then(setEmpresas)
  }, [])

  const verEmpresa = async (e: any) => {
    setSeleccionada(e)
    const data = await fetch('/api/ofertas').then(r => r.json())
    const deEmpresa = data.filter((o: any) => o.empresa === e.nombre)
    setOfertas(deEmpresa)
    const cands: Record<string, any[]> = {}
    for (const o of deEmpresa) {
      const c = await fetch(`/api/aplicaciones?ofertaId=${o.id}`).then(r => r.json())
      cands[o.id] = c
    }
    setCandidatos(cands)
  }

  const crearOferta = async () => {
    if (!formOferta.titulo || !seleccionada) return
    setCreando(true)
    const res = await fetch('/api/ofertas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: formOferta.titulo, salario: formOferta.salario, empresaId: seleccionada.id })
    })
    setFormOferta({ titulo: '', salario: '', habilidades: '' })
    setCreando(false)
    await verEmpresa(seleccionada)
  }

  const crearEmpresa = async () => {
    if (!formEmpresa.nombre) return
    await fetch('/api/empresas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formEmpresa)
    })
    const data = await fetch('/api/empresas').then(r => r.json())
    setEmpresas(data)
    setNuevaEmpresa(false)
    setFormEmpresa({ nombre: '', sector: '' })
  }

  if (seleccionada) return (
    <div>
      <button onClick={() => setSeleccionada(null)} className="flex items-center gap-2 text-[#0a66c2] text-sm mb-4 hover:underline">
        ← Volver a empresas
      </button>
      <div className="flex flex-col gap-4">
        {/* Header empresa */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-[#0a66c2] to-[#004182]"></div>
          <div className="px-6 pb-5 -mt-8 flex items-end gap-4">
            <div className="w-16 h-16 rounded-xl bg-white border-2 border-[#e0dfdc] flex items-center justify-center text-3xl shadow-sm">🏢</div>
            <div className="pb-1">
              <h2 className="text-xl font-bold">{seleccionada.nombre}</h2>
              <p className="text-[#00000099] text-sm">{seleccionada.sector}</p>
            </div>
          </div>
        </div>

        {/* Crear oferta */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
          <h3 className="font-semibold mb-3">Publicar oferta laboral</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-[#00000099] block mb-1">Título del cargo</label>
              <input className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]"
                placeholder="Ej: Senior Developer" value={formOferta.titulo}
                onChange={e => setFormOferta(f => ({ ...f, titulo: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-[#00000099] block mb-1">Salario</label>
              <input className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]"
                placeholder="Ej: $4000" value={formOferta.salario}
                onChange={e => setFormOferta(f => ({ ...f, salario: e.target.value }))} />
            </div>
          </div>
          <button onClick={crearOferta} disabled={creando || !formOferta.titulo}
            className="bg-[#0a66c2] text-white text-sm px-5 py-2 rounded-full hover:bg-[#004182] transition-colors disabled:opacity-50">
            {creando ? 'Publicando...' : 'Publicar oferta'}
          </button>
        </div>

        {/* Ofertas con candidatos */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold">Ofertas publicadas · {ofertas.length}</h3>
          {ofertas.length === 0
            ? <div className="bg-white rounded-xl border border-[#e0dfdc] p-6 text-center text-sm text-[#00000099]">Sin ofertas publicadas</div>
            : ofertas.map((o, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#e0dfdc] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{o.titulo}</h4>
                    <p className="text-sm text-emerald-600 font-medium">{o.salario}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {o.habilidades?.map((h: string, j: number) => (
                        <span key={j} className="bg-[#eef3f8] text-[#0a66c2] text-xs px-2 py-0.5 rounded-full">{h}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Activa</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#00000099] uppercase mb-2">
                    Candidatos · {candidatos[o.id]?.length || 0}
                  </p>
                  {!candidatos[o.id]?.length
                    ? <p className="text-xs text-[#00000099]">Sin candidatos aún</p>
                    : (
                      <div className="flex flex-col gap-2">
                        {candidatos[o.id].map((c, j) => (
                          <div key={j} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            {c.foto
                              ? <img src={c.foto} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                              : <div className="w-9 h-9 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{c.nombre[0]}</div>
                            }
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{c.nombre}</p>
                              <p className="text-xs text-[#00000099]">{c.cargo} · {c.email}</p>
                            </div>
                            <button className="text-xs bg-[#0a66c2] text-white px-3 py-1 rounded-full hover:bg-[#004182] transition-colors">
                              Contactar
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Empresas</h2>
        <button onClick={() => setNuevaEmpresa(v => !v)}
          className="bg-[#0a66c2] text-white text-sm px-4 py-2 rounded-full hover:bg-[#004182] transition-colors">
          + Nueva empresa
        </button>
      </div>

      {nuevaEmpresa && (
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
          <h3 className="font-semibold mb-3">Crear empresa</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-[#00000099] block mb-1">Nombre</label>
              <input className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]"
                value={formEmpresa.nombre} onChange={e => setFormEmpresa(f => ({ ...f, nombre: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-[#00000099] block mb-1">Sector</label>
              <input className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]"
                value={formEmpresa.sector} onChange={e => setFormEmpresa(f => ({ ...f, sector: e.target.value }))} />
            </div>
          </div>
          <button onClick={crearEmpresa} className="bg-[#0a66c2] text-white text-sm px-5 py-2 rounded-full hover:bg-[#004182]">
            Crear
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {empresas.map((e, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e0dfdc] overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => verEmpresa(e)}>
            <div className="h-16 bg-gradient-to-r from-[#0a66c2] to-[#004182]"></div>
            <div className="px-4 pb-4 -mt-6">
              <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#e0dfdc] flex items-center justify-center text-2xl mb-2 shadow-sm">🏢</div>
              <p className="font-semibold text-sm">{e.nombre}</p>
              <p className="text-xs text-[#00000099]">{e.sector}</p>
              <button className="mt-3 w-full border border-[#0a66c2] text-[#0a66c2] text-xs py-1.5 rounded-full hover:bg-[#eef3f8] transition-colors">
                Ver empresa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
