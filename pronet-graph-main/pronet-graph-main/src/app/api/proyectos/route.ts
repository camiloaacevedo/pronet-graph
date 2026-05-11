import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET() {
  const session = driver.session()
  try {
    const result = await session.run('MATCH (p:Proyecto) RETURN p ORDER BY p.nombre')
    return NextResponse.json(result.records.map(r => r.get('p').properties))
  } finally {
    await session.close()
  }
}
