import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET() {
  const session = driver.session()

  try {
    const result = await session.run(`
      MATCH (u:Usuario)-[:PUBLICO]->(p:Publicacion)
      RETURN 
        p.id AS id,
        p.texto AS texto,
        p.fecha AS fecha,
        u.nombre AS autor,
        u.cargo AS cargo,
        u.id AS autorId,
        u.foto AS foto
      ORDER BY p.fecha DESC
      LIMIT 20
    `)

    return NextResponse.json(
      result.records.map(r => ({
        id: r.get('id'),
        texto: r.get('texto'),
        fecha: r.get('fecha'),
        autor: r.get('autor'),
        cargo: r.get('cargo'),
        autorId: r.get('autorId'),
        foto: r.get('foto')
      }))
    )

  } finally {
    await session.close()
  }
}

export async function POST(req: Request) {
  const { usuarioId, texto } = await req.json()

  const session = driver.session()

  try {
    await session.run(`
      MATCH (u:Usuario {id:$usuarioId})

      CREATE (p:Publicacion {
        id: $id,
        texto: $texto,
        fecha: $fecha
      })

      CREATE (u)-[:PUBLICO]->(p)
    `, {
      usuarioId,
      texto,
      id: Date.now().toString(),
      fecha: new Date().toISOString()
    })

    return NextResponse.json(
      { ok: true },
      { status: 201 }
    )

  } finally {
    await session.close()
  }
}

export async function DELETE(req: Request) {
  const session = driver.session()

  try {
    const { searchParams } = new URL(req.url)

    const id = searchParams.get('id')

    await session.run(`
      MATCH (p:Publicacion {id:$id})
      DETACH DELETE p
    `, { id })

    return NextResponse.json({
      ok: true
    })

  } finally {
    await session.close()
  }
}