import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  try {
    const s1 = driver.session()
    const conexiones = await s1.run(`
      MATCH (u:Usuario {id: $id})-[:CONECTA_CON]-(c:Usuario)
      RETURN c.nombre AS nombre, c.cargo AS cargo, c.id AS id
    `, { id }).finally(() => s1.close())

    const s2 = driver.session()
    const habilidades = await s2.run(`
      MATCH (u:Usuario {id: $id})-[:TIENE_HABILIDAD]->(h:Habilidad)
      RETURN h.nombre AS nombre
    `, { id }).finally(() => s2.close())

    const s3 = driver.session()
    const proyectos = await s3.run(`
      MATCH (u:Usuario {id: $id})-[:PARTICIPA_EN]->(p:Proyecto)
      RETURN p.nombre AS nombre, p.tecnologias AS tecnologias
    `, { id }).finally(() => s3.close())

    const s4 = driver.session()
    const ofertas = await s4.run(`
      MATCH (u:Usuario {id: $id})-[:TIENE_HABILIDAD]->(h:Habilidad)<-[:REQUIERE]-(o:Oferta)<-[:PUBLICA]-(e:Empresa)
      RETURN DISTINCT o.titulo AS titulo, e.nombre AS empresa, o.salario AS salario, count(h) AS match
      ORDER BY match DESC
    `, { id }).finally(() => s4.close())

    return NextResponse.json({
      conexiones: conexiones.records.map(r => ({ nombre: r.get('nombre'), cargo: r.get('cargo'), id: r.get('id') })),
      habilidades: habilidades.records.map(r => r.get('nombre')),
      proyectos: proyectos.records.map(r => ({ nombre: r.get('nombre'), tecnologias: r.get('tecnologias') })),
      ofertas: ofertas.records.map(r => ({
        titulo: r.get('titulo'),
        empresa: r.get('empresa'),
        salario: r.get('salario'),
        match: r.get('match').toNumber()
      })),
    })
  } catch (error) {
    console.error('Error en /api/perfil:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
