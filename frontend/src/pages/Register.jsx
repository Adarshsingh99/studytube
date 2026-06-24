import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authApi, getApiErrorMessage } from '../services/api.js'
import { useAuthStore } from '../store/authStore.js'
import { AuthFrame, Input } from './Login.jsx'

export default function Register() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (session) => {
      setSession(session)
      navigate('/')
    },
  })

  return (
    <AuthFrame title="Create your account" subtitle="Build a roadmap for every course, playlist, and study sprint.">
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(form) }}>
        <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        {mutation.error && <p className="text-sm text-red-500">{getApiErrorMessage(mutation.error, 'Registration failed')}</p>}
        <button className="focus-ring w-full rounded-md bg-coral px-4 py-3 font-bold text-white shadow-soft hover:bg-[#ef5146]" disabled={mutation.isPending}>Create account</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">Already studying? <Link className="font-semibold text-coral" to="/login">Log in</Link></p>
    </AuthFrame>
  )
}
