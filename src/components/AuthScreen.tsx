import { useState } from 'react'
import { ApiError } from '../lib/api'

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (name: string, email: string, password: string) => Promise<void>
}

export function AuthScreen({ onLogin, onRegister }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') await onLogin(email, password)
      else await onRegister(name, email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-3xl font-semibold text-paper">Ledger</h1>
        <p className="mb-6 text-sm text-muted">
          {mode === 'login' ? 'Welcome back.' : 'Create an account to start tracking.'}
        </p>

        {mode === 'register' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            className="mb-3 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-paper placeholder:text-muted focus:border-muted focus:outline-none"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="mb-3 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-paper placeholder:text-muted focus:border-muted focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={8}
          className="mb-4 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-paper placeholder:text-muted focus:border-muted focus:outline-none"
        />

        {error && <p className="mb-4 text-sm text-rose">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-moss py-2.5 text-sm font-medium text-ink transition-colors hover:bg-moss-dim hover:text-paper disabled:opacity-60"
        >
          {mode === 'login' ? 'Log in' : 'Create account'}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="mt-4 w-full text-center text-sm text-muted hover:text-paper"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </form>
    </div>
  )
}
