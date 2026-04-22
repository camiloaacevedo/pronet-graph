import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const usuarioId = searchParams.get('usuarioId')
  const session = driver.session()
  try {
    // Contactos en común
    const contactos = await session.run(`
      MATCH (u:Usuario {id: $usuarioId})-[:CONECTA_CON]->(común)<-[:CONECTA_CON]-(recomendado)
      WHERE recomendado <> u AND NOT (u)-[:CONECTA_CON]->(recomendado)
      RETURN DISTINCT recomendado.nombre AS nombre, recomendado.cargo AS cargo, count(común) AS contactosComunes
      ORDER BY contactosComunes DESC
    `, { usuarioId })

    // Ofertas compatibles con habilidades
    const ofertas = await session.run(`
      MATCH (u:Usuario {id: $usuarioId})-[:TIENE_HABILIDAD]->(h:Habilidad)<-[:REQUIERE]-(o:Oferta)<-[:PUBLICA]-(e:Empresa)
      RETURN DISTINCT o.titulo AS oferta, e.nombre AS empresa, count(h) AS habilidadesMatch
      ORDER BY habilidadesMatch DESC
    `, { usuarioId })

    return NextResponse.json({
      contactosRecomendados: contactos.records.map(r => ({
        nombre: r.get('nombre'),
        cargo: r.get('cargo'),
        contactosComunes: r.get('contactosComunes').toNumber()
      })),
      ofertasRecomendadas: ofertas.records.map(r => ({
        oferta: r.get('oferta'),
        empresa: r.get('empresa'),
        habilidadesMatch: r.get('habilidadesMatch').toNumber()
      }))
    })
  } finally {
    await session.close()
  }
}