import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const deId = searchParams.get('deId')
  const paraId = searchParams.get('paraId')
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (de:Usuario)-[:ENVIO]->(m:Mensaje)<-[:RECIBIO]-(para:Usuario)
      WHERE (de.id = $deId AND para.id = $paraId) OR (de.id = $paraId AND para.id = $deId)
      RETURN m.texto AS texto, m.fecha AS fecha, de.id AS deId
      ORDER BY m.fecha ASC
    `, { deId, paraId })
    return NextResponse.json(result.records.map(r => ({
      texto: r.get('texto'), fecha: r.get('fecha'), deId: r.get('deId')
    })))
  } finally {
    await session.close()
  }
}
