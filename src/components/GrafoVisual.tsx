'use client'
import { useEffect, useRef, useState } from 'react'

interface Node { id: string; nombre: string; tipo: string }
interface Link { source: string; target: string; tipo: string }

export default function GrafoVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 500
      })
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded || !containerRef.current) return

    let ForceGraph: any
    let fg: any

    const init = async () => {
      const mod = await import('react-force-graph-2d')
      ForceGraph = mod.default

      const usRes = await fetch('/api/usuarios')
      const emRes = await fetch('/api/empresas')
      const haRes = await fetch('/api/habilidades')
      const conRes = await fetch('/api/conexiones')
      const ofRes = await fetch('/api/ofertas')

      const usuarios = await usRes.json()
      const empresas = await emRes.json()
      const habilidades = await haRes.json()
      const conexiones = await conRes.json()
      const ofertas = await ofRes.json()

      const nodes: Node[] = [
        ...usuarios.map((u: any) => ({ id: u.nombre, nombre: u.nombre, tipo: 'usuario' })),
        ...empresas.map((e: any) => ({ id: e.nombre, nombre: e.nombre, tipo: 'empresa' })),
        ...habilidades.map((h: any) => ({ id: h.nombre, nombre: h.nombre, tipo: 'habilidad' })),
        ...ofertas.map((o: any) => ({ id: o.titulo, nombre: o.titulo, tipo: 'oferta' })),
      ]

      const links: Link[] = [
        ...conexiones.map((c: any) => ({ source: c.desde, target: c.hacia, tipo: 'CONECTA_CON' })),
        ...ofertas.map((o: any) => ({ source: o.empresa, target: o.titulo, tipo: 'PUBLICA' })),
        ...ofertas.flatMap((o: any) => o.habilidades.map((h: string) => ({ source: o.titulo, target: h, tipo: 'REQUIERE' }))),
      ]

      const colorMap: Record<string, string> = {
        usuario: '#7c3aed',
        empresa: '#06b6d4',
        habilidad: '#f59e0b',
        oferta: '#10b981',
      }

      const { createRoot } = await import('react-dom/client')
      const React = await import('react')

      if (containerRef.current) {
        containerRef.current.innerHTML = ''
        const root = createRoot(containerRef.current)
        root.render(
          React.createElement(ForceGraph, {
            graphData: { nodes, links },
            width: dimensions.width,
            height: 500,
            nodeLabel: 'nombre',
            nodeColor: (n: any) => colorMap[n.tipo] || '#888',
            nodeRelSize: 6,
            linkLabel: 'tipo',
            linkColor: () => '#ffffff22',
            linkWidth: 1.5,
            backgroundColor: '#0a0a0f',
            nodeCanvasObject: (node: any, ctx: any, globalScale: number) => {
              const label = node.nombre
              const fontSize = 12 / globalScale
              ctx.font = `${fontSize}px Sans-Serif`
              ctx.fillStyle = colorMap[node.tipo] || '#888'
              ctx.beginPath()
              ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI)
              ctx.fill()
              ctx.fillStyle = '#fff'
              ctx.textAlign = 'center'
              ctx.fillText(label, node.x, node.y + 10)
            }
          })
        )
      }
    }

    init()
  }, [loaded, dimensions])

  return (
    <div ref={containerRef} className="w-full rounded-xl overflow-hidden border border-white/10" style={{ height: 500, background: '#0a0a0f' }}>
      <div className="flex items-center justify-center h-full text-white/40 text-sm">Cargando grafo...</div>
    </div>
  )
}