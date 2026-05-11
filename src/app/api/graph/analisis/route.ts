import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

// Consulta 1: Usuarios con habilidades similares
async function habilidadesSimilares(usuarioId: string) {
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (u:Usuario {id: $usuarioId})-[:TIENE_HABILIDAD]->(h:Habilidad)<-[:TIENE_HABILIDAD]-(otro:Usuario)
      WHERE otro.id <> $usuarioId
      RETURN otro.nombre AS nombre, otro.cargo AS cargo, otro.id AS id, otro.foto AS foto,
             collect(h.nombre) AS habilidadesComunes, count(h) AS total
      ORDER BY total DESC
    `, { usuarioId })
    return result.records.map(r => ({
      nombre: r.get('nombre'),
      cargo: r.get('cargo'),
      id: r.get('id'),
      foto: r.get('foto'),
      habilidadesComunes: r.get('habilidadesComunes'),
      total: r.get('total').toNumber()
    }))
  } finally {
    await session.close()
  }
}

// Consulta 2: Ruta más corta entre usuario y empresa
async function rutaUsuarioEmpresa(usuarioId: string, empresaNombre: string) {
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (u:Usuario {id: $usuarioId}), (e:Empresa {nombre: $empresaNombre})
      MATCH p = shortestPath((u)-[*..6]-(e))
      RETURN [n IN nodes(p) | 
        CASE 
          WHEN n:Usuario THEN n.nombre
          WHEN n:Empresa THEN n.nombre
          WHEN n:Habilidad THEN n.nombre
          WHEN n:Proyecto THEN n.nombre
          WHEN n:Oferta THEN n.titulo
          ELSE 'Nodo'
        END
      ] AS camino,
      [n IN nodes(p) |
        CASE
          WHEN n:Usuario THEN 'usuario'
          WHEN n:Empresa THEN 'empresa'
          WHEN n:Habilidad THEN 'habilidad'
          WHEN n:Proyecto THEN 'proyecto'
          WHEN n:Oferta THEN 'oferta'
          ELSE 'otro'
        END
      ] AS tipos,
      length(p) AS pasos
    `, { usuarioId, empresaNombre })
    if (result.records.length === 0) return { encontrado: false }
    return {
      encontrado: true,
      camino: result.records[0].get('camino'),
      tipos: result.records[0].get('tipos'),
      pasos: result.records[0].get('pasos').toNumber()
    }
  } finally {
    await session.close()
  }
}

// Consulta 3: Ruta más corta entre dos usuarios
async function rutaEntreUsuarios(usuarioId1: string, usuarioId2: string) {
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (u1:Usuario {id: $usuarioId1}), (u2:Usuario {id: $usuarioId2})
      MATCH p = shortestPath((u1)-[:CONECTA_CON*]-(u2))
      RETURN [n IN nodes(p) | n.nombre] AS camino, length(p) AS pasos
    `, { usuarioId1, usuarioId2 })
    if (result.records.length === 0) return { encontrado: false }
    return {
      encontrado: true,
      camino: result.records[0].get('camino'),
      pasos: result.records[0].get('pasos').toNumber()
    }
  } catch {
    return { encontrado: false }
  } finally {
    await session.close()
  }
}

// Consulta 4: Contactos en común entre dos usuarios
async function contactosEnComun(usuarioId1: string, usuarioId2: string) {
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (u1:Usuario {id: $usuarioId1})-[:CONECTA_CON]-(comun:Usuario)-[:CONECTA_CON]-(u2:Usuario {id: $usuarioId2})
      WHERE u1 <> u2
      RETURN comun.nombre AS nombre, comun.cargo AS cargo, comun.id AS id, comun.foto AS foto
    `, { usuarioId1, usuarioId2 })
    return result.records.map(r => ({
      nombre: r.get('nombre'),
      cargo: r.get('cargo'),
      id: r.get('id'),
      foto: r.get('foto')
    }))
  } finally {
    await session.close()
  }
}

// Consulta 5: Candidatos recomendados para una oferta (por habilidades Y conexiones)
async function candidatosParaOferta(ofertaId: string) {
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (o:Oferta {id: $ofertaId})-[:REQUIERE]->(h:Habilidad)<-[:TIENE_HABILIDAD]-(u:Usuario)
      WITH u, collect(h.nombre) AS habilidadesMatch, count(h) AS matchHabilidades
      OPTIONAL MATCH (u)-[:CONECTA_CON*..2]-(cercano:Usuario)-[:APLICO_A]->(o)
      RETURN u.nombre AS nombre, u.cargo AS cargo, u.id AS id, u.foto AS foto,
             habilidadesMatch, matchHabilidades,
             count(DISTINCT cercano) AS conexionesCercanas
      ORDER BY matchHabilidades DESC, conexionesCercanas DESC
    `, { ofertaId })
    return result.records.map(r => ({
      nombre: r.get('nombre'),
      cargo: r.get('cargo'),
      id: r.get('id'),
      foto: r.get('foto'),
      habilidadesMatch: r.get('habilidadesMatch'),
      matchHabilidades: r.get('matchHabilidades').toNumber(),
      conexionesCercanas: r.get('conexionesCercanas').toNumber()
    }))
  } finally {
    await session.close()
  }
}

// Consulta 6: Proyectos con tecnologías o miembros relacionados
async function proyectosRelacionados(proyectoNombre: string) {
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (p1:Proyecto {nombre: $proyectoNombre})
      MATCH (p2:Proyecto) WHERE p2.nombre <> $proyectoNombre
      OPTIONAL MATCH (u:Usuario)-[:PARTICIPA_EN]->(p1)
      OPTIONAL MATCH (u)-[:PARTICIPA_EN]->(p2)
      WITH p1, p2, collect(DISTINCT u.nombre) AS miembrosComunes
      WHERE size(miembrosComunes) > 0 OR 
            any(t IN p1.tecnologias WHERE t IN p2.tecnologias)
      RETURN p2.nombre AS proyecto, p2.tecnologias AS tecnologias,
             miembrosComunes,
             [t IN p1.tecnologias WHERE t IN p2.tecnologias] AS tecnologiasComunes
    `, { proyectoNombre })
    return result.records.map(r => ({
      proyecto: r.get('proyecto'),
      tecnologias: r.get('tecnologias'),
      miembrosComunes: r.get('miembrosComunes'),
      tecnologiasComunes: r.get('tecnologiasComunes')
    }))
  } finally {
    await session.close()
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const { tipo, ...params } = body
  try {
    switch (tipo) {
      case 'habilidades_similares':
        return NextResponse.json(await habilidadesSimilares(params.usuarioId))
      case 'ruta_usuario_empresa':
        return NextResponse.json(await rutaUsuarioEmpresa(params.usuarioId, params.empresaNombre))
      case 'ruta_entre_usuarios':
        return NextResponse.json(await rutaEntreUsuarios(params.usuarioId1, params.usuarioId2))
      case 'contactos_en_comun':
        return NextResponse.json(await contactosEnComun(params.usuarioId1, params.usuarioId2))
      case 'candidatos_para_oferta':
        return NextResponse.json(await candidatosParaOferta(params.ofertaId))
      case 'proyectos_relacionados':
        return NextResponse.json(await proyectosRelacionados(params.proyectoNombre))
      default:
        return NextResponse.json({ error: 'Tipo de análisis no válido' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
