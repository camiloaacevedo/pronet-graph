import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const desde = searchParams.get('desde')
  const hasta = searchParams.get('hasta')
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (u1:Usuario {id: $desde}), (u2:Usuario {id: $hasta})
      MATCH p = shortestPath((u1)-[:CONECTA_CON*]-(u2))
      RETURN [n IN nodes(p) | n.nombre] AS camino
    `, { desde, hasta })

    if (result.records.length === 0) {
      return NextResponse.json({ encontrado: false })
    }

    const camino = result.records[0].get('camino')
    return NextResponse.json({ encontrado: true, camino, pasos: camino.length - 1 })
  } catch {
    return NextResponse.json({ encontrado: false })
  } finally {
    await session.close()
  }
}