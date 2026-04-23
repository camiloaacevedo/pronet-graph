'use client'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import Navbar from '@/components/Navbar'
import Login from '@/components/Login'
import Feed from '@/components/Feed'
import MiPerfil from '@/components/MiPerfil'
import Conexiones from '@/components/Conexiones'
import TablaOfertas from '@/components/TablaOfertas'
import TablaEmpresas from '@/components/TablaEmpresas'
import FormUsuario from '@/components/FormUsuario'
import BuscarUsuarios from '@/components/BuscarUsuarios'

function App() {
  const { usuario } = useAuth()
  const [tab, setTab] = useState('feed')
  const [refresh, setRefresh] = useState(0)

  if (!usuario) return <Login />

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar tab={tab} setTab={setTab} />
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-8">
        {tab === 'feed' && <Feed setTab={setTab} />}
        {tab === 'perfil' && <MiPerfil />}
        {tab === 'conexiones' && <Conexiones />}
        {tab === 'ofertas' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Ofertas laborales</h2>
            <TablaOfertas />
          </div>
        )}
        {tab === 'empresas' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Empresas</h2>
            <TablaEmpresas />
          </div>
        )}
        {tab === 'buscar' && <BuscarUsuarios />}
        {tab === 'registrar' && (
          <div className="max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo usuario</h2>
            <FormUsuario onCreado={() => { setRefresh(r => r + 1); setTab('feed') }} />
          </div>
        )}
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
