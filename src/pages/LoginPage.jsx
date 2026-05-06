import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/frappe.js'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [usr, setUsr] = useState('')
  const [pwd, setPwd] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const disabled = useMemo(() => submitting || !usr.trim() || !pwd, [submitting, usr, pwd])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ usr: usr.trim(), pwd })
      await onLogin?.()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-300/30">
        <div className="mb-1 text-xl font-extrabold text-slate-900">Sprint Board</div>
        <div className="mb-4 text-sm text-slate-500">Sign in with your Frappe user</div>

        <form onSubmit={onSubmit} className="grid gap-2.5">
          <label className="grid gap-1.5 text-xs text-slate-500">
            Username / Email
            <input className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900" value={usr} onChange={(e) => setUsr(e.target.value)} autoFocus />
          </label>

          <label className="grid gap-1.5 text-xs text-slate-500">
            Password
            <input className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
          </label>

          {error ? <div className="rounded-xl border border-red-300 bg-red-50 px-2.5 py-2 text-xs text-red-700">{error}</div> : null}

          <button className="mt-1 rounded-xl bg-blue-700 px-3 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={disabled}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-3 text-xs text-slate-500">
          This app talks to Frappe through the Vite proxy on <code>/api</code>.
        </div>
      </div>
    </div>
  )
}

