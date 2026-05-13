'use client'
import PerfilCompleto from './PerfilCompleto'

interface Props {
  onVerPerfil?: (id: string) => void
  onVerConexiones?: (id: string) => void
}

export default function MiPerfil({ onVerPerfil, onVerConexiones }: Props) {
  return (
    <PerfilCompleto 
      onVerConexion={onVerPerfil} 
      onVerConexiones={onVerConexiones} 
    />
  )
}
