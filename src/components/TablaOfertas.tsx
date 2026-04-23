'use client'
import { useEffect, useState } from 'react'

export default function TablaOfertas() {
  const [ofertas, setOfertas] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/ofertas').then(r => r.json()).then(setOfertas)
  }, [])

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full text-sm text-white">
        <thead>
          <tr className="border-b border-white/10 text-white/50 text-xs uppercase">
            <th className="text-left px-4 py-3">Oferta</th>
            <th className="text-left px-4 py-3">Empresa</th>
            <th className="text-left px-4 py-3">Salario</th>
            <th className="text-left px-4 py-3">Habilidades requeridas</th>
          </tr>
        </thead>
        <tbody>
          {ofertas.map((o, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 font-medium">{o.titulo}</td>
              <td className="px-4 py-3 text-cyan-400">{o.empresa}</td>
              <td className="px-4 py-3 text-emerald-400">{o.salario}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {o.habilidades.map((h: string, j: number) => (
                    <span key={j} className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full">{h}</span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}