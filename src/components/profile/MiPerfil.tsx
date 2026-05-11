'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import PerfilCompleto from './PerfilCompleto'

export default function MiPerfil() {
  const { usuario } = useAuth()
  const [verPerfil, setVerPerfil] = useState<string | null>(null)

  if (verPerfil) return (
    <div>
      <button onClick={() => setVerPerfil(null)} className="flex items-center gap-2 text-[#0a66c2] text-sm mb-4 hover:underline">
        ← Volver a mi perfil
      </button>
      <PerfilCompleto usuarioId={verPerfil} />
    </div>
  )

  return <PerfilCompleto onVerConexion={setVerPerfil} />
}
