import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function POST(req: Request) {
  const { usuarioId, ofertaId } = await req.json()
  if (!usuarioId || !ofertaId) {
    return NextResponse.json({ error: 'usuarioId y ofertaId requeridos' }, { status: 400 })
  }
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (u:Usuario {id: $usuarioId}), (o:Oferta {id: $ofertaId})
      MERGE (u)-[:APLICO_A]->(o)
    `, { usuarioId, ofertaId })
    if (result.summary.counters.updates().relationshipsCreated === 0 &&
        !result.summary.counters.updates().containsUpdates) {
      return NextResponse.json({ error: 'Usuario u oferta no encontrados' }, { status: 404 })
    }
    return NextResponse.json({ mensaje: 'Aplicación registrada' }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al registrar aplicación' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ofertaId = searchParams.get('ofertaId')
  if (!ofertaId) return NextResponse.json({ error: 'ofertaId requerido' }, { status: 400 })
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (u:Usuario)-[:APLICO_A]->(o:Oferta {id:$ofertaId})
      RETURN u.id AS id, u.nombre AS nombre, u.cargo AS cargo, u.foto AS foto, u.email AS email
    `, { ofertaId })
    return NextResponse.json(result.records.map(r => ({
      id: r.get('id'), nombre: r.get('nombre'), cargo: r.get('cargo'),
      foto: r.get('foto'), email: r.get('email')
    })))
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al obtener aplicaciones' }, { status: 500 })
  } finally {
    await session.close()
  }
}
