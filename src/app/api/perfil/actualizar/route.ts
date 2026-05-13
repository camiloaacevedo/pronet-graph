import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function PUT(req: Request) {
  const body = await req.json()
  const { id, nombre, cargo, email, about, foto, ubicacion, habilidades, experiencias, empresaId, proyectos } = body

  try {
    const s1 = driver.session()
    await s1.run(`
      MATCH (u:Usuario {id: $id})
      SET u.nombre = $nombre, u.cargo = $cargo, u.email = $email,
          u.about = $about, u.foto = $foto, u.ubicacion = $ubicacion
    `, { id, nombre, cargo, email, about: about||'', foto: foto||'', ubicacion: ubicacion||'' })
      .finally(() => s1.close())

    // Actualizar habilidades
    const s2 = driver.session()
    await s2.run(`MATCH (u:Usuario {id:$id})-[r:TIENE_HABILIDAD]->() DELETE r`, { id })
      .finally(() => s2.close())

    for (const h of habilidades || []) {
      const s = driver.session()
      await s.run(`
        MATCH (u:Usuario {id:$id})
        MERGE (h:Habilidad {nombre: $h})
        ON CREATE SET h.id = $hid
        MERGE (u)-[:TIENE_HABILIDAD]->(h)
      `, { id, h, hid: Date.now().toString() + Math.random() })
        .finally(() => s.close())
    }

    // Actualizar experiencias
    const s3 = driver.session()
    await s3.run(`MATCH (u:Usuario {id:$id})-[r:TIENE_EXPERIENCIA]->() DELETE r`, { id })
      .finally(() => s3.close())

    for (const exp of experiencias || []) {
      const s = driver.session()
      await s.run(`
        MATCH (u:Usuario {id:$id})
        CREATE (e:Experiencia {id: $eid, cargo: $cargo, empresa: $empresa, inicio: $inicio, fin: $fin, descripcion: $descripcion})
        CREATE (u)-[:TIENE_EXPERIENCIA]->(e)
      `, { id, eid: Date.now().toString() + Math.random(), ...exp })
        .finally(() => s.close())
    }

    // Actualizar empresa (TRABAJA_EN)
    const s4 = driver.session()
    await s4.run(`MATCH (u:Usuario {id:$id})-[r:TRABAJA_EN]->() DELETE r`, { id })
      .finally(() => s4.close())

    if (empresaId) {
      const s = driver.session()
      await s.run(`
        MATCH (u:Usuario {id:$id}), (e:Empresa {id:$empresaId})
        MERGE (u)-[:TRABAJA_EN]->(e)
      `, { id, empresaId }).finally(() => s.close())
    }

    // Actualizar proyectos (PARTICIPA_EN)
    const s5 = driver.session()
    await s5.run(`MATCH (u:Usuario {id:$id})-[r:PARTICIPA_EN]->() DELETE r`, { id })
      .finally(() => s5.close())

    for (const proyectoId of proyectos || []) {
      const s = driver.session()
      await s.run(`
        MATCH (u:Usuario {id:$id}), (p:Proyecto {id:$proyectoId})
        MERGE (u)-[:PARTICIPA_EN]->(p)
      `, { id, proyectoId }).finally(() => s.close())
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}