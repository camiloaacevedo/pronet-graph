import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET() {
  const session = driver.session()
  try {
    const result = await session.run('RETURN "Conexión exitosa con Neo4j" AS mensaje')
    const mensaje = result.records[0].get('mensaje')
    return NextResponse.json({ mensaje })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  } finally {
    await session.close()
  }
}