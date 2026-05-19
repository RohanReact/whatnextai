import { ArrowRight, Compass, LogIn, Loader2, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PasswordInput from '../components/PasswordInput'
import { authService } from '../services/auth'
import { updateProfile } from '../services/api'

export default function SignUpPage() {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<'English' | 'हिंदी' | 'বাংলা' | 'தமிழ்'>('English')
  const [stage, setStage] = useState<'Student' | 'Working' | 'Business owner' | 'Job seeking'>('Student')

  const [isLoading,       setIsLoading]       = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error,           setError]           = useState<string | null>(null)
  const [emailSent,       setEmailSent]       = useState(false)

  const passwordsMatch = password === confirmPassword
  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length  > 0 &&
    email.trim().length     > 0 &&
    password.trim().length  >= 8 &&
    confirmPassword.trim().length >= 8 &&
    passwordsMatch

  const clearError = () => setError(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || isLoading) return

    if (!passwordsMatch) {
      setError('Passwords do not match. Please check and try again.')
      return
    }

    setIsLoading(true)
    setError(null)

    const fullName = `${firstName.trim()} ${lastName.trim()}`

    const { session, error: authError } = await authService.signUp(
      email.trim(),
      password,
      fullName,
      { lifeStage: stage, preferredLanguage }
    )

    if (authError) {
      setIsLoading(false)
      const msg = authError.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('unique')) {
        setError('An account with this email already exists. Try signing in instead.')
      } else if (msg.includes('password')) {
        setError('Password must be at least 6 characters.')
      } else {
        setError(authError.message)
      }
      return
    }

    // session is null when Supabase requires email confirmation
    if (!session) {
      setIsLoading(false)
      setEmailSent(true)
      return
    }

    // Auto-confirmed — save extra profile metadata, then go home
    try {
      await updateProfile({ lifeStage: stage, preferredLanguage })
    } catch {
      // Non-critical — profile fields can be filled later
    }

    navigate('/')
  }

  const onGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    setError(null)
    const { error: authError } = await authService.signInWithGoogle()
    if (authError) {
      setIsGoogleLoading(false)
      setError(authError.message || 'Google sign-up failed. Please try again.')
    }
    // On success, Supabase redirects the browser
  }

  // ---- Email confirmation sent state ----
  if (emailSent) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-container-lowest px-6 py-16">
        <div className="pointer-events-none absolute -top-52 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,196,153,.06)_0%,transparent_70%)]" />
        <main className="relative z-10 w-full max-w-[420px] rounded-[20px] border border-white/10 bg-surface px-10 py-9 shadow-[0_0_24px_rgba(255,196,153,.08)] text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
              <MailCheck className="size-7 text-emerald-400" />
            </div>
          </div>
          <h2 className="font-display text-xl font-semibold text-on-surface">Check your email</h2>
          <p className="mt-2 text-sm text-outline leading-relaxed">
            We sent a confirmation link to <span className="text-on-surface font-medium">{email}</span>.
            Click it to activate your account and you're all set.
          </p>
          <p className="mt-4 text-xs text-outline-variant">
            Didn't get it? Check your spam folder or{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => { setEmailSent(false); setPassword(''); setConfirmPassword('') }}
            >
              try again
            </button>
            .
          </p>
          <button
            type="button"
            onClick={() => navigate('/sign-in')}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary hover:opacity-90 transition"
          >
            Go to sign in
            <ArrowRight className="size-4" />
          </button>
        </main>
      </div>
    )
  }

  // ---- Main sign-up form ----
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-container-lowest px-6 py-16">
      <div className="pointer-events-none absolute -top-52 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,196,153,.06)_0%,transparent_70%)]" />

      <main className="relative z-10 w-full max-w-[420px] rounded-[20px] border border-white/10 bg-surface px-10 py-9 shadow-[0_0_24px_rgba(255,196,153,.08)] sm:px-10 sm:py-10">
        <div className="mb-7 flex flex-col items-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-[14px] bg-linear-to-br from-primary-container to-primary shadow-[0_0_24px_rgba(255,196,153,.2)]">
            <Compass className="size-6 text-on-primary" strokeWidth={1.9} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-primary">WhatNext</span>
        </div>

        <h1 className="font-display text-center text-[22px] font-semibold text-on-surface">Create your account</h1>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-outline">
          Free to start. Your paths and progress
          <br />
          will be saved to your account.
        </p>

        {/* Google */}
        <button
          type="button"
          disabled={isGoogleLoading || isLoading}
          onClick={onGoogleSignUp}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-surface-container px-4 py-3 text-sm font-medium text-on-surface transition hover:border-primary/30 hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGoogleLoading ? (
            <Loader2 className="size-[18px] animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden className="size-[18px] shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Sign up with Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-outline-variant">or create with email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-outline">First name</label>
              <input
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); clearError() }}
                type="text"
                placeholder="Rahul"
                autoComplete="given-name"
                className="w-full rounded-[10px] border border-white/10 bg-surface-container px-3.5 py-2.5 text-sm text-on-surface outline-none transition placeholder:text-outline-variant focus:border-primary/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-outline">Last name</label>
              <input
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); clearError() }}
                type="text"
                placeholder="Sharma"
                autoComplete="family-name"
                className="w-full rounded-[10px] border border-white/10 bg-surface-container px-3.5 py-2.5 text-sm text-on-surface outline-none transition placeholder:text-outline-variant focus:border-primary/40"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-1.5 block text-xs font-medium text-outline">Email address</label>
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError() }}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-[10px] border border-white/10 bg-surface-container px-3.5 py-2.5 text-sm text-on-surface outline-none transition placeholder:text-outline-variant focus:border-primary/40"
            />
          </div>

          <div className="mt-3">
            <label className="mb-1.5 block text-xs font-medium text-outline">Password</label>
            <PasswordInput
              value={password}
              onChange={(v) => { setPassword(v); clearError() }}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            <p className="mt-1 text-[11px] text-outline-variant">Use at least 8 characters.</p>
          </div>

          <div className="mt-3">
            <label className="mb-1.5 block text-xs font-medium text-outline">Confirm password</label>
            <PasswordInput
              value={confirmPassword}
              onChange={(v) => { setConfirmPassword(v); clearError() }}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1 text-[11px] text-red-300">Passwords do not match.</p>
            )}
          </div>

          <div className="my-4 h-px bg-white/10" />
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[.07em] text-outline-variant">
            A little about you — helps us personalise your paths
          </p>

          <p className="mb-2 text-xs font-medium text-outline">Preferred language</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {(['English', 'हिंदी', 'বাংলা', 'தமிழ்'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setPreferredLanguage(lang)}
                className={[
                  'rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
                  preferredLanguage === lang
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-white/10 bg-surface-container text-outline hover:border-outline-variant',
                ].join(' ')}
              >
                {lang}
              </button>
            ))}
          </div>

          <p className="mb-2 text-xs font-medium text-outline">Which best describes you?</p>
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {([
              { key: 'Student',        icon: '🎓' },
              { key: 'Working',        icon: '💼' },
              { key: 'Business owner', icon: '🚀' },
              { key: 'Job seeking',    icon: '🔍' },
            ] as const).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setStage(opt.key)}
                className={[
                  'rounded-[10px] border px-3 py-2 text-center text-xs font-medium transition',
                  stage === opt.key
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-white/10 bg-surface-container text-outline hover:border-outline-variant',
                ].join(' ')}
              >
                <span className="block text-base">{opt.icon}</span>
                {opt.key}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                Create my account
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[13px] text-outline-variant">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-primary hover:underline">Sign in →</Link>
        </p>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-outline-variant">
          By creating an account you agree to our{' '}
          <button type="button" className="text-outline underline">Terms of Service</button>
          {' '}and{' '}
          <button type="button" className="text-outline underline">Privacy Policy</button>
        </p>

        <div className="mt-5 border-t border-white/10 pt-4 text-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-4 py-2 text-[13px] text-outline transition hover:border-outline-variant hover:text-on-surface"
            onClick={() => navigate('/')}
          >
            <LogIn className="size-3.5" aria-hidden />
            Skip for now — try as guest
          </button>
        </div>
      </main>
    </div>
  )
}
