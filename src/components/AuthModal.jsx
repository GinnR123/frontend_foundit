import { useState } from 'react'
import { ShieldCheck, User } from 'lucide-react'
import Modal from './Modal'
import { loginUser, registerUser } from '../services/api'

export default function AuthModal({ onClose, onAuthChange }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  function switchMode(next) {
    setMode(next)
    setError(null)
  }

  async function run(fn) {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const session = await fn()
      onAuthChange(session)
    } catch (e) {
      setError(e.message || 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (mode === 'register' && !name.trim()) {
      setError('Display name is required.')
      return
    }
    if (mode === 'register') {
      run(() => registerUser(name.trim(), email.trim()))
    } else {
      run(() => loginUser(email.trim()))
    }
  }

  const inputCls =
    'h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink'
  const labelCls = 'block text-[12px] font-medium text-ink'

  return (
    <Modal title="Sign in (Demo)" onClose={onClose}>
      <div className="px-5 py-4">
        <div className="rounded-md border border-line bg-paper px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
          Demo only: authentication is simulated in the browser with localStorage. No passwords are
          collected or stored, and real sign-in will be handled by the backend.
        </div>

        <div className="mt-3 flex gap-1 rounded-md border border-line p-1" role="tablist" aria-label="Login or register">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => switchMode('login')}
            className={`h-7 flex-1 rounded text-[12px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${
              mode === 'login' ? 'bg-elevated text-ink' : 'text-ink-soft hover:bg-paper'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => switchMode('register')}
            className={`h-7 flex-1 rounded text-[12px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${
              mode === 'register' ? 'bg-elevated text-ink' : 'text-ink-soft hover:bg-paper'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-3 space-y-3">
          {mode === 'register' && (
            <div>
              <label htmlFor="a-name" className={labelCls}>Display name</label>
              <input
                id="a-name" type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                className={`mt-1 ${inputCls}`}
              />
            </div>
          )}
          <div>
            <label htmlFor="a-email" className={labelCls}>Email</label>
            <input
              id="a-email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`mt-1 ${inputCls}`}
            />
          </div>

          {error && (
            <p className="rounded-md border border-lost bg-lost-bg px-3 py-2 text-[12px] text-lost" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-accent px-3 text-sm font-medium text-black hover:bg-[#d6c9b2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Working…' : mode === 'login' ? 'Log in' : 'Create demo account'}
          </button>
        </form>

        <div className="mt-4 border-t border-line pt-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">One-click demo sessions</p>
          <div className="mt-2 grid gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => loginUser('demo@foundit.app'))}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-line bg-surface px-3 text-sm text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
            >
              <User size={14} aria-hidden="true" />
              Sign in as Demo User
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => loginUser('admin@foundit.app'))}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-line bg-surface px-3 text-sm text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
            >
              <ShieldCheck size={14} aria-hidden="true" />
              Sign in as Demo Admin
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
