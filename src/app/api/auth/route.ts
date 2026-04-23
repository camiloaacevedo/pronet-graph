// src/app/api/auth/route.ts
import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (u:Usuario {email: $email, password: $password})
       RETURN u`,
      { email, password }
    )
    if (result.records.length === 0) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }
    const usuario = result.records[0].get('u').properties
    const { password: _, ...usuarioSinPassword } = usuario
    return NextResponse.json(usuarioSinPassword)
  } finally {
    await session.close()
  }
}