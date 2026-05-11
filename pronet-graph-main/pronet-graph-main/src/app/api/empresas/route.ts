import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET() {
  const session = driver.session()
  try {
    const result = await session.run('MATCH (e:Empresa) RETURN e ORDER BY e.nombre')
    const empresas = result.records.map(r => r.get('e').properties)
    return NextResponse.json(empresas)
  } finally {
    await session.close()
  }
}

export async function POST(req: Request) {
  const session = driver.session()
  try {
    const { nombre, sector } = await req.json()
    const id = Date.now().toString()
    const result = await session.run(
      'CREATE (e:Empresa {id: $id, nombre: $nombre, sector: $sector}) RETURN e',
      { id, nombre, sector }
    )
    return NextResponse.json(result.records[0].get('e').properties, { status: 201 })
  } finally {
    await session.close()
  }
}