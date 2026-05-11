'use client'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/AuthContext'

interface Props {
  usuarioId?: string  // si es undefined, muestra el perfil propio
  onVerConexion?: (id: string) => void
}

export default function PerfilCompleto({ usuarioId, onVerConexion }: Props) {
  const { usuario, login } = useAuth()
  const id = usuarioId || usuario?.id
  const esMiPerfil = !usuarioId || usuarioId === usuario?.id

  const [perfil, setPerfil] = useState<any>(null)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState<any>({})
  const [nuevaHabilidad, setNuevaHabilidad] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [aplicando, setAplicando] = useState<string | null>(null)
  const [yaAplico, setYaAplico] = useState<Set<string>>(new Set())
  const [empresas, setEmpresas] = useState<any[]>([])
  const [empresaId, setEmpresaId] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  const cargar = async () => {
    const [data, listaEmpresas] = await Promise.all([
      fetch(`/api/perfil?id=${id}`).then(r => r.json()),
      fetch('/api/empresas').then(r => r.json()),
    ])
    setPerfil(data)
    setEmpresas(listaEmpresas)
    setEmpresaId(data.empresa?.id || '')
    setForm({
      nombre: data.nombre || '',
      cargo: data.cargo || '',
      email: data.email || '',
      about: data.about || '',
      ubicacion: data.ubicacion || '',
      foto: data.foto || '',
      habilidades: data.habilidades || [],
      experiencias: data.experiencias || [],
    })
    setYaAplico(new Set(data.aplicaciones?.map((a: any) => a.ofertaId) || []))
  }

  useEffect(() => { if (id) cargar() }, [id])

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((f: any) => ({ ...f, foto: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const agregarHabilidad = () => {
    if (!nuevaHabilidad.trim()) return
    setForm((f: any) => ({ ...f, habilidades: [...f.habilidades, nuevaHabilidad.trim()] }))
    setNuevaHabilidad('')
  }

  const quitarHabilidad = (h: string) => {
    setForm((f: any) => ({ ...f, habilidades: f.habilidades.filter((x: string) => x !== h) }))
  }

  const agregarExperiencia = () => {
    setForm((f: any) => ({
      ...f,
      experiencias: [...f.experiencias, { cargo: '', empresa: '', inicio: '', fin: '', descripcion: '' }]
    }))
  }

  const updateExp = (i: number, field: string, val: string) => {
    setForm((f: any) => {
      const exps = [...f.experiencias]
      exps[i] = { ...exps[i], [field]: val }
      return { ...f, experiencias: exps }
    })
  }

  const quitarExp = (i: number) => {
    setForm((f: any) => ({ ...f, experiencias: f.experiencias.filter((_: any, j: number) => j !== i) }))
  }

  const guardar = async () => {
    setGuardando(true)
    await fetch('/api/perfil/actualizar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...form, empresaId })
    })
    if (esMiPerfil) login({ ...usuario!, nombre: form.nombre, email: form.email, cargo: form.cargo })
    await cargar()
    setEditando(false)
    setGuardando(false)
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

  if (!perfil) return <div className="text-center py-16 text-[#00000099]">Cargando perfil...</div>

  const Avatar = ({ size = 'md', foto, nombre }: { size?: 'sm'|'md'|'lg', foto?: string, nombre: string }) => {
    const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-12 h-12 text-lg', lg: 'w-24 h-24 text-4xl' }
    return foto
      ? <img src={foto} className={`${sizes[size]} rounded-full object-cover border-4 border-white flex-shrink-0`} />
      : <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] border-4 border-white flex items-center justify-center text-white font-bold flex-shrink-0`}>{nombre[0]}</div>
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1 flex flex-col gap-3 min-w-0">

        {/* Header */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[#0a66c2] to-[#004182] relative">
            {esMiPerfil && editando && (
              <button className="absolute bottom-2 right-2 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-full">
                Cambiar portada
              </button>
            )}
          </div>
          <div className="px-6 pb-5 -mt-12">
            <div className="flex items-end justify-between mb-3">
              <div className="relative">
                <Avatar size="lg" foto={editando ? form.foto : perfil.foto} nombre={perfil.nombre} />
                {esMiPerfil && editando && (
                  <>
                    <button onClick={() => fileRef.current?.click()} className="absolute bottom-1 right-1 w-7 h-7 bg-[#0a66c2] rounded-full flex items-center justify-center text-white text-xs hover:bg-[#004182]">✏️</button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                  </>
                )}
              </div>
              {esMiPerfil && (
                <div className="flex gap-2 pb-1">
                  {editando ? (
                    <>
                      <button onClick={() => setEditando(false)} className="border border-[#c0c0c0] text-sm px-4 py-1.5 rounded-full hover:bg-gray-50">Cancelar</button>
                      <button onClick={guardar} disabled={guardando} className="bg-[#0a66c2] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#004182] disabled:opacity-50">{guardando ? 'Guardando...' : 'Guardar'}</button>
                    </>
                  ) : (
                    <button onClick={() => setEditando(true)} className="border border-[#0a66c2] text-[#0a66c2] text-sm px-4 py-1.5 rounded-full hover:bg-[#eef3f8]">Editar perfil</button>
                  )}
                </div>
              )}
            </div>

            {editando ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#00000099] block mb-1">Nombre</label>
                    <input className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]" value={form.nombre} onChange={e => setForm((f: any) => ({ ...f, nombre: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-[#00000099] block mb-1">Cargo</label>
                    <input className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]" value={form.cargo} onChange={e => setForm((f: any) => ({ ...f, cargo: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-[#00000099] block mb-1">Email</label>
                    <input className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-[#00000099] block mb-1">Ubicación</label>
                    <input className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]" value={form.ubicacion} onChange={e => setForm((f: any) => ({ ...f, ubicacion: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#00000099] block mb-1">Sobre mí</label>
                  <textarea rows={3} className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2] resize-none" value={form.about} onChange={e => setForm((f: any) => ({ ...f, about: e.target.value }))} placeholder="Cuéntanos sobre ti..." />
                </div>
                <div>
                  <label className="text-xs text-[#00000099] block mb-1">Empresa actual</label>
                  <select
                    className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2] bg-white"
                    value={empresaId}
                    onChange={e => setEmpresaId(e.target.value)}
                  >
                    <option value="">Sin empresa</option>
                    {empresas.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{perfil.nombre}</h2>
                <p className="text-[#00000099]">{perfil.cargo}</p>
                {perfil.empresa && (
                  <p className="text-sm text-[#00000099] flex items-center gap-1 mt-1">
                    🏢 {perfil.empresa.nombre}
                  </p>
                )}
                {perfil.ubicacion && <p className="text-sm text-[#00000099]">📍 {perfil.ubicacion}</p>}
                <p className="text-sm text-[#00000099]">{perfil.email}</p>
                <div className="flex gap-3 mt-2 text-sm">
                  <span className="text-[#0a66c2] font-semibold cursor-pointer hover:underline">{perfil.conexiones?.length || 0} conexiones</span>
                </div>
                {perfil.about && <p className="mt-3 text-sm text-[#000000e6] leading-relaxed">{perfil.about}</p>}
              </>
            )}
          </div>
        </div>

        {/* Habilidades */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
          <h3 className="font-semibold mb-3">Habilidades</h3>
          {editando ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.habilidades.map((h: string, i: number) => (
                  <span key={i} className="flex items-center gap-1 bg-[#eef3f8] text-[#0a66c2] text-sm px-3 py-1 rounded-full">
                    {h}
                    <button onClick={() => quitarHabilidad(h)} className="text-[#0a66c2] hover:text-red-500 ml-1 font-bold">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]"
                  placeholder="Agregar habilidad..."
                  value={nuevaHabilidad}
                  onChange={e => setNuevaHabilidad(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && agregarHabilidad()}
                />
                <button onClick={agregarHabilidad} className="bg-[#0a66c2] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#004182]">+ Agregar</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {perfil.habilidades?.length === 0
                ? <p className="text-sm text-[#00000099]">Sin habilidades registradas</p>
                : perfil.habilidades?.map((h: string, i: number) => (
                  <span key={i} className="bg-[#eef3f8] text-[#0a66c2] text-sm px-3 py-1.5 rounded-full font-medium">{h}</span>
                ))
              }
            </div>
          )}
        </div>

        {/* Experiencia */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Experiencia</h3>
            {esMiPerfil && editando && (
              <button onClick={agregarExperiencia} className="text-[#0a66c2] text-sm hover:underline">+ Agregar</button>
            )}
          </div>
          {editando ? (
            <div className="flex flex-col gap-4">
              {form.experiencias.map((exp: any, i: number) => (
                <div key={i} className="border border-[#e0dfdc] rounded-xl p-4 relative">
                  <button onClick={() => quitarExp(i)} className="absolute top-3 right-3 text-[#00000099] hover:text-red-500">✕</button>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#00000099] block mb-1">Cargo</label>
                      <input className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]" value={exp.cargo} onChange={e => updateExp(i, 'cargo', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-[#00000099] block mb-1">Empresa</label>
                      <input className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]" value={exp.empresa} onChange={e => updateExp(i, 'empresa', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-[#00000099] block mb-1">Inicio</label>
                      <input type="month" className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]" value={exp.inicio} onChange={e => updateExp(i, 'inicio', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-[#00000099] block mb-1">Fin (vacío = actual)</label>
                      <input type="month" className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]" value={exp.fin} onChange={e => updateExp(i, 'fin', e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-xs text-[#00000099] block mb-1">Descripción</label>
                    <textarea rows={2} className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2] resize-none" value={exp.descripcion} onChange={e => updateExp(i, 'descripcion', e.target.value)} />
                  </div>
                </div>
              ))}
              {form.experiencias.length === 0 && <p className="text-sm text-[#00000099]">Sin experiencias. Haz clic en + Agregar.</p>}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#e0dfdc]">
              {perfil.experiencias?.length === 0
                ? <p className="text-sm text-[#00000099]">Sin experiencia registrada</p>
                : perfil.experiencias?.map((exp: any, i: number) => (
                  <div key={i} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded bg-[#eef3f8] flex items-center justify-center text-lg flex-shrink-0">🏢</div>
                      <div>
                        <p className="font-semibold text-sm">{exp.cargo}</p>
                        <p className="text-sm text-[#00000099]">{exp.empresa}</p>
                        <p className="text-xs text-[#00000099]">{exp.inicio} — {exp.fin || 'Actualidad'}</p>
                        {exp.descripcion && <p className="text-sm mt-1 text-[#000000e6]">{exp.descripcion}</p>}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* Proyectos */}
        {perfil.proyectos?.length > 0 && (
          <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
            <h3 className="font-semibold mb-3">Proyectos</h3>
            <div className="flex flex-col divide-y divide-[#e0dfdc]">
              {perfil.proyectos.map((p: any, i: number) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-medium text-sm">{p.nombre}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.tecnologias?.map((t: string, j: number) => (
                      <span key={j} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conexiones */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
          <h3 className="font-semibold mb-3">Conexiones · {perfil.conexiones?.length || 0}</h3>
          <div className="grid grid-cols-2 gap-3">
            {perfil.conexiones?.map((c: any, i: number) => (
              <button
                key={i}
                onClick={() => onVerConexion?.(c.id)}
                className="flex items-center gap-3 p-3 border border-[#e0dfdc] rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                {c.foto
                  ? <img src={c.foto} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-9 h-9 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{c.nombre[0]}</div>
                }
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{c.nombre}</p>
                  <p className="text-xs text-[#00000099] truncate">{c.cargo}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ofertas recomendadas */}
        {perfil.ofertas?.length > 0 && (
          <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
            <h3 className="font-semibold mb-3">Ofertas recomendadas para ti</h3>
            <div className="flex flex-col divide-y divide-[#e0dfdc]">
              {perfil.ofertas.map((o: any, i: number) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0 flex gap-3 items-start">
                  <div className="w-10 h-10 rounded bg-[#eef3f8] flex items-center justify-center text-lg flex-shrink-0">🏢</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{o.titulo}</p>
                    <p className="text-xs text-[#00000099]">{o.empresa}</p>
                    <p className="text-xs text-emerald-600 font-medium">{o.salario}</p>
                    <p className="text-xs text-[#0a66c2] mt-0.5">{o.match} habilidad(es) coinciden</p>
                  </div>
                  {esMiPerfil && (
                    yaAplico.has(o.ofertaId)
                      ? <span className="text-xs text-emerald-600 border border-emerald-300 px-3 py-1.5 rounded-full flex-shrink-0">✓ Aplicado</span>
                      : <button
                          onClick={() => aplicar(o.ofertaId)}
                          disabled={aplicando === o.ofertaId}
                          className="text-[#0a66c2] border border-[#0a66c2] text-xs px-3 py-1.5 rounded-full hover:bg-[#eef3f8] transition-colors flex-shrink-0 disabled:opacity-50"
                        >
                          {aplicando === o.ofertaId ? '...' : 'Aplicar'}
                        </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mis aplicaciones */}
        {esMiPerfil && perfil.aplicaciones?.length > 0 && (
          <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
            <h3 className="font-semibold mb-3">Mis aplicaciones · {perfil.aplicaciones.length}</h3>
            <div className="flex flex-col divide-y divide-[#e0dfdc]">
              {perfil.aplicaciones.map((a: any, i: number) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-[#eef3f8] flex items-center justify-center text-base flex-shrink-0">💼</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{a.titulo}</p>
                    <p className="text-xs text-[#00000099]">{a.empresa} · {a.salario}</p>
                  </div>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Aplicado</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
