import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!)
)

async function seed() {
  const session = driver.session()
  try {
    await session.run('MATCH (n) DETACH DELETE n')

    await session.run(`
      CREATE (u1:Usuario {id: '1', nombre: 'Ana García', email: 'ana@email.com', cargo: 'Frontend Developer', password: 'ana123'})
      CREATE (u2:Usuario {id: '2', nombre: 'Carlos Pérez', email: 'carlos@email.com', cargo: 'Backend Developer', password: 'carlos123'})
      CREATE (u3:Usuario {id: '3', nombre: 'María López', email: 'maria@email.com', cargo: 'Data Scientist', password: 'maria123'})
      CREATE (u4:Usuario {id: '4', nombre: 'Juan Torres', email: 'juan@email.com', cargo: 'DevOps Engineer', password: 'juan123'})
    `)

    await session.run(`
      CREATE (e1:Empresa {id: '1', nombre: 'TechCorp', sector: 'Software'})
      CREATE (e2:Empresa {id: '2', nombre: 'DataSoft', sector: 'Analítica'})
    `)

    await session.run(`
      CREATE (h1:Habilidad {id: '1', nombre: 'React'})
      CREATE (h2:Habilidad {id: '2', nombre: 'Node.js'})
      CREATE (h3:Habilidad {id: '3', nombre: 'Python'})
      CREATE (h4:Habilidad {id: '4', nombre: 'Docker'})
      CREATE (h5:Habilidad {id: '5', nombre: 'PostgreSQL'})
    `)

    await session.run(`
      CREATE (p1:Proyecto {id: '1', nombre: 'App E-commerce', tecnologias: ['React', 'Node.js']})
      CREATE (p2:Proyecto {id: '2', nombre: 'Dashboard Analytics', tecnologias: ['Python', 'React']})
    `)

    await session.run(`
      CREATE (o1:Oferta {id: '1', titulo: 'Senior React Developer', salario: '$3000', empresaId: '1'})
      CREATE (o2:Oferta {id: '2', titulo: 'Data Engineer', salario: '$3500', empresaId: '2'})
    `)

    await session.run(`MATCH (u1:Usuario {id:'1'}), (u2:Usuario {id:'2'}) CREATE (u1)-[:CONECTA_CON]->(u2)`)
    await session.run(`MATCH (u2:Usuario {id:'2'}), (u3:Usuario {id:'3'}) CREATE (u2)-[:CONECTA_CON]->(u3)`)
    await session.run(`MATCH (u1:Usuario {id:'1'}), (u4:Usuario {id:'4'}) CREATE (u1)-[:CONECTA_CON]->(u4)`)
    await session.run(`MATCH (u3:Usuario {id:'3'}), (u4:Usuario {id:'4'}) CREATE (u3)-[:CONECTA_CON]->(u4)`)

    await session.run(`MATCH (u1:Usuario {id:'1'}), (e1:Empresa {id:'1'}) CREATE (u1)-[:TRABAJA_EN]->(e1)`)
    await session.run(`MATCH (u2:Usuario {id:'2'}), (e1:Empresa {id:'1'}) CREATE (u2)-[:TRABAJA_EN]->(e1)`)
    await session.run(`MATCH (u3:Usuario {id:'3'}), (e2:Empresa {id:'2'}) CREATE (u3)-[:TRABAJA_EN]->(e2)`)

    await session.run(`MATCH (u1:Usuario {id:'1'}), (h1:Habilidad {id:'1'}) CREATE (u1)-[:TIENE_HABILIDAD]->(h1)`)
    await session.run(`MATCH (u1:Usuario {id:'1'}), (h2:Habilidad {id:'2'}) CREATE (u1)-[:TIENE_HABILIDAD]->(h2)`)
    await session.run(`MATCH (u2:Usuario {id:'2'}), (h2:Habilidad {id:'2'}) CREATE (u2)-[:TIENE_HABILIDAD]->(h2)`)
    await session.run(`MATCH (u2:Usuario {id:'2'}), (h5:Habilidad {id:'5'}) CREATE (u2)-[:TIENE_HABILIDAD]->(h5)`)
    await session.run(`MATCH (u3:Usuario {id:'3'}), (h3:Habilidad {id:'3'}) CREATE (u3)-[:TIENE_HABILIDAD]->(h3)`)
    await session.run(`MATCH (u3:Usuario {id:'3'}), (h1:Habilidad {id:'1'}) CREATE (u3)-[:TIENE_HABILIDAD]->(h1)`)
    await session.run(`MATCH (u4:Usuario {id:'4'}), (h4:Habilidad {id:'4'}) CREATE (u4)-[:TIENE_HABILIDAD]->(h4)`)
    await session.run(`MATCH (u4:Usuario {id:'4'}), (h2:Habilidad {id:'2'}) CREATE (u4)-[:TIENE_HABILIDAD]->(h2)`)

    await session.run(`MATCH (u1:Usuario {id:'1'}), (p1:Proyecto {id:'1'}) CREATE (u1)-[:PARTICIPA_EN]->(p1)`)
    await session.run(`MATCH (u2:Usuario {id:'2'}), (p1:Proyecto {id:'1'}) CREATE (u2)-[:PARTICIPA_EN]->(p1)`)
    await session.run(`MATCH (u3:Usuario {id:'3'}), (p2:Proyecto {id:'2'}) CREATE (u3)-[:PARTICIPA_EN]->(p2)`)

    await session.run(`MATCH (e1:Empresa {id:'1'}), (o1:Oferta {id:'1'}) CREATE (e1)-[:PUBLICA]->(o1)`)
    await session.run(`MATCH (e2:Empresa {id:'2'}), (o2:Oferta {id:'2'}) CREATE (e2)-[:PUBLICA]->(o2)`)
    await session.run(`MATCH (o1:Oferta {id:'1'}), (h1:Habilidad {id:'1'}) CREATE (o1)-[:REQUIERE]->(h1)`)
    await session.run(`MATCH (o1:Oferta {id:'1'}), (h2:Habilidad {id:'2'}) CREATE (o1)-[:REQUIERE]->(h2)`)
    await session.run(`MATCH (o2:Oferta {id:'2'}), (h3:Habilidad {id:'3'}) CREATE (o2)-[:REQUIERE]->(h3)`)
    await session.run(`MATCH (o2:Oferta {id:'2'}), (h5:Habilidad {id:'5'}) CREATE (o2)-[:REQUIERE]->(h5)`)

    // Mensajes de prueba
    await session.run(`
      MATCH (u1:Usuario {id:'1'}), (u2:Usuario {id:'2'})
      CREATE (m1:Mensaje {id: 'seed-msg-1', texto: 'Hola Carlos, ¿tienes tiempo para revisar el PR?', fecha: '2026-05-10T10:00:00'})
      CREATE (u1)-[:ENVIO]->(m1)<-[:RECIBIO]-(u2)
    `)
    await session.run(`
      MATCH (u2:Usuario {id:'2'}), (u1:Usuario {id:'1'})
      CREATE (m2:Mensaje {id: 'seed-msg-2', texto: 'Claro Ana, lo reviso hoy.', fecha: '2026-05-10T10:05:00'})
      CREATE (u2)-[:ENVIO]->(m2)<-[:RECIBIO]-(u1)
    `)
    await session.run(`
      MATCH (u3:Usuario {id:'3'}), (u1:Usuario {id:'1'})
      CREATE (m3:Mensaje {id: 'seed-msg-3', texto: 'Ana, te mando el reporte del análisis.', fecha: '2026-05-10T11:00:00'})
      CREATE (u3)-[:ENVIO]->(m3)<-[:RECIBIO]-(u1)
    `)

    // Aplicaciones a ofertas
    await session.run(`MATCH (u1:Usuario {id:'1'}), (o1:Oferta {id:'1'}) CREATE (u1)-[:APLICO_A]->(o1)`)
    await session.run(`MATCH (u4:Usuario {id:'4'}), (o1:Oferta {id:'1'}) CREATE (u4)-[:APLICO_A]->(o1)`)
    await session.run(`MATCH (u3:Usuario {id:'3'}), (o2:Oferta {id:'2'}) CREATE (u3)-[:APLICO_A]->(o2)`)

    console.log('✅ Seed completado')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await session.close()
    await driver.close()
  }
}

seed()