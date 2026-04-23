// src/components/Login.tsx
'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!form.email || !form.password) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
    } else {
      login(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-[#0a66c2] rounded flex items-center justify-center mx-auto mb-3">
          <span className="text-white font-black text-2xl">P</span>
        </div>
        <h1 className="text-3xl font-black text-[#0a66c2]">ProNet</h1>
        <p className="text-[#00000099] text-sm mt-1">Tu red profesional</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e0dfdc] p-8 w-full max-w-sm shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Inicia sesión</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-[#000000e6] block mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition-colors"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#000000e6] block mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2] transition-colors"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#0a66c2] hover:bg-[#004182] text-white font-semibold py-2.5 rounded-full transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[#e0dfdc] text-center">
          <p className="text-xs text-[#00000099] mb-2">Usuarios de prueba:</p>
          <div className="text-xs text-[#00000099] space-y-0.5">
            <p>ana@email.com / ana123</p>
            <p>carlos@email.com / carlos123</p>
            <p>maria@email.com / maria123</p>
            <p>juan@email.com / juan123</p>
          </div>
        </div>
      </div>
    </div>
  )
}