'use client'
import { useEffect, useState } from 'react'

export default function TablaEmpresas() {
  const [empresas, setEmpresas] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/business/empresas').then(r => r.json()).then(setEmpresas)
  }, [])

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full text-sm text-white">
        <thead>
          <tr className="border-b border-white/10 text-white/50 text-xs uppercase">
            <th className="text-left px-4 py-3">Empresa</th>
            <th className="text-left px-4 py-3">Sector</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((e, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 font-medium">{e.nombre}</td>
              <td className="px-4 py-3">
                <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full">{e.sector}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}