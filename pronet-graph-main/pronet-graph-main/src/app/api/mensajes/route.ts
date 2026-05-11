import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const usuarioId = searchParams.get('usuarioId')
  if (!usuarioId) return NextResponse.json({ error: 'usuarioId requerido' }, { status: 400 })
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (u:Usuario {id: $usuarioId})-[:ENVIO|RECIBIO]-(m:Mensaje)-[:RECIBIO|ENVIO]-(otro:Usuario)
      WHERE otro.id <> $usuarioId
      WITH DISTINCT otro, m ORDER BY m.fecha DESC
      WITH otro, collect(m)[0] AS ultimo
      RETURN otro.id AS id, otro.nombre AS nombre, otro.cargo AS cargo,
             otro.foto AS foto, ultimo.texto AS ultimoMensaje, ultimo.fecha AS fecha
    `, { usuarioId })
    return NextResponse.json(result.records.map(r => ({
      id: r.get('id'),
      nombre: r.get('nombre'),
      cargo: r.get('cargo'),
      foto: r.get('foto'),
      ultimoMensaje: r.get('ultimoMensaje'),
      fecha: r.get('fecha'),
    })))
  } catch {
    return NextResponse.json({ error: 'Error al obtener conversaciones' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function POST(req: Request) {
  const { deId, paraId, texto } = await req.json()
  const session = driver.session()
  try {
    await session.run(`
      MATCH (de:Usuario {id:$deId}), (para:Usuario {id:$paraId})
      CREATE (m:Mensaje {id:$id, texto:$texto, fecha:$fecha})
      CREATE (de)-[:ENVIO]->(m)
      CREATE (para)-[:RECIBIO]->(m)
    `, { deId, paraId, texto, id: Date.now().toString(), fecha: new Date().toISOString() })
    return NextResponse.json({ ok: true })
  } finally {
    await session.close()
  }
}
