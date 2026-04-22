import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET() {
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (e:Empresa)-[:PUBLICA]->(o:Oferta)
      OPTIONAL MATCH (o)-[:REQUIERE]->(h:Habilidad)
      RETURN o, e.nombre AS empresa, collect(h.nombre) AS habilidades
      ORDER BY o.titulo
    `)
    const ofertas = result.records.map(r => ({
      ...r.get('o').properties,
      empresa: r.get('empresa'),
      habilidades: r.get('habilidades')
    }))
    return NextResponse.json(ofertas)
  } finally {
    await session.close()
  }
}

export async function POST(req: Request) {
  const session = driver.session()
  try {
    const { titulo, salario, empresaId } = await req.json()
    const id = Date.now().toString()
    const result = await session.run(
      `MATCH (e:Empresa {id: $empresaId})
       CREATE (o:Oferta {id: $id, titulo: $titulo, salario: $salario})
       CREATE (e)-[:PUBLICA]->(o)
       RETURN o`,
      { id, titulo, salario, empresaId }
    )
    return NextResponse.json(result.records[0].get('o').properties, { status: 201 })
  } finally {
    await session.close()
  }
}