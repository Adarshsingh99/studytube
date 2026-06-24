import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'
import { useState } from 'react'
import { authApi, getApiErrorMessage } from '../services/api.js'
import { useAuthStore } from '../store/authStore.js'

export default function Login() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [form, setForm] = useState({ email: '', password: '' })
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      setSession(session)
      navigate('/')
    },
  })

  return (
    <AuthFrame title="Welcome back" subtitle="Pick up exactly where your lecture plan left off.">
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(form) }}>
        <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        {mutation.error && <p className="text-sm text-red-500">{getApiErrorMessage(mutation.error, 'Login failed')}</p>}
        <button className="focus-ring w-full rounded-md bg-coral px-4 py-3 font-bold text-white shadow-soft hover:bg-[#ef5146]" disabled={mutation.isPending}>Log in</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">New here? <Link className="font-semibold text-coral" to="/register">Create account</Link></p>
    </AuthFrame>
  )
}

export function AuthFrame({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-skysoft px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <section className="hidden lg:block">
          <div className="flex items-center gap-3 text-coral"><PlayCircle size={34} /><span className="text-3xl font-black">StudyTube</span></div>
          <h1 className="mt-8 max-w-xl text-5xl font-black leading-tight tracking-normal text-slate-950 dark:text-white">Turn long YouTube courses into daily study wins.</h1>
          <p className="mt-5 max-w-lg text-lg text-slate-600 dark:text-slate-300">{subtitle}</p>
        </section>
        <section className="glass rounded-lg p-6 shadow-soft">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2 text-coral"><PlayCircle size={26} /><span className="text-2xl font-black">StudyTube</span></div>
          </div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
          <p className="mb-6 mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          {children}
        </section>
      </div>
    </div>
  )
}

export function Input({ label, type = 'text', value, onChange }) {
  return (
    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300">
      {label}
      <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" required type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}
