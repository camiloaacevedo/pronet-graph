import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET() {
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (u1:Usuario)-[:CONECTA_CON]->(u2:Usuario)
      RETURN u1.nombre AS desde, u2.nombre AS hacia
    `)
    return NextResponse.json(result.records.map(r => ({
      desde: r.get('desde'), hacia: r.get('hacia')
    })))
  } finally {
    await session.close()
  }
}

export async function POST(req: Request) {
  const { usuarioId1, usuarioId2 } = await req.json()
  const session = driver.session()
  try {
    await session.run(`
      MATCH (u1:Usuario {id: $usuarioId1}), (u2:Usuario {id: $usuarioId2})
      MERGE (u1)-[:CONECTA_CON]->(u2)
      MERGE (u2)-[:CONECTA_CON]->(u1)
    `, { usuarioId1, usuarioId2 })
    return NextResponse.json({ mensaje: 'Conexión creada' }, { status: 201 })
  } finally {
    await session.close()
  }
}

export async function DELETE(req: Request) {
  const { usuarioId1, usuarioId2 } = await req.json()
  const session = driver.session()
  try {
    await session.run(`
      MATCH (u1:Usuario {id: $usuarioId1})-[r:CONECTA_CON]-(u2:Usuario {id: $usuarioId2})
      DELETE r
    `, { usuarioId1, usuarioId2 })
    return NextResponse.json({ mensaje: 'Conexión eliminada' })
  } finally {
    await session.close()
  }
}
