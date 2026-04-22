import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET() {
  const session = driver.session()
  try {
    const result = await session.run('MATCH (p:Proyecto) RETURN p ORDER BY p.nombre')
    const proyectos = result.records.map(r => r.get('p').properties)
    return NextResponse.json(proyectos)
  } finally {
    await session.close()
  }
}

export async function POST(req: Request) {
  const session = driver.session()
  try {
    const { nombre, tecnologias } = await req.json()
    const id = Date.now().toString()
    const result = await session.run(
      'CREATE (p:Proyecto {id: $id, nombre: $nombre, tecnologias: $tecnologias}) RETURN p',
      { id, nombre, tecnologias }
    )
    return NextResponse.json(result.records[0].get('p').properties, { status: 201 })
  } finally {
    await session.close()
  }
}