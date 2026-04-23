import { NextResponse } from 'next/server'
import driver from '@/lib/neo4j'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  try {
    const s1 = driver.session()
    const usuario = await s1.run(`MATCH (u:Usuario {id:$id}) RETURN u`, { id })
      .finally(() => s1.close())

    const s2 = driver.session()
    const conexiones = await s2.run(`
      MATCH (u:Usuario {id:$id})-[:CONECTA_CON]-(c:Usuario)
      RETURN c.nombre AS nombre, c.cargo AS cargo, c.id AS id, c.foto AS foto
    `, { id }).finally(() => s2.close())

    const s3 = driver.session()
    const habilidades = await s3.run(`
      MATCH (u:Usuario {id:$id})-[:TIENE_HABILIDAD]->(h:Habilidad)
      RETURN h.nombre AS nombre
    `, { id }).finally(() => s3.close())

    const s4 = driver.session()
    const proyectos = await s4.run(`
      MATCH (u:Usuario {id:$id})-[:PARTICIPA_EN]->(p:Proyecto)
      RETURN p.nombre AS nombre, p.tecnologias AS tecnologias
    `, { id }).finally(() => s4.close())

    const s5 = driver.session()
    const ofertas = await s5.run(`
      MATCH (u:Usuario {id:$id})-[:TIENE_HABILIDAD]->(h:Habilidad)<-[:REQUIERE]-(o:Oferta)<-[:PUBLICA]-(e:Empresa)
      RETURN DISTINCT o.titulo AS titulo, o.id AS ofertaId, e.nombre AS empresa, o.salario AS salario, count(h) AS match
      ORDER BY match DESC
    `, { id }).finally(() => s5.close())

    const s6 = driver.session()
    const experiencias = await s6.run(`
      MATCH (u:Usuario {id:$id})-[:TIENE_EXPERIENCIA]->(e:Experiencia)
      RETURN e.cargo AS cargo, e.empresa AS empresa, e.inicio AS inicio, e.fin AS fin, e.descripcion AS descripcion
      ORDER BY e.inicio DESC
    `, { id }).finally(() => s6.close())

    const s7 = driver.session()
    const aplicaciones = await s7.run(`
      MATCH (u:Usuario {id:$id})-[:APLICO_A]->(o:Oferta)<-[:PUBLICA]-(e:Empresa)
      RETURN o.titulo AS titulo, o.id AS ofertaId, e.nombre AS empresa, o.salario AS salario
    `, { id }).finally(() => s7.close())

    const u = usuario.records[0]?.get('u').properties || {}

    return NextResponse.json({
      ...u,
      password: undefined,
      conexiones: conexiones.records.map(r => ({ nombre: r.get('nombre'), cargo: r.get('cargo'), id: r.get('id'), foto: r.get('foto') })),
      habilidades: habilidades.records.map(r => r.get('nombre')),
      proyectos: proyectos.records.map(r => ({ nombre: r.get('nombre'), tecnologias: r.get('tecnologias') })),
      ofertas: ofertas.records.map(r => ({ titulo: r.get('titulo'), ofertaId: r.get('ofertaId'), empresa: r.get('empresa'), salario: r.get('salario'), match: r.get('match').toNumber() })),
      experiencias: experiencias.records.map(r => ({ cargo: r.get('cargo'), empresa: r.get('empresa'), inicio: r.get('inicio'), fin: r.get('fin'), descripcion: r.get('descripcion') })),
      aplicaciones: aplicaciones.records.map(r => ({ titulo: r.get('titulo'), ofertaId: r.get('ofertaId'), empresa: r.get('empresa'), salario: r.get('salario') })),
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
