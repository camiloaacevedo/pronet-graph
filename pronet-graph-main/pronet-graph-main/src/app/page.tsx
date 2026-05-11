'use client'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import Navbar from '@/components/Navbar'
import Login from '@/components/Login'
import Feed from '@/components/Feed'
import MiPerfil from '@/components/MiPerfil'
import Conexiones from '@/components/Conexiones'
import TablaOfertas from '@/components/TablaOfertas'
import Empresas from '@/components/Empresas'
import BuscarUsuarios from '@/components/BuscarUsuarios'
import Mensajes from '@/components/Mensajes'
import AnalisisRed from '@/components/AnalisisRed'

function App() {
  const { usuario } = useAuth()
  const [tab, setTab] = useState('feed')
  const [refresh, setRefresh] = useState(0)

  if (!usuario) return <Login />

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar tab={tab} setTab={setTab} />
      <main className="max-w-5xl mx-auto px-4 pt-20 pb-8">
        {tab === 'feed' && <Feed setTab={setTab} />}
        {tab === 'perfil' && <MiPerfil />}
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
