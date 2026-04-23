'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'

type Consulta = 'habilidades_similares' | 'ruta_usuario_empresa' | 'ruta_entre_usuarios' | 'contactos_en_comun' | 'candidatos_para_oferta' | 'proyectos_relacionados'

const consultas = [
  { id: 'habilidades_similares', titulo: 'Usuarios con habilidades similares', descripcion: 'Encuentra profesionales con competencias parecidas a las tuyas', icono: '⚡' },
  { id: 'ruta_entre_usuarios', titulo: 'Ruta entre dos usuarios', descripcion: 'Camino más corto en la red entre dos profesionales', icono: '🔗' },
  { id: 'ruta_usuario_empresa', titulo: 'Ruta a una empresa', descripcion: 'Cómo estás conectado con una empresa a través del grafo', icono: '🏢' },
  { id: 'contactos_en_comun', titulo: 'Contactos en común', descripcion: 'Conexiones compartidas entre dos profesionales', icono: '🤝' },
  { id: 'candidatos_para_oferta', titulo: 'Candidatos para una oferta', descripcion: 'Mejores candidatos según habilidades y conexiones en el grafo', icono: '💼' },
  { id: 'proyectos_relacionados', titulo: 'Proyectos relacionados', descripcion: 'Proyectos que comparten tecnologías o miembros', icono: '📁' },
]

const tipoColor: Record<string, string> = {
  usuario: 'bg-violet-100 text-violet-700 border-violet-200',
  empresa: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  habilidad: 'bg-amber-100 text-amber-700 border-amber-200',
  proyecto: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  oferta: 'bg-rose-100 text-rose-700 border-rose-200',
}

export default function AnalisisRed() {
  const { usuario } = useAuth()
  const [consultaActiva, setConsultaActiva] = useState<Consulta>('habilidades_similares')
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [ofertas, setOfertas] = useState<any[]>([])
  const [proyectos, setProyectos] = useState<any[]>([])
  const [resultado, setResultado] = useState<any>(null)
  const [cargando, setCargando] = useState(false)
  const [params, setParams] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/usuarios').then(r => r.json()),
      fetch('/api/empresas').then(r => r.json()),
      fetch('/api/ofertas').then(r => r.json()),
    ]).then(([u, e, o]) => {
      setUsuarios(u)
      setEmpresas(e)
      setOfertas(o)
      // Extraer proyectos únicos de usuarios
      fetch('/api/proyectos').then(r => r.json()).then(setProyectos).catch(() => {})
    })
    // Params por defecto
    if (usuario) setParams({ usuarioId: usuario.id })
  }, [usuario])

  useEffect(() => {
    setResultado(null)
    if (usuario) setParams({ usuarioId: usuario.id })
  }, [consultaActiva])

  const ejecutar = async () => {
    setCargando(true)
    setResultado(null)
    const body = { tipo: consultaActiva, ...params }
    const res = await fetch('/api/analisis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    setResultado(data)
    setCargando(false)
  }

  const Avatar = ({ u }: { u: any }) => u.foto
    ? <img src={u.foto} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
    : <div className="w-9 h-9 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{u.nombre?.[0] || '?'}</div>

  const renderParams = () => {
    const select = (label: string, key: string, lista: any[], labelKey = 'nombre', valueKey = 'id') => (
      <div key={key}>
        <label className="text-xs text-[#00000099] block mb-1">{label}</label>
        <select
          className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2] bg-white"
          value={params[key] || ''}
          onChange={e => setParams(p => ({ ...p, [key]: e.target.value }))}
        >
          <option value="">Seleccionar...</option>
          {lista.map((item, i) => (
            <option key={i} value={item[valueKey]}>{item[labelKey]}</option>
          ))}
        </select>
      </div>
    )

    switch (consultaActiva) {
      case 'habilidades_similares':
        return select('Usuario base', 'usuarioId', usuarios)
      case 'ruta_entre_usuarios':
        return (
          <div className="grid grid-cols-2 gap-3">
            {select('Desde', 'usuarioId1', usuarios)}
            {select('Hasta', 'usuarioId2', usuarios)}
          </div>
        )
      case 'ruta_usuario_empresa':
        return (
          <div className="grid grid-cols-2 gap-3">
            {select('Usuario', 'usuarioId', usuarios)}
            {select('Empresa', 'empresaNombre', empresas, 'nombre', 'nombre')}
          </div>
        )
      case 'contactos_en_comun':
        return (
          <div className="grid grid-cols-2 gap-3">
            {select('Profesional 1', 'usuarioId1', usuarios)}
            {select('Profesional 2', 'usuarioId2', usuarios)}
          </div>
        )
      case 'candidatos_para_oferta':
        return select('Oferta laboral', 'ofertaId', ofertas, 'titulo', 'id')
      case 'proyectos_relacionados':
        return select('Proyecto', 'proyectoNombre', proyectos, 'nombre', 'nombre')
    }
  }

  const renderResultado = () => {
    if (!resultado) return null

    // Ruta (camino)
    if (resultado.encontrado !== undefined) {
      if (!resultado.encontrado) return (
        <div className="text-center py-6 text-[#00000099] text-sm">No existe camino entre estos nodos en el grafo.</div>
      )
      return (
        <div>
          <p className="text-xs text-[#00000099] uppercase font-semibold mb-4">
            Ruta encontrada · {resultado.pasos} paso(s)
          </p>
          <div className="flex items-center flex-wrap gap-2">
            {resultado.camino.map((nodo: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${tipoColor[resultado.tipos?.[i] || 'usuario'] || 'bg-gray-100 text-gray-700'}`}>
                  {nodo}
                </span>
                {i < resultado.camino.length - 1 && (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#00000099] flex-shrink-0" fill="currentColor">
                    <path d="M8 5l8 7-8 7"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4 flex-wrap">
            {Object.entries(tipoColor).map(([tipo, cls]) => (
              <span key={tipo} className={`text-xs px-2 py-0.5 rounded border ${cls}`}>{tipo}</span>
            ))}
          </div>
        </div>
      )
    }

    // Lista de usuarios (habilidades similares, contactos en común)
    if (Array.isArray(resultado) && resultado[0]?.habilidadesComunes !== undefined) {
      if (resultado.length === 0) return <div className="text-center py-6 text-[#00000099] text-sm">No se encontraron usuarios con habilidades similares.</div>
      return (
        <div className="flex flex-col gap-3">
          {resultado.map((u: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-[#e0dfdc] rounded-xl">
              <Avatar u={u} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{u.nombre}</p>
                <p className="text-xs text-[#00000099]">{u.cargo}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {u.habilidadesComunes.map((h: string, j: number) => (
                    <span key={j} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full">{h}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-[#0a66c2]">{u.total}</p>
                <p className="text-xs text-[#00000099]">habilidades</p>
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Candidatos para oferta
    if (Array.isArray(resultado) && resultado[0]?.matchHabilidades !== undefined) {
      if (resultado.length === 0) return <div className="text-center py-6 text-[#00000099] text-sm">No se encontraron candidatos para esta oferta.</div>
      return (
        <div className="flex flex-col gap-3">
          {resultado.map((u: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-[#e0dfdc] rounded-xl">
              <div className="w-8 h-8 bg-[#0a66c2] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {i + 1}
              </div>
              <Avatar u={u} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{u.nombre}</p>
                <p className="text-xs text-[#00000099] mb-1">{u.cargo}</p>
                <div className="flex flex-wrap gap-1">
                  {u.habilidadesMatch.map((h: string, j: number) => (
                    <span key={j} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-full">{h}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex gap-3">
                  <div>
                    <p className="text-base font-bold text-emerald-600">{u.matchHabilidades}</p>
                    <p className="text-xs text-[#00000099]">habilidades</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#0a66c2]">{u.conexionesCercanas}</p>
                    <p className="text-xs text-[#00000099]">conexiones</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Contactos en común
    if (Array.isArray(resultado) && resultado[0]?.nombre !== undefined && resultado[0]?.habilidadesComunes === undefined) {
      if (resultado.length === 0) return <div className="text-center py-6 text-[#00000099] text-sm">No hay contactos en común.</div>
      return (
        <div className="grid grid-cols-2 gap-3">
          {resultado.map((u: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-[#e0dfdc] rounded-xl">
              <Avatar u={u} />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{u.nombre}</p>
                <p className="text-xs text-[#00000099] truncate">{u.cargo}</p>
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Proyectos relacionados
    if (Array.isArray(resultado) && resultado[0]?.tecnologiasComunes !== undefined) {
      if (resultado.length === 0) return <div className="text-center py-6 text-[#00000099] text-sm">No se encontraron proyectos relacionados.</div>
      return (
        <div className="flex flex-col gap-3">
          {resultado.map((p: any, i: number) => (
            <div key={i} className="p-4 border border-[#e0dfdc] rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-lg flex-shrink-0">📁</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{p.proyecto}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.tecnologias?.map((t: string, j: number) => (
                      <span key={j} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                  {p.tecnologiasComunes?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-[#00000099] mb-1">Tecnologías en común:</p>
                      <div className="flex flex-wrap gap-1">
                        {p.tecnologiasComunes.map((t: string, j: number) => (
                          <span key={j} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {p.miembrosComunes?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-[#00000099]">Miembros en común: {p.miembrosComunes.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return <pre className="text-xs text-gray-500">{JSON.stringify(resultado, null, 2)}</pre>
  }

  const consultaInfo = consultas.find(c => c.id === consultaActiva)!

  return (
    <div className="flex gap-4">
      {/* Sidebar con consultas */}
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white rounded-xl border border-[#e0dfdc] overflow-hidden">
          <div className="p-4 border-b border-[#e0dfdc]">
            <h3 className="font-semibold text-sm">Consultas del grafo</h3>
            <p className="text-xs text-[#00000099] mt-0.5">Análisis de la red profesional</p>
          </div>
          <div className="flex flex-col">
            {consultas.map(c => (
              <button
                key={c.id}
                onClick={() => setConsultaActiva(c.id as Consulta)}
                className={`flex items-start gap-3 px-4 py-3 text-left border-b border-[#e0dfdc] last:border-0 transition-colors ${
                  consultaActiva === c.id ? 'bg-[#eef3f8] border-l-2 border-l-[#0a66c2]' : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{c.icono}</span>
                <div className="min-w-0">
                  <p className={`text-xs font-medium leading-tight ${consultaActiva === c.id ? 'text-[#0a66c2]' : 'text-[#000000e6]'}`}>{c.titulo}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Panel principal */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Header */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">{consultaInfo.icono}</span>
            <div>
              <h2 className="font-bold text-lg">{consultaInfo.titulo}</h2>
              <p className="text-sm text-[#00000099]">{consultaInfo.descripcion}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {renderParams()}
            <button
              onClick={ejecutar}
              disabled={cargando}
              className="self-start bg-[#0a66c2] hover:bg-[#004182] text-white font-semibold px-6 py-2 rounded-full transition-colors disabled:opacity-50 text-sm"
            >
              {cargando ? 'Analizando grafo...' : 'Ejecutar consulta'}
            </button>
          </div>
        </div>

        {/* Resultado */}
        {(resultado !== null || cargando) && (
          <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0a66c2]"></span>
              Resultado
            </h3>
            {cargando
              ? <div className="text-center py-8 text-[#00000099] text-sm">Ejecutando consulta en Neo4j...</div>
              : renderResultado()
            }
          </div>
        )}

        {/* Cypher info */}
        <div className="bg-white rounded-xl border border-[#e0dfdc] p-5">
          <h3 className="font-semibold text-sm mb-2 text-[#00000099]">Consulta Cypher ejecutada</h3>
          <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-600 leading-relaxed">
            {consultaActiva === 'habilidades_similares' && `MATCH (u:Usuario {id: $usuarioId})-[:TIENE_HABILIDAD]->(h:Habilidad)
  <-[:TIENE_HABILIDAD]-(otro:Usuario)
WHERE otro.id <> $usuarioId
RETURN otro.nombre, collect(h.nombre) AS habilidadesComunes,
       count(h) AS total
ORDER BY total DESC`}
            {consultaActiva === 'ruta_entre_usuarios' && `MATCH (u1:Usuario {id: $usuarioId1}),
      (u2:Usuario {id: $usuarioId2})
MATCH p = shortestPath((u1)-[:CONECTA_CON*]-(u2))
RETURN [n IN nodes(p) | n.nombre] AS camino,
       length(p) AS pasos`}
            {consultaActiva === 'ruta_usuario_empresa' && `MATCH (u:Usuario {id: $usuarioId}),
      (e:Empresa {nombre: $empresaNombre})
MATCH p = shortestPath((u)-[*..6]-(e))
RETURN [n IN nodes(p) | n.nombre] AS camino,
       length(p) AS pasos`}
            {consultaActiva === 'contactos_en_comun' && `MATCH (u1:Usuario {id: $usuarioId1})
  -[:CONECTA_CON]-(comun:Usuario)
  -[:CONECTA_CON]-(u2:Usuario {id: $usuarioId2})
WHERE u1 <> u2
RETURN comun.nombre, comun.cargo`}
            {consultaActiva === 'candidatos_para_oferta' && `MATCH (o:Oferta {id: $ofertaId})
  -[:REQUIERE]->(h:Habilidad)
  <-[:TIENE_HABILIDAD]-(u:Usuario)
WITH u, collect(h.nombre) AS habilidadesMatch, count(h) AS matchH
OPTIONAL MATCH (u)-[:CONECTA_CON*..2]-(c:Usuario)-[:APLICO_A]->(o)
RETURN u.nombre, habilidadesMatch, matchH,
       count(DISTINCT c) AS conexionesCercanas
ORDER BY matchH DESC`}
            {consultaActiva === 'proyectos_relacionados' && `MATCH (p1:Proyecto {nombre: $proyectoNombre})
MATCH (p2:Proyecto) WHERE p2.nombre <> $proyectoNombre
OPTIONAL MATCH (u:Usuario)-[:PARTICIPA_EN]->(p1)
OPTIONAL MATCH (u)-[:PARTICIPA_EN]->(p2)
WITH p1, p2, collect(DISTINCT u.nombre) AS miembrosComunes
WHERE size(miembrosComunes) > 0 OR
      any(t IN p1.tecnologias WHERE t IN p2.tecnologias)
RETURN p2.nombre, p2.tecnologias, miembrosComunes,
       [t IN p1.tecnologias WHERE t IN p2.tecnologias] AS tecnologiasComunes`}
          </div>
        </div>
      </div>
    </div>
  )
}
