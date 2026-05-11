import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function POST(req: Request) {
  const { nombre, email, password, cargo } = await req.json()
  console.log('📥 Datos recibidos:', { nombre, email, cargo })

  if (!nombre || !email || !password || !cargo) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
  }

  const session = driver.session()
  try {
    console.log('🔌 Conectando a Neo4j...')

    const existe = await session.run(
      'MATCH (u:Usuario {email: $email}) RETURN u', { email }
    )
    console.log('✅ Query ejecutada, registros encontrados:', existe.records.length)

    if (existe.records.length > 0) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
    }

    const id = Date.now().toString()
    const result = await session.run(
      `CREATE (u:Usuario {id: $id, nombre: $nombre, email: $email, password: $password, cargo: $cargo, foto: ''})
       RETURN u`,
      { id, nombre, email, password, cargo }
    )
    console.log('🎉 Usuario creado:', result.records.length)

    const u = result.records[0].get('u').properties
    const { password: _, ...sin } = u
    return NextResponse.json(sin, { status: 201 })

  } catch (error) {
    console.error('❌ Error en registro:', error)
    return NextResponse.json({ error: 'Error: ' + String(error) }, { status: 500 })
  } finally {
    await session.close()
  }
}