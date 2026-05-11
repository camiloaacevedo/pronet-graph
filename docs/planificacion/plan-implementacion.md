# pronet-graph: Cumplimiento de Requisitos del Proyecto

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar la aplicación pronet-graph para cumplir todos los requisitos del enunciado del proyecto de investigación (Base de Datos No Relacional - Grafos), cubriendo entidades, relaciones, consultas y funcionalidades CRUD faltantes.

**Architecture:** Next.js 15 App Router + Neo4j Driver. Cada funcionalidad nueva sigue el patrón existente: API route en `src/app/api/`, componente React en `src/components/`, integración en `src/app/page.tsx`. No hay framework de testing — la verificación es manual via `npm run dev`.

**Tech Stack:** Next.js 15, TypeScript, Neo4j Driver, Tailwind CSS, neo4j+s (AuraDB)

**Directorio del proyecto:** `pronet-graph-main/pronet-graph-main/`

---

## Resumen de tareas

| # | Tarea | Prioridad |
|---|-------|-----------|
| 1 | Fix: Cypher inválido en GET /api/mensajes | Bug crítico |
| 2 | Fix: Agregar APLICO_A al seed y API | Datos de prueba |
| 3 | Feature: TRABAJA_EN — vincular usuario a empresa desde perfil | Requisito del enunciado |
| 4 | Feature: PARTICIPA_EN — vincular usuario a proyecto desde perfil | Requisito del enunciado |
| 5 | Feature: Crear empresas y ofertas desde UI | Requisito del enunciado |
| 6 | Verificación final end-to-end | Calidad |

---

## Task 1: Fix — Cypher inválido en GET /api/mensajes

**Problema:** `src/app/api/mensajes/route.ts:10` tiene el patrón `(m:Mensaje)-(otro:Usuario)` sin tipo de relación — Cypher inválido, la lista de conversaciones siempre está vacía.

**Files:**
- Modify: `pronet-graph-main/pronet-graph-main/src/app/api/mensajes/route.ts`

- [ ] **Step 1: Leer el archivo actual**

```bash
# Revisar la query rota
cat pronet-graph-main/pronet-graph-main/src/app/api/mensajes/route.ts
```

- [ ] **Step 2: Reemplazar la query GET con Cypher válido**

En `src/app/api/mensajes/route.ts`, reemplazar el handler GET completo:

```typescript
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const usuarioId = searchParams.get('usuarioId')
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (u:Usuario {id: $usuarioId})-[:ENVIO]->(m:Mensaje)-[:RECIBIO]->(otro:Usuario)
      WITH otro, m ORDER BY m.fecha DESC
      WITH otro, collect(m)[0] AS ultimo
      RETURN otro.id AS id, otro.nombre AS nombre, otro.cargo AS cargo,
             otro.foto AS foto, ultimo.texto AS ultimoMensaje, ultimo.fecha AS fecha
      UNION
      MATCH (otro:Usuario)-[:ENVIO]->(m:Mensaje)-[:RECIBIO]->(u:Usuario {id: $usuarioId})
      WITH otro, m ORDER BY m.fecha DESC
      WITH otro, collect(m)[0] AS ultimo
      RETURN otro.id AS id, otro.nombre AS nombre, otro.cargo AS cargo,
             otro.foto AS foto, ultimo.texto AS ultimoMensaje, ultimo.fecha AS fecha
    `, { usuarioId })
    return NextResponse.json(result.records.map(r => ({
      id: r.get('id'),
      nombre: r.get('nombre'),
      cargo: r.get('cargo'),
      foto: r.get('foto'),
      ultimoMensaje: r.get('ultimoMensaje'),
      fecha: r.get('fecha'),
    })))
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 3: Verificar que el seed crea mensajes con las relaciones correctas**

Revisar `src/lib/seed.ts` — si los mensajes usan `[:ENVIO]` y `[:RECIBIO]` como nodos separados o como relaciones directas. Si no hay mensajes en el seed, agregar al menos 2:

```typescript
// Al final del seed, antes del console.log:
await session.run(`
  MATCH (u1:Usuario {id:'1'}), (u2:Usuario {id:'2'})
  CREATE (m1:Mensaje {id: '1', texto: 'Hola Carlos, ¿cómo estás?', fecha: '2026-05-10T10:00:00'})
  CREATE (u1)-[:ENVIO]->(m1)-[:RECIBIO]->(u2)
`)
await session.run(`
  MATCH (u2:Usuario {id:'2'}), (u1:Usuario {id:'1'})
  CREATE (m2:Mensaje {id: '2', texto: 'Todo bien Ana, gracias!', fecha: '2026-05-10T10:05:00'})
  CREATE (u2)-[:ENVIO]->(m2)-[:RECIBIO]->(u1)
`)
```

- [ ] **Step 4: Verificar la estructura actual de Mensaje en el seed**

Si el seed actual crea mensajes diferente, ajustar la query GET para que coincida con la estructura real.

- [ ] **Step 5: Correr el seed para refrescar datos**

```bash
cd pronet-graph-main/pronet-graph-main
npx ts-node --project tsconfig.json -e "require('./src/lib/seed.ts')"
# o si hay script en package.json:
npm run seed
```

- [ ] **Step 6: Probar en el navegador**

Correr `npm run dev`, ir a Mensajes, verificar que aparece la lista de conversaciones.

- [ ] **Step 7: Commit**

```bash
git add pronet-graph-main/pronet-graph-main/src/app/api/mensajes/route.ts
git add pronet-graph-main/pronet-graph-main/src/lib/seed.ts
git commit -m "fix: corregir Cypher inválido en GET /api/mensajes y agregar mensajes al seed"
```

---

## Task 2: Fix — Agregar APLICO_A al seed y exponer en API

**Problema:** La consulta `candidatos_para_oferta` en `/api/analisis` calcula `conexionesCercanas` basado en relaciones `APLICO_A`, pero ningún usuario en el seed ha aplicado a ninguna oferta. El resultado siempre muestra 0 conexiones cercanas.

**Files:**
- Modify: `pronet-graph-main/pronet-graph-main/src/lib/seed.ts`
- Modify: `pronet-graph-main/pronet-graph-main/src/app/api/aplicaciones/route.ts`

- [ ] **Step 1: Leer el API de aplicaciones actual**

```bash
cat pronet-graph-main/pronet-graph-main/src/app/api/aplicaciones/route.ts
```

- [ ] **Step 2: Agregar relaciones APLICO_A en seed.ts**

En `src/lib/seed.ts`, agregar antes del `console.log`:

```typescript
// Aplicaciones a ofertas
await session.run(`MATCH (u1:Usuario {id:'1'}), (o1:Oferta {id:'1'}) CREATE (u1)-[:APLICO_A]->(o1)`)
await session.run(`MATCH (u3:Usuario {id:'3'}), (o2:Oferta {id:'2'}) CREATE (u3)-[:APLICO_A]->(o2)`)
await session.run(`MATCH (u4:Usuario {id:'4'}), (o1:Oferta {id:'1'}) CREATE (u4)-[:APLICO_A]->(o1)`)
```

- [ ] **Step 3: Verificar/mejorar el API de aplicaciones**

Asegurarse que `POST /api/aplicaciones` crea `(u)-[:APLICO_A]->(o)` y que `GET /api/aplicaciones` retorna las aplicaciones del usuario.

Si el POST no existe o crea la relación diferente, agregar:

```typescript
export async function POST(req: Request) {
  const { usuarioId, ofertaId } = await req.json()
  const session = driver.session()
  try {
    await session.run(`
      MATCH (u:Usuario {id: $usuarioId}), (o:Oferta {id: $ofertaId})
      MERGE (u)-[:APLICO_A]->(o)
    `, { usuarioId, ofertaId })
    return NextResponse.json({ mensaje: 'Aplicación registrada' }, { status: 201 })
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 4: Correr seed y verificar en AnalisisRed**

Ejecutar seed, abrir `http://localhost:3000`, ir a Análisis → "Candidatos para una oferta", seleccionar "Senior React Developer" — debería mostrar conexionesCercanas > 0 para algunos usuarios.

- [ ] **Step 5: Commit**

```bash
git add pronet-graph-main/pronet-graph-main/src/lib/seed.ts
git add pronet-graph-main/pronet-graph-main/src/app/api/aplicaciones/route.ts
git commit -m "feat: agregar relaciones APLICO_A en seed y mejorar API aplicaciones"
```

---

## Task 3: Feature — TRABAJA_EN: vincular usuario a empresa desde el perfil

**Requisito del enunciado:** "Vincular usuarios con habilidades, **empresas** y proyectos"

**Problema:** La relación `TRABAJA_EN` existe en el seed pero no hay API ni UI para gestionarla. El perfil del usuario no muestra en qué empresa trabaja ni permite cambiarlo.

**Files:**
- Modify: `pronet-graph-main/pronet-graph-main/src/app/api/perfil/route.ts` (incluir empresa en respuesta)
- Modify: `pronet-graph-main/pronet-graph-main/src/app/api/perfil/actualizar/route.ts` (agregar TRABAJA_EN)
- Modify: `pronet-graph-main/pronet-graph-main/src/components/MiPerfil.tsx` (mostrar y editar empresa)

- [ ] **Step 1: Leer los archivos actuales**

```bash
cat pronet-graph-main/pronet-graph-main/src/app/api/perfil/route.ts
cat pronet-graph-main/pronet-graph-main/src/app/api/perfil/actualizar/route.ts
cat pronet-graph-main/pronet-graph-main/src/components/MiPerfil.tsx
```

- [ ] **Step 2: Agregar empresa actual a GET /api/perfil**

En `src/app/api/perfil/route.ts`, agregar una query para obtener la empresa donde trabaja el usuario. Agregar después de las queries existentes (antes del return):

```typescript
const s_empresa = driver.session()
const empresaResult = await s_empresa.run(`
  MATCH (u:Usuario {id: $id})-[:TRABAJA_EN]->(e:Empresa)
  RETURN e.id AS empresaId, e.nombre AS empresaNombre
`, { id }).finally(() => s_empresa.close())
const empresa = empresaResult.records.length > 0 ? {
  id: empresaResult.records[0].get('empresaId'),
  nombre: empresaResult.records[0].get('empresaNombre'),
} : null
```

Incluir `empresa` en el objeto de respuesta final.

- [ ] **Step 3: Agregar gestión de TRABAJA_EN en PUT /api/perfil/actualizar**

En `src/app/api/perfil/actualizar/route.ts`, leer `empresaId` del body y actualizar la relación:

```typescript
const { id, nombre, cargo, bio, habilidades, proyectos, empresaId } = await req.json()

// ... código existente para habilidades y proyectos ...

// Actualizar empresa (TRABAJA_EN)
if (empresaId !== undefined) {
  const sEmpresa = driver.session()
  try {
    if (empresaId === null || empresaId === '') {
      // Desconectar de empresa actual
      await sEmpresa.run(`
        MATCH (u:Usuario {id: $id})-[r:TRABAJA_EN]->(:Empresa)
        DELETE r
      `, { id })
    } else {
      // Cambiar empresa
      await sEmpresa.run(`
        MATCH (u:Usuario {id: $id})
        OPTIONAL MATCH (u)-[r:TRABAJA_EN]->(:Empresa) DELETE r
        WITH u
        MATCH (e:Empresa {id: $empresaId})
        CREATE (u)-[:TRABAJA_EN]->(e)
      `, { id, empresaId })
    }
  } finally {
    await sEmpresa.close()
  }
}
```

- [ ] **Step 4: Agregar selector de empresa en MiPerfil.tsx**

En `src/components/MiPerfil.tsx`, en el formulario de edición, agregar un `<select>` para elegir empresa:

```tsx
// Estado adicional
const [empresas, setEmpresas] = useState<any[]>([])
const [empresaId, setEmpresaId] = useState<string>('')

// En useEffect de carga de perfil
fetch('/api/empresas').then(r => r.json()).then(setEmpresas)
// Setear empresa actual si viene en el perfil:
if (data.empresa) setEmpresaId(data.empresa.id)

// En el formulario de edición, agregar:
<div>
  <label className="text-xs text-[#00000099] block mb-1">Empresa actual</label>
  <select
    className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2] bg-white"
    value={empresaId}
    onChange={e => setEmpresaId(e.target.value)}
  >
    <option value="">Sin empresa</option>
    {empresas.map(e => (
      <option key={e.id} value={e.id}>{e.nombre}</option>
    ))}
  </select>
</div>

// En la función de guardar, incluir empresaId en el body:
body: JSON.stringify({ id: usuario.id, nombre, cargo, bio, habilidades, proyectos, empresaId })
```

- [ ] **Step 5: Mostrar empresa en la vista de perfil (no edición)**

En `MiPerfil.tsx`, en la sección de vista del perfil, mostrar la empresa actual si existe:

```tsx
{perfil.empresa && (
  <p className="text-sm text-[#00000099] flex items-center gap-1">
    <span>🏢</span> {perfil.empresa.nombre}
  </p>
)}
```

- [ ] **Step 6: Probar en el navegador**

1. Iniciar `npm run dev`
2. Login como Ana (ana@email.com / ana123)
3. Ir a Mi Perfil → Editar
4. Cambiar empresa a "DataSoft" → Guardar
5. Verificar que el perfil muestra "DataSoft"
6. Verificar en PerfilCompleto de otro usuario también muestra empresa

- [ ] **Step 7: Commit**

```bash
git add pronet-graph-main/pronet-graph-main/src/app/api/perfil/route.ts
git add pronet-graph-main/pronet-graph-main/src/app/api/perfil/actualizar/route.ts
git add pronet-graph-main/pronet-graph-main/src/components/MiPerfil.tsx
git commit -m "feat: TRABAJA_EN — vincular usuario a empresa desde perfil"
```

---

## Task 4: Feature — PARTICIPA_EN: gestionar proyectos desde el perfil

**Requisito del enunciado:** "Vincular usuarios con habilidades, empresas y **proyectos**"

**Problema:** La relación `PARTICIPA_EN` existe en el seed pero no hay forma de crear proyectos nuevos ni de que un usuario se una a uno desde la UI.

**Files:**
- Modify: `pronet-graph-main/pronet-graph-main/src/app/api/proyectos/route.ts` (agregar POST para crear proyectos)
- Modify: `pronet-graph-main/pronet-graph-main/src/components/MiPerfil.tsx` (crear proyecto y unirse a existentes)

- [ ] **Step 1: Leer el API de proyectos actual**

```bash
cat pronet-graph-main/pronet-graph-main/src/app/api/proyectos/route.ts
```

- [ ] **Step 2: Agregar POST para crear proyectos en /api/proyectos**

En `src/app/api/proyectos/route.ts`, agregar:

```typescript
export async function POST(req: Request) {
  const { nombre, tecnologias, usuarioId } = await req.json()
  const session = driver.session()
  try {
    const id = crypto.randomUUID()
    await session.run(`
      MATCH (u:Usuario {id: $usuarioId})
      CREATE (p:Proyecto {id: $id, nombre: $nombre, tecnologias: $tecnologias})
      CREATE (u)-[:PARTICIPA_EN]->(p)
    `, { id, nombre, tecnologias: tecnologias || [], usuarioId })
    return NextResponse.json({ id, nombre, tecnologias }, { status: 201 })
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 3: Agregar endpoint para unirse a proyecto existente**

En `src/app/api/proyectos/route.ts`, agregar:

```typescript
export async function PUT(req: Request) {
  const { usuarioId, proyectoId } = await req.json()
  const session = driver.session()
  try {
    await session.run(`
      MATCH (u:Usuario {id: $usuarioId}), (p:Proyecto {id: $proyectoId})
      MERGE (u)-[:PARTICIPA_EN]->(p)
    `, { usuarioId, proyectoId })
    return NextResponse.json({ mensaje: 'Unido al proyecto' })
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 4: Actualizar MiPerfil.tsx para mostrar y gestionar proyectos**

En `src/components/MiPerfil.tsx`, en la vista del perfil (no en edición), agregar sección de proyectos con botón para crear nuevo:

```tsx
// Estado adicional
const [todosProyectos, setTodosProyectos] = useState<any[]>([])
const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: '', tecnologias: '' })
const [mostrarFormProyecto, setMostrarFormProyecto] = useState(false)

// Cargar todos los proyectos disponibles en useEffect
fetch('/api/proyectos').then(r => r.json()).then(setTodosProyectos)

// Función para crear proyecto
const crearProyecto = async () => {
  const tecnologiasArray = nuevoProyecto.tecnologias
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
  await fetch('/api/proyectos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: nuevoProyecto.nombre,
      tecnologias: tecnologiasArray,
      usuarioId: usuario!.id
    })
  })
  setMostrarFormProyecto(false)
  setNuevoProyecto({ nombre: '', tecnologias: '' })
  // Recargar perfil
  cargarPerfil()
}

// Función para unirse a proyecto
const unirseProyecto = async (proyectoId: string) => {
  await fetch('/api/proyectos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuarioId: usuario!.id, proyectoId })
  })
  cargarPerfil()
}
```

- [ ] **Step 5: Agregar UI de proyectos en MiPerfil.tsx**

En la sección de proyectos del perfil, mostrar los proyectos actuales y opciones para crear/unirse:

```tsx
<div className="border-t border-[#e0dfdc] pt-4 mt-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="font-semibold text-sm">Proyectos</h3>
    <button
      onClick={() => setMostrarFormProyecto(!mostrarFormProyecto)}
      className="text-xs text-[#0a66c2] hover:underline"
    >
      + Nuevo proyecto
    </button>
  </div>

  {mostrarFormProyecto && (
    <div className="mb-3 p-3 border border-[#e0dfdc] rounded-xl flex flex-col gap-2">
      <input
        placeholder="Nombre del proyecto"
        className="border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]"
        value={nuevoProyecto.nombre}
        onChange={e => setNuevoProyecto(p => ({ ...p, nombre: e.target.value }))}
      />
      <input
        placeholder="Tecnologías (separadas por coma)"
        className="border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]"
        value={nuevoProyecto.tecnologias}
        onChange={e => setNuevoProyecto(p => ({ ...p, tecnologias: e.target.value }))}
      />
      <button
        onClick={crearProyecto}
        className="self-start bg-[#0a66c2] text-white text-xs px-4 py-1.5 rounded-full"
      >
        Crear
      </button>
    </div>
  )}

  {perfil.proyectos?.length > 0 ? (
    <div className="flex flex-col gap-2">
      {perfil.proyectos.map((p: any) => (
        <div key={p.id} className="flex items-center gap-2 text-sm">
          <span>📁</span>
          <span className="font-medium">{p.nombre}</span>
          <span className="text-xs text-[#00000099]">{p.tecnologias?.join(', ')}</span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-xs text-[#00000099]">Sin proyectos aún</p>
  )}

  {/* Proyectos a los que puede unirse */}
  {todosProyectos.filter(p => !perfil.proyectos?.find((up: any) => up.id === p.id)).length > 0 && (
    <div className="mt-3">
      <p className="text-xs text-[#00000099] mb-2">Otros proyectos disponibles:</p>
      <div className="flex flex-col gap-1">
        {todosProyectos
          .filter(p => !perfil.proyectos?.find((up: any) => up.id === p.id))
          .map(p => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span>{p.nombre}</span>
              <button
                onClick={() => unirseProyecto(p.id)}
                className="text-xs text-[#0a66c2] hover:underline"
              >
                Unirse
              </button>
            </div>
          ))}
      </div>
    </div>
  )}
</div>
```

- [ ] **Step 6: Verificar que GET /api/perfil devuelve proyectos con id**

Revisar `src/app/api/perfil/route.ts` — asegurarse que los proyectos incluyen `id`:

```typescript
// En la query de proyectos del perfil:
MATCH (u:Usuario {id: $id})-[:PARTICIPA_EN]->(p:Proyecto)
RETURN p.id AS id, p.nombre AS nombre, p.tecnologias AS tecnologias
```

- [ ] **Step 7: Probar**

1. `npm run dev`
2. Login como Juan (juan@email.com / juan123) — no tiene proyectos en el seed
3. Crear proyecto "API Gateway" con tecnologías "Docker, Node.js"
4. Verificar que aparece en su perfil
5. Ir a Análisis → Proyectos relacionados → seleccionar "API Gateway" → debería mostrar "App E-commerce" (comparten Node.js)
6. Unirse a proyecto existente desde otro usuario

- [ ] **Step 8: Commit**

```bash
git add pronet-graph-main/pronet-graph-main/src/app/api/proyectos/route.ts
git add pronet-graph-main/pronet-graph-main/src/components/MiPerfil.tsx
git commit -m "feat: PARTICIPA_EN — crear proyectos y unirse a ellos desde perfil"
```

---

## Task 5: Feature — Crear empresas y ofertas desde la UI

**Requisito del enunciado:** "Registrar empresas y sus ofertas laborales"

**Problema:** Las empresas y ofertas solo se pueden leer. No hay forma de crear nuevas desde la app.

**Files:**
- Modify: `pronet-graph-main/pronet-graph-main/src/app/api/empresas/route.ts` (agregar POST)
- Modify: `pronet-graph-main/pronet-graph-main/src/app/api/ofertas/route.ts` (agregar POST)
- Modify: `pronet-graph-main/pronet-graph-main/src/components/Empresas.tsx` (formulario crear empresa + oferta)

- [ ] **Step 1: Leer archivos actuales**

```bash
cat pronet-graph-main/pronet-graph-main/src/app/api/empresas/route.ts
cat pronet-graph-main/pronet-graph-main/src/app/api/ofertas/route.ts
cat pronet-graph-main/pronet-graph-main/src/components/Empresas.tsx
```

- [ ] **Step 2: Agregar POST en /api/empresas**

En `src/app/api/empresas/route.ts`, agregar:

```typescript
export async function POST(req: Request) {
  const { nombre, sector } = await req.json()
  const session = driver.session()
  try {
    const id = crypto.randomUUID()
    await session.run(`
      CREATE (e:Empresa {id: $id, nombre: $nombre, sector: $sector})
    `, { id, nombre, sector: sector || '' })
    return NextResponse.json({ id, nombre, sector }, { status: 201 })
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 3: Agregar POST en /api/ofertas**

En `src/app/api/ofertas/route.ts`, agregar:

```typescript
export async function POST(req: Request) {
  const { titulo, salario, empresaId, habilidades } = await req.json()
  const session = driver.session()
  try {
    const id = crypto.randomUUID()
    await session.run(`
      MATCH (e:Empresa {id: $empresaId})
      CREATE (o:Oferta {id: $id, titulo: $titulo, salario: $salario})
      CREATE (e)-[:PUBLICA]->(o)
    `, { id, titulo, salario: salario || '', empresaId })
    // Vincular habilidades requeridas
    if (habilidades && habilidades.length > 0) {
      for (const habilidadNombre of habilidades) {
        await session.run(`
          MATCH (o:Oferta {id: $ofertaId})
          MERGE (h:Habilidad {nombre: $habilidadNombre})
          ON CREATE SET h.id = $hId
          CREATE (o)-[:REQUIERE]->(h)
        `, { ofertaId: id, habilidadNombre, hId: crypto.randomUUID() })
      }
    }
    return NextResponse.json({ id, titulo, salario }, { status: 201 })
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 4: Agregar formulario de nueva empresa en Empresas.tsx**

En `src/components/Empresas.tsx`, agregar estado y formulario:

```tsx
const [mostrarForm, setMostrarForm] = useState(false)
const [nuevaEmpresa, setNuevaEmpresa] = useState({ nombre: '', sector: '' })
const [mostrarFormOferta, setMostrarFormOferta] = useState<string | null>(null)
const [nuevaOferta, setNuevaOferta] = useState({ titulo: '', salario: '', habilidades: '' })

const crearEmpresa = async () => {
  await fetch('/api/empresas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevaEmpresa)
  })
  setNuevaEmpresa({ nombre: '', sector: '' })
  setMostrarForm(false)
  cargarDatos() // función que recarga empresas y ofertas
}

const crearOferta = async (empresaId: string) => {
  const habilidadesArray = nuevaOferta.habilidades.split(',').map(h => h.trim()).filter(Boolean)
  await fetch('/api/ofertas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...nuevaOferta, empresaId, habilidades: habilidadesArray })
  })
  setNuevaOferta({ titulo: '', salario: '', habilidades: '' })
  setMostrarFormOferta(null)
  cargarDatos()
}
```

- [ ] **Step 5: Agregar UI del formulario en Empresas.tsx**

Antes de la lista de empresas, agregar botón y formulario:

```tsx
<div className="flex justify-between items-center mb-4">
  <h2 className="font-bold text-lg">Empresas</h2>
  <button
    onClick={() => setMostrarForm(!mostrarForm)}
    className="bg-[#0a66c2] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#004182]"
  >
    + Nueva empresa
  </button>
</div>

{mostrarForm && (
  <div className="mb-4 p-4 border border-[#e0dfdc] rounded-xl bg-white flex flex-col gap-3">
    <input
      placeholder="Nombre de la empresa"
      className="border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]"
      value={nuevaEmpresa.nombre}
      onChange={e => setNuevaEmpresa(p => ({ ...p, nombre: e.target.value }))}
    />
    <input
      placeholder="Sector (ej: Software, Fintech)"
      className="border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]"
      value={nuevaEmpresa.sector}
      onChange={e => setNuevaEmpresa(p => ({ ...p, sector: e.target.value }))}
    />
    <button
      onClick={crearEmpresa}
      className="self-start bg-[#0a66c2] text-white text-xs px-4 py-1.5 rounded-full"
    >
      Crear empresa
    </button>
  </div>
)}
```

En la tarjeta de cada empresa, agregar botón "+ Agregar oferta":

```tsx
<button
  onClick={() => setMostrarFormOferta(empresa.id === mostrarFormOferta ? null : empresa.id)}
  className="text-xs text-[#0a66c2] hover:underline mt-2"
>
  + Agregar oferta
</button>

{mostrarFormOferta === empresa.id && (
  <div className="mt-3 p-3 border border-[#e0dfdc] rounded-xl flex flex-col gap-2">
    <input
      placeholder="Título de la oferta"
      className="border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]"
      value={nuevaOferta.titulo}
      onChange={e => setNuevaOferta(p => ({ ...p, titulo: e.target.value }))}
    />
    <input
      placeholder="Salario (ej: $2500)"
      className="border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]"
      value={nuevaOferta.salario}
      onChange={e => setNuevaOferta(p => ({ ...p, salario: e.target.value }))}
    />
    <input
      placeholder="Habilidades requeridas (separadas por coma)"
      className="border border-[#c0c0c0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0a66c2]"
      value={nuevaOferta.habilidades}
      onChange={e => setNuevaOferta(p => ({ ...p, habilidades: e.target.value }))}
    />
    <button
      onClick={() => crearOferta(empresa.id)}
      className="self-start bg-[#0a66c2] text-white text-xs px-4 py-1.5 rounded-full"
    >
      Publicar oferta
    </button>
  </div>
)}
```

- [ ] **Step 6: Probar**

1. `npm run dev`
2. Ir a Empresas
3. Crear empresa "StartupXYZ" sector "Fintech"
4. Verificar que aparece en la lista
5. Agregar oferta "Full Stack Developer" con habilidades "React, Node.js"
6. Verificar que aparece en TablaOfertas
7. Ir a Análisis → Candidatos para oferta → seleccionar la nueva oferta → verificar que aparecen candidatos

- [ ] **Step 7: Commit**

```bash
git add pronet-graph-main/pronet-graph-main/src/app/api/empresas/route.ts
git add pronet-graph-main/pronet-graph-main/src/app/api/ofertas/route.ts
git add pronet-graph-main/pronet-graph-main/src/components/Empresas.tsx
git commit -m "feat: crear empresas y ofertas laborales desde la UI"
```

---

## Task 6: Verificación final end-to-end

**Objetivo:** Confirmar que todos los requisitos del enunciado están cubiertos y la app funciona de extremo a extremo.

**Checklist de requisitos:**

- [ ] **Registrar usuarios** — `/api/registro` + `FormUsuario` funcionan
- [ ] **Conexiones entre usuarios** — `CONECTA_CON` se puede crear y eliminar desde Conexiones
- [ ] **Vincular con habilidades** — desde perfil se pueden agregar/quitar habilidades
- [ ] **Vincular con empresas** — selector de empresa en perfil funciona (Task 3)
- [ ] **Vincular con proyectos** — crear/unirse a proyectos funciona (Task 4)
- [ ] **Registrar empresas** — formulario en Empresas funciona (Task 5)
- [ ] **Registrar ofertas** — formulario en Empresas funciona (Task 5)
- [ ] **Relacionar ofertas con habilidades** — al crear oferta se crean relaciones REQUIERE
- [ ] **Ruta más corta usuario→empresa** — Análisis → Ruta a empresa funciona
- [ ] **Ruta más corta entre usuarios** — Análisis → Ruta entre usuarios funciona
- [ ] **Usuarios con habilidades similares** — Análisis → Habilidades similares funciona
- [ ] **Contactos en común** — Análisis → Contactos en común funciona
- [ ] **Candidatos para oferta** — Análisis → Candidatos funciona con datos reales
- [ ] **Proyectos relacionados** — Análisis → Proyectos relacionados funciona
- [ ] **Mensajes** — lista de conversaciones muestra datos (Task 1)
- [ ] **Recomendaciones** — contactos y ofertas recomendadas aparecen

- [ ] **Step 1: Correr seed limpio**

```bash
cd pronet-graph-main/pronet-graph-main
npx ts-node src/lib/seed.ts
```

- [ ] **Step 2: Iniciar servidor**

```bash
npm run dev
```

- [ ] **Step 3: Recorrer cada punto del checklist arriba**

Usar las credenciales del seed:
- ana@email.com / ana123
- carlos@email.com / carlos123
- maria@email.com / maria123
- juan@email.com / juan123

- [ ] **Step 4: Commit final**

```bash
git add .
git commit -m "chore: verificación final — todos los requisitos del proyecto implementados"
```
