import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function POST(req: Request) {
  const { nombre, email, password, cargo } = await req.json()
  const session = driver.session()
  try {
    const existe = await session.run(
      'MATCH (u:Usuario {email: $email}) RETURN u', { email }
    )
    if (existe.records.length > 0) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
    }
    const id = Date.now().toString()
    const result = await session.run(
      `CREATE (u:Usuario {id:$id, nombre:$nombre, email:$email, password:$password, cargo:$cargo, foto:''})
       RETURN u`,
      { id, nombre, email, password, cargo }
    )
    const u = result.records[0].get('u').properties
    const { password: _, ...sin } = u
    return NextResponse.json(sin, { status: 201 })
  } finally {
    await session.close()
  }
}
