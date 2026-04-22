import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET() {
  const session = driver.session()
  try {
    const result = await session.run(
      'MATCH (u:Usuario) RETURN u ORDER BY u.nombre'
    )
    const usuarios = result.records.map(r => r.get('u').properties)
    return NextResponse.json(usuarios)
  } finally {
    await session.close()
  }
}

export async function POST(req: Request) {
  const session = driver.session()
  try {
    const body = await req.json()
    const { nombre, email, cargo } = body
    const id = Date.now().toString()
    const result = await session.run(
      `CREATE (u:Usuario {id: $id, nombre: $nombre, email: $email, cargo: $cargo})
       RETURN u`,
      { id, nombre, email, cargo }
    )
    const usuario = result.records[0].get('u').properties
    return NextResponse.json(usuario, { status: 201 })
  } finally {
    await session.close()
  }
}