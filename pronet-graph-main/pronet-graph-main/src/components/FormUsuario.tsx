'use client'
import { useState } from 'react'

export default function FormUsuario({ onCreado }: { onCreado: () => void }) {
  const [form, setForm] = useState({ nombre: '', email: '', cargo: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.nombre || !form.email || !form.cargo) return
    setLoading(true)
    await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setForm({ nombre: '', email: '', cargo: '' })
    setLoading(false)
    onCreado()
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
      <h3 className="text-white font-bold text-lg">Registrar Usuario</h3>
      <input
        className="bg-white/10 text-white rounded-lg px-4 py-2 outline-none border border-white/10 focus:border-violet-500"
        placeholder="Nombre completo"
        value={form.nombre}
        onChange={e => setForm({ ...form, nombre: e.target.value })}
      />
      <input
        className="bg-white/10 text-white rounded-lg px-4 py-2 outline-none border border-white/10 focus:border-violet-500"
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="bg-white/10 text-white rounded-lg px-4 py-2 outline-none border border-white/10 focus:border-violet-500"
        placeholder="Cargo"
        value={form.cargo}
        onChange={e => setForm({ ...form, cargo: e.target.value })}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Registrar'}
      </button>
    </div>
  )
}