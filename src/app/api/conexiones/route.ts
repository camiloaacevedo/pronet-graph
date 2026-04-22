import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET() {
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (u1:Usuario)-[:CONECTA_CON]->(u2:Usuario)
      RETURN u1.nombre AS desde, u2.nombre AS hacia
    `)
    const conexiones = result.records.map(r => ({
      desde: r.get('desde'),
      hacia: r.get('hacia')
    }))
    return NextResponse.json(conexiones)
  } finally {
    await session.close()
  }
}

export async function POST(req: Request) {
  const session = driver.session()
  try {
    const { usuarioId1, usuarioId2 } = await req.json()
    await session.run(`
      MATCH (u1:Usuario {id: $usuarioId1}), (u2:Usuario {id: $usuarioId2})
      MERGE (u1)-[:CONECTA_CON]->(u2)
    `, { usuarioId1, usuarioId2 })
    return NextResponse.json({ mensaje: 'Conexión creada' }, { status: 201 })
  } finally {
    await session.close()
  }
}