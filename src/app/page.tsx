'use client'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import Navbar from '@/components/shared/Navbar'
import Login from '@/components/auth/Login'
import Feed from '@/components/social/Feed'
import MiPerfil from '@/components/profile/MiPerfil'
import PerfilCompleto from '@/components/profile/PerfilCompleto'
import ConexionesDelPerfil from '@/components/profile/ConexionesDelPerfil'
import Conexiones from '@/components/graph/Conexiones'
import TablaOfertas from '@/components/business/TablaOfertas'
import Empresas from '@/components/business/Empresas'
import BuscarUsuarios from '@/components/graph/BuscarUsuarios'
import Mensajes from '@/components/social/Mensajes'
import AnalisisRed from '@/components/graph/AnalisisRed'

function App() {
  const { usuario } = useAuth()
  const [tab, setTab] = useState('feed')
  const [perfilAver, setPerfilAver] = useState<string | null>(null)
  const [conexionesDeId, setConexionesDeId] = useState<string | null>(null)
  const [tabAnterior, setTabAnterior] = useState('feed')
  const [refresh, setRefresh] = useState(0)

  const abrirPerfil = (id: string) => {
    setPerfilAver(id)
    setTab('ver_perfil')
  }

  const abrirConexiones = (id: string) => {
    setConexionesDeId(id)
    setTabAnterior(tab)
    setTab('ver_conexiones')
  }

  if (!usuario) return <Login />

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar tab={tab} setTab={setTab} />
      <main className="max-w-5xl mx-auto px-4 pt-20 pb-8">
        {tab === 'feed' && <Feed setTab={setTab} onVerPerfil={(id) => { setPerfilAver(id); setTab('ver_perfil') }} />}
        {tab === 'perfil' && (
          <MiPerfil 
            onVerPerfil={abrirPerfil} 
            onVerConexiones={abrirConexiones} 
          />
        )}
        {tab === 'ver_perfil' && (
          <div>
            <button onClick={() => setTab('feed')} className="flex items-center gap-2 text-[#0a66c2] text-sm mb-4 hover:underline">
              ← Volver al inicio
            </button>
            <PerfilCompleto
              usuarioId={perfilAver!}
              onVerConexion={(id) => abrirPerfil(id)}
              onVerConexiones={(id) => abrirConexiones(id)}
            />
          </div>
        )}
        {tab === 'ver_conexiones' && conexionesDeId && (
          <ConexionesDelPerfil
            perfilId={conexionesDeId}
            onVerPerfil={(id) => abrirPerfil(id)}
            onVolver={() => setTab(tabAnterior)}
          />
        )}
        {tab === 'red' && <Conexiones />}
        {tab === 'empleos' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Empleos</h2>
            <TablaOfertas />
          </div>
        )}
        {tab === 'mensajes' && <Mensajes />}
        {tab === 'notificaciones' && (
          <div className="bg-white rounded-xl border border-[#e0dfdc] p-8 text-center text-[#00000099] text-sm">
            No tienes notificaciones nuevas
          </div>
        )}
        {tab === 'empresas' && <Empresas />}
        {tab === 'buscar' && <BuscarUsuarios />}
        {tab === 'analisis' && <AnalisisRed />}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}