import { ArrowRight, Compass, LogIn } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showError, setShowError] = useState(false)

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0
  }, [email, password])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) {
      setShowError(true)
      return
    }
    setShowError(false)
    navigate('/')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-container-lowest px-6 py-16">
      <div className="pointer-events-none absolute -top-52 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,196,153,.06)_0%,transparent_70%)]" />

      <main className="relative z-10 w-full max-w-[420px] rounded-[20px] border border-white/10 bg-surface px-10 py-9 shadow-[0_0_24px_rgba(255,196,153,.08)] sm:px-10 sm:py-10">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-[14px] bg-linear-to-br from-primary-container to-primary shadow-[0_0_24px_rgba(255,196,153,.2)]">
            <Compass className="size-6 text-on-primary" strokeWidth={1.9} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-primary">
            WhatNext
          </span>
        </div>

        <h1 className="font-display text-center text-[22px] font-semibold text-on-surface">
          Welcome back
        </h1>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-outline">
          Sign in to access your paths,
          <br />
          history and progress.
        </p>

        <button
          type="button"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-surface-container px-4 py-3 text-sm font-medium text-on-surface transition hover:border-primary/30 hover:bg-surface-container-high"
          onClick={() => {
            // placeholder for OAuth integration
          }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="size-[18px] shrink-0"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-outline-variant">or sign in with email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {showError ? (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            Incorrect email or password. Please try again.
          </div>
        ) : null}

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-outline">
              Email address
            </label>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setShowError(false)
              }}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-[10px] border border-white/10 bg-surface-container px-3.5 py-2.5 text-sm text-on-surface outline-none transition placeholder:text-outline-variant focus:border-primary/40"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-outline">
                Password
              </label>
              <button
                type="button"
                className="text-xs text-outline transition hover:text-primary"
                onClick={() => {
                  // placeholder for reset flow
                }}
              >
                Forgot password?
              </button>
            </div>
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setShowError(false)
              }}
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-[10px] border border-white/10 bg-surface-container px-3.5 py-2.5 text-sm text-on-surface outline-none transition placeholder:text-outline-variant focus:border-primary/40"
            />
          </div>

          <button
            type="submit"
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSubmit}
          >
            Sign in
            <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-outline-variant">
          Don&apos;t have an account?{' '}
          <Link to="/sign-up" className="text-primary hover:underline">
            Create one free →
          </Link>
        </p>

        <div className="mt-6 border-t border-white/10 pt-5 text-center">
          <p className="text-[13px] text-outline-variant">
            Don&apos;t want to sign up right now?
          </p>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-4 py-2 text-[13px] text-outline transition hover:border-outline-variant hover:text-on-surface"
            onClick={() => navigate('/')}
          >
            <LogIn className="size-3.5" aria-hidden />
            Continue as guest — try it free
          </button>
        </div>
      </main>
    </div>
  )
}
