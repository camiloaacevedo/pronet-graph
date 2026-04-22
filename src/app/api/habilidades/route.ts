import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET() {
  const session = driver.session()
  try {
    const result = await session.run('MATCH (h:Habilidad) RETURN h ORDER BY h.nombre')
    const habilidades = result.records.map(r => r.get('h').properties)
    return NextResponse.json(habilidades)
  } finally {
    await session.close()
  }
}

export async function POST(req: Request) {
  const session = driver.session()
  try {
    const { nombre } = await req.json()
    const id = Date.now().toString()
    const result = await session.run(
      'CREATE (h:Habilidad {id: $id, nombre: $nombre}) RETURN h',
      { id, nombre }
    )
    return NextResponse.json(result.records[0].get('h').properties, { status: 201 })
  } finally {
    await session.close()
  }
}