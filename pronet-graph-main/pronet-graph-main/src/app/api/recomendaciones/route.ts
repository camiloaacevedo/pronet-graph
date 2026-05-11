import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const usuarioId = searchParams.get('usuarioId')
  try {
    const s1 = driver.session()
    const conexionesActuales = await s1.run(`
      MATCH (u:Usuario {id: $usuarioId})-[:CONECTA_CON]-(c:Usuario)
      RETURN c.nombre AS nombre, c.cargo AS cargo, c.id AS id
    `, { usuarioId }).finally(() => s1.close())

    const s2 = driver.session()
    const contactos = await s2.run(`
      MATCH (u:Usuario {id: $usuarioId})-[:CONECTA_CON]->(común)<-[:CONECTA_CON]-(recomendado)
      WHERE recomendado <> u AND NOT (u)-[:CONECTA_CON]->(recomendado)
      RETURN DISTINCT recomendado.nombre AS nombre, recomendado.cargo AS cargo,
             recomendado.id AS id, count(común) AS contactosComunes
      ORDER BY contactosComunes DESC
    `, { usuarioId }).finally(() => s2.close())

    const s3 = driver.session()
    const ofertas = await s3.run(`
      MATCH (u:Usuario {id: $usuarioId})-[:TIENE_HABILIDAD]->(h:Habilidad)<-[:REQUIERE]-(o:Oferta)<-[:PUBLICA]-(e:Empresa)
      RETURN DISTINCT o.titulo AS oferta, e.nombre AS empresa, count(h) AS habilidadesMatch
      ORDER BY habilidadesMatch DESC
    `, { usuarioId }).finally(() => s3.close())

    return NextResponse.json({
      conexionesActuales: conexionesActuales.records.map(r => ({
        nombre: r.get('nombre'), cargo: r.get('cargo'), id: r.get('id')
      })),
      contactosRecomendados: contactos.records.map(r => ({
        nombre: r.get('nombre'), cargo: r.get('cargo'), id: r.get('id'),
        contactosComunes: r.get('contactosComunes').toNumber()
      })),
      ofertasRecomendadas: ofertas.records.map(r => ({
        oferta: r.get('oferta'), empresa: r.get('empresa'),
        habilidadesMatch: r.get('habilidadesMatch').toNumber()
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
