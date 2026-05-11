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
  const { nombre, sector } = await req.json()
  if (!nombre) {
    return NextResponse.json({ error: 'nombre requerido' }, { status: 400 })
  }
  const session = driver.session()
  try {
    const id = crypto.randomUUID()
    const result = await session.run(
      'CREATE (e:Empresa {id: $id, nombre: $nombre, sector: $sector}) RETURN e',
      { id, nombre, sector: sector || '' }
    )
    if (result.records.length === 0) {
      return NextResponse.json({ error: 'Error al crear empresa' }, { status: 500 })
    }
    return NextResponse.json(result.records[0].get('e').properties, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear empresa' }, { status: 500 })
  } finally {
    await session.close()
  }
}