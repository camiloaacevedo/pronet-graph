'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import FormUsuario from '@/components/FormUsuario'
import TablaUsuarios from '@/components/TablaUsuarios'

const GrafoVisual = dynamic(() => import('@/components/GrafoVisual'), { ssr: false })

const tabs = ['Grafo', 'Usuarios', 'Registrar']

export default function Home() {
  const [tab, setTab] = useState('Grafo')
  const [refresh, setRefresh] = useState(0)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">ProNet <span className="text-cyan-400">Graph</span></h1>
          <p className="text-white/40 text-xs mt-0.5">Red profesional · Neo4j AuraDB</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === t ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="px-8 py-8 max-w-6xl mx-auto">
        {tab === 'Grafo' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-xl font-bold">Visualización del grafo</h2>
              <div className="flex gap-3 text-xs">
                {[['Usuarios','bg-violet-500'],['Empresas','bg-cyan-500'],['Habilidades','bg-amber-500'],['Ofertas','bg-emerald-500']].map(([l,c]) => (
                  <span key={l} className="flex items-center gap-1.5 text-white/60">
                    <span className={`w-2.5 h-2.5 rounded-full ${c}`}></span>{l}
                  </span>
                ))}
              </div>
            </div>
            <GrafoVisual />
          </div>
        )}

        {tab === 'Usuarios' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Usuarios registrados</h2>
            <TablaUsuarios refresh={refresh} />
          </div>
        )}

        {tab === 'Registrar' && (
          <div className="max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo usuario</h2>
            <FormUsuario onCreado={() => { setRefresh(r => r + 1); setTab('Usuarios') }} />
          </div>
        )}
      </main>
    </div>
  )
}