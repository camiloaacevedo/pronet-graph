import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET() {
  const session = driver.session()
  try {
    const result = await session.run('MATCH (p:Proyecto) RETURN p ORDER BY p.nombre')
    return NextResponse.json(result.records.map(r => r.get('p').properties))
  } finally {
    await session.close()
  }
}

export async function POST(req: Request) {
  const { nombre, tecnologias, usuarioId } = await req.json()
  if (!nombre || !usuarioId) {
    return NextResponse.json({ error: 'nombre y usuarioId requeridos' }, { status: 400 })
  }
  const session = driver.session()
  try {
    const id = crypto.randomUUID()
    await session.run(`
      MATCH (u:Usuario {id: $usuarioId})
      CREATE (p:Proyecto {id: $id, nombre: $nombre, tecnologias: $tecnologias})
      CREATE (u)-[:PARTICIPA_EN]->(p)
    `, { id, nombre, tecnologias: tecnologias || [], usuarioId })
    return NextResponse.json({ id, nombre, tecnologias }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear proyecto' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function PUT(req: Request) {
  const { usuarioId, proyectoId } = await req.json()
  if (!usuarioId || !proyectoId) {
    return NextResponse.json({ error: 'usuarioId y proyectoId requeridos' }, { status: 400 })
  }
  const session = driver.session()
  try {
    await session.run(`
      MATCH (u:Usuario {id: $usuarioId}), (p:Proyecto {id: $proyectoId})
      MERGE (u)-[:PARTICIPA_EN]->(p)
    `, { usuarioId, proyectoId })
    return NextResponse.json({ mensaje: 'Unido al proyecto' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al unirse al proyecto' }, { status: 500 })
  } finally {
    await session.close()
  }
}
