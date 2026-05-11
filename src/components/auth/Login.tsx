'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [modo, setModo] = useState<'login' | 'registro'>('login')
  const [form, setForm] = useState({ nombre: '', email: '', password: '', cargo: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    if (modo === 'login') {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      })
      const data = await res.json()
      if (!res.ok) setError(data.error)
      else login(data)
    } else {
      if (!form.nombre || !form.email || !form.password || !form.cargo) {
        setError('Todos los campos son requeridos')
        setLoading(false)
        return
      }
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) setError(data.error)
      else login(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex">
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1">
        <div className="w-10 h-10 bg-[#0a66c2] rounded flex items-center justify-center mb-4">
          <span className="text-white font-black text-xl">P</span>
        </div>
        <h1 className="text-5xl font-black text-[#0a66c2] leading-tight mb-4">ProNet</h1>
        <p className="text-2xl text-[#000000e6] max-w-md leading-relaxed">
          Tu comunidad profesional. Conecta, crece y encuentra oportunidades.
        </p>
      </div>

      <div className="flex flex-col justify-center px-8 py-12 w-full lg:w-[400px] lg:flex-shrink-0">
        <div className="bg-white rounded-2xl border border-[#e0dfdc] p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">
            {modo === 'login' ? 'Inicia sesión' : 'Únete a ProNet'}
          </h2>

          <div className="flex flex-col gap-3">
            {modo === 'registro' && (
              <>
                <div>
                  <label className="text-xs text-[#00000099] block mb-1">Nombre completo</label>
                  <input className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2]"
                    placeholder="Tu nombre" value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-[#00000099] block mb-1">Cargo / Profesión</label>
                  <input className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2]"
                    placeholder="Ej: Software Engineer" value={form.cargo}
                    onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} />
                </div>
              </>
            )}
            <div>
              <label className="text-xs text-[#00000099] block mb-1">Email</label>
              <input type="email" className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2]"
                placeholder="tu@email.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div>
              <label className="text-xs text-[#00000099] block mb-1">Contraseña</label>
              <input type="password" className="w-full border border-[#c0c0c0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0a66c2]"
                placeholder="••••••••" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-[#0a66c2] hover:bg-[#004182] text-white font-semibold py-2.5 rounded-full transition-colors disabled:opacity-50 mt-1">
              {loading ? 'Cargando...' : modo === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-[#e0dfdc] text-center">
            {modo === 'login' ? (
              <>
                <p className="text-sm text-[#00000099]">¿No tienes cuenta?{' '}
                  <button onClick={() => { setModo('registro'); setError('') }} className="text-[#0a66c2] font-semibold hover:underline">Regístrate</button>
                </p>
                <p className="text-xs text-[#00000099] mt-3">Usuarios de prueba:</p>
                <p className="text-xs text-[#00000099]">ana@email.com / ana123</p>
              </>
            ) : (
              <p className="text-sm text-[#00000099]">¿Ya tienes cuenta?{' '}
                <button onClick={() => { setModo('login'); setError('') }} className="text-[#0a66c2] font-semibold hover:underline">Inicia sesión</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
