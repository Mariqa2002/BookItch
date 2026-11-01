import { useState, type FormEvent } from 'react'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/bookish'
import { useAuth } from '@/lib/auth'

export default function Login() {
  const { signInWithPassword, signUp } = useAuth()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    const result = mode === 'sign-in' ? await signInWithPassword(email, password) : await signUp(email, password)

    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (mode === 'sign-up') {
      setInfo('Account created — check your inbox to confirm your email, then sign in.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-ink">
      <div className="w-full max-w-[380px] rounded-bk-xl border border-border bg-surface p-7 shadow-bk-card">
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-bk-pill bg-tint text-primary">
            <BookOpen size={20} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <h1 className="m-0 font-sans text-2xl font-bold leading-8">Book Itch</h1>
          <p className="m-0 font-script text-xl leading-6 text-ink-muted">Your shelf, your rules</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="set-label">Email</span>
            <input
              className="bk-input"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="set-label">Password</span>
            <input
              className="bk-input"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="m-0 text-sm leading-[20px] text-rust">{error}</p>}
          {info && <p className="m-0 text-sm leading-[20px] text-ink-muted">{info}</p>}

          <Button variant="primary" type="submit" disabled={submitting} className="mt-2 justify-center">
            {submitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'sign-in' ? 'sign-up' : 'sign-in'))
            setError(null)
            setInfo(null)
          }}
          className="mt-4 w-full text-center font-sans text-sm leading-[20px] text-ink-muted underline-offset-2 hover:underline"
        >
          {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
