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
  const { titulo, salario, empresaId, habilidades } = await req.json()
  if (!titulo || !empresaId) {
    return NextResponse.json({ error: 'titulo y empresaId requeridos' }, { status: 400 })
  }
  const session = driver.session()
  try {
    const id = crypto.randomUUID()
    const result = await session.run(
      `MATCH (e:Empresa {id: $empresaId})
       CREATE (o:Oferta {id: $id, titulo: $titulo, salario: $salario})
       CREATE (e)-[:PUBLICA]->(o)
       RETURN o`,
      { id, titulo, salario: salario || '', empresaId }
    )
    if (result.records.length === 0) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }
    if (habilidades && habilidades.length > 0) {
      await session.run(
        `MATCH (o:Oferta {id: $ofertaId})
         UNWIND $habilidades AS nombre
         MERGE (h:Habilidad {nombre: nombre})
         ON CREATE SET h.id = randomUUID()
         MERGE (o)-[:REQUIERE]->(h)`,
        { ofertaId: id, habilidades }
      )
    }
    return NextResponse.json(result.records[0].get('o').properties, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear oferta' }, { status: 500 })
  } finally {
    await session.close()
  }
}