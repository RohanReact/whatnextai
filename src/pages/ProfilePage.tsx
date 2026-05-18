import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import { LogOut, Pencil, ArrowRight } from 'lucide-react'
import PageWrapper   from '../components/layout/PageWrapper'
import useAppStore   from '../store/useAppStore'
import { authService }  from '../services/auth'
import { fetchMe, updateProfile } from '../services/api'

// ---- Types -------------------------------------------------------

interface ProfileData {
  user: {
    id:                string
    email:             string
    displayName:       string | null
    avatarUrl:         string | null
    location:          string | null
    lifeStage:         string | null
    preferredLanguage: string
    createdAt:         string
  }
  plan: { tier: string; name: string; desc: string }
  usage: {
    analyses: { used: number; limit: number | null; percent: number; resetAt: string; label: string }
    chat:     { limit: number | null; label: string }
  }
  stats: { totalSessions: number; completedSessions: number }
  recentSessions: Array<{ id: string; situation: string; summary: string; status: string; createdAt: string }>
}

const normalizeProfileData = (raw: unknown): ProfileData => {
  const source = (raw && typeof raw === 'object') ? (raw as Record<string, unknown>) : {}
  const user = (source.user && typeof source.user === 'object')
    ? (source.user as Record<string, unknown>)
    : {}
  const plan = (source.plan && typeof source.plan === 'object')
    ? (source.plan as Record<string, unknown>)
    : {}
  const usage = (source.usage && typeof source.usage === 'object')
    ? (source.usage as Record<string, unknown>)
    : {}
  const analyses = (usage.analyses && typeof usage.analyses === 'object')
    ? (usage.analyses as Record<string, unknown>)
    : {}
  const chat = (usage.chat && typeof usage.chat === 'object')
    ? (usage.chat as Record<string, unknown>)
    : {}
  const stats = (source.stats && typeof source.stats === 'object')
    ? (source.stats as Record<string, unknown>)
    : {}
  const recentSessionsRaw = Array.isArray(source.recentSessions) ? source.recentSessions : []

  return {
    user: {
      id:                typeof user.id === 'string' ? user.id : '',
      email:             typeof user.email === 'string' ? user.email : '',
      displayName:       typeof user.displayName === 'string' ? user.displayName : null,
      avatarUrl:         typeof user.avatarUrl === 'string' ? user.avatarUrl : null,
      location:          typeof user.location === 'string' ? user.location : null,
      lifeStage:         typeof user.lifeStage === 'string' ? user.lifeStage : null,
      preferredLanguage: typeof user.preferredLanguage === 'string' ? user.preferredLanguage : 'English',
      createdAt:         typeof user.createdAt === 'string' ? user.createdAt : new Date().toISOString(),
    },
    plan: {
      tier: typeof plan.tier === 'string' ? plan.tier : 'explorer',
      name: typeof plan.name === 'string' ? plan.name : 'Explorer — Free',
      desc: typeof plan.desc === 'string' ? plan.desc : '3 analyses/month · 5 messages per session',
    },
    usage: {
      analyses: {
        used: typeof analyses.used === 'number' ? analyses.used : 0,
        limit: typeof analyses.limit === 'number' ? analyses.limit : null,
        percent: typeof analyses.percent === 'number' ? analyses.percent : 0,
        resetAt: typeof analyses.resetAt === 'string' ? analyses.resetAt : '',
        label: typeof analyses.label === 'string' ? analyses.label : '0 / 3 used',
      },
      chat: {
        limit: typeof chat.limit === 'number' ? chat.limit : null,
        label: typeof chat.label === 'string' ? chat.label : '5 messages per session',
      },
    },
    stats: {
      totalSessions: typeof stats.totalSessions === 'number' ? stats.totalSessions : 0,
      completedSessions: typeof stats.completedSessions === 'number' ? stats.completedSessions : 0,
    },
    recentSessions: recentSessionsRaw
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map((item) => ({
        id: typeof item.id === 'string' ? item.id : crypto.randomUUID(),
        situation: typeof item.situation === 'string' ? item.situation : 'Untitled session',
        summary: typeof item.summary === 'string' ? item.summary : '',
        status: typeof item.status === 'string' ? item.status : 'in-progress',
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      })),
  }
}

// ---- Helpers -----------------------------------------------------

const LANGUAGES = ['English', 'हिंदी', 'বাংলা', 'தமிழ்'] as const

const LIFE_STAGE_ICONS: Record<string, string> = {
  'Student':        '🎓',
  'Working':        '💼',
  'Business owner': '🚀',
  'Job seeking':    '🔍',
}

const badgeClass = (variant: 'green' | 'amber' | 'blue') => {
  switch (variant) {
    case 'green': return 'bg-[rgba(74,222,128,.1)] text-[#4ade80] border-[0.5px] border-[rgba(74,222,128,.2)]'
    case 'amber': return 'bg-primary/10 text-primary border-[0.5px] border-primary/30'
    case 'blue':  return 'bg-[rgba(147,197,253,.1)] text-[#93c5fd] border-[0.5px] border-[rgba(147,197,253,.2)]'
  }
}

const getInitials = (name: string | null, email: string): string => {
  if (name && name.trim()) return name.trim()[0].toUpperCase()
  return email[0].toUpperCase()
}

const relativeDate = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  const days  = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`
}

// ---- Skeleton ----------------------------------------------------

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/5 ${className ?? ''}`} />
}

function ProfileSkeleton() {
  return (
    <main className="pt-28 pb-20 px-6 max-w-[720px] mx-auto space-y-4">
      <Skeleton className="h-7 w-48 mb-7" />
      <div className="bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-2xl p-6 flex gap-5 items-center">
        <Skeleton className="w-[72px] h-[72px] rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-5 w-52 mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-40 rounded-[14px]" />
      <Skeleton className="h-48 rounded-[14px]" />
    </main>
  )
}

// ---- Main component ----------------------------------------------

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user: authUser, clearAuth } = useAppStore()

  const [data,       setData]      = useState<ProfileData | null>(null)
  const [isLoading,  setIsLoading] = useState(true)
  const [error,      setError]     = useState<string | null>(null)
  const [activeLang, setActiveLang] = useState('English')
  const [isSavingLang, setIsSavingLang] = useState(false)

  // Redirect to sign-in if not logged in
  useEffect(() => {
    if (!authUser && !isLoading) {
      navigate('/sign-in')
    }
  }, [authUser, isLoading, navigate])

  // Load profile on mount
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchMe()
      .then((profileData: unknown) => {
        if (cancelled) return
        const normalized = normalizeProfileData(profileData)
        setData(normalized)
        setActiveLang(normalized.user.preferredLanguage || 'English')
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not load your profile. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const handleSignOut = async () => {
    await authService.signOut()
    clearAuth()
    navigate('/sign-in')
  }

  const handleLangChange = async (lang: string) => {
    setActiveLang(lang)
    setIsSavingLang(true)
    try {
      await updateProfile({ preferredLanguage: lang })
    } catch { /* non-critical */ }
    finally { setIsSavingLang(false) }
  }

  if (isLoading) {
    return <PageWrapper><ProfileSkeleton /></PageWrapper>
  }

  if (error || !data) {
    return (
      <PageWrapper>
        <main className="pt-28 pb-20 px-6 max-w-[720px] mx-auto">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="text-sm text-red-300">{error || 'Profile unavailable.'}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 text-xs text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        </main>
      </PageWrapper>
    )
  }

  const { user, plan, usage, stats, recentSessions } = data
  const displayName = user.displayName || user.email.split('@')[0]
  const initials    = getInitials(user.displayName, user.email)

  // Build badges from real data
  const badges: Array<{ label: string; variant: 'green' | 'amber' | 'blue' }> = [
    { label: plan.tier === 'explorer' ? 'Free plan' : plan.name, variant: 'green' },
    ...(user.lifeStage
      ? [{ label: `${LIFE_STAGE_ICONS[user.lifeStage] ?? '👤'} ${user.lifeStage}`, variant: 'amber' as const }]
      : []),
    ...(user.location
      ? [{ label: user.location, variant: 'blue' as const }]
      : []),
  ]

  return (
    <PageWrapper>
      <main className="pt-28 pb-20 px-6 max-w-[720px] mx-auto">
        <header className="mb-7">
          <h1 className="font-display text-2xl font-semibold text-on-surface tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-outline">Manage your account, preferences, and usage</p>
        </header>

        {/* ── Hero ── */}
        <section className="bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-2xl p-6 mb-4 flex flex-col sm:flex-row gap-5 items-center">
          <div className="relative shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-[72px] h-[72px] rounded-full object-cover"
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-linear-to-br from-primary-container to-primary flex items-center justify-center font-display text-[26px] font-bold text-on-primary select-none">
                {initials}
              </div>
            )}
            <button
              type="button"
              aria-label="Edit avatar"
              className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full bg-primary border-2 border-surface-container flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity"
            >
              <Pencil className="w-2.5 h-2.5" strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="font-display text-xl font-semibold text-on-surface">{displayName}</p>
            <p className="text-[13px] text-outline mt-1">{user.email}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2.5">
              {badges.map((b) => (
                <span
                  key={b.label}
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${badgeClass(b.variant)}`}
                >
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="shrink-0 py-2 px-4 bg-surface-container-low border-[0.5px] border-[#2a2c2c] rounded-lg text-xs font-medium text-outline hover:border-outline-variant hover:text-on-surface transition-colors font-sans"
          >
            Edit profile
          </button>
        </section>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            { value: String(stats.totalSessions),     label: 'Sessions total'     },
            { value: String(stats.completedSessions),  label: 'Paths completed'    },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-xl py-3.5 px-4 text-center"
            >
              <p className="font-display text-[26px] font-bold text-primary leading-none mb-1">{s.value}</p>
              <p className="text-xs text-outline-variant">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Personal information ── */}
        <section className="bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-[14px] p-5 mb-3.5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-on-surface">Personal information</h2>
            <button type="button" className="text-xs text-primary bg-transparent border-none font-sans cursor-pointer hover:underline">
              Edit →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Full name',   value: user.displayName || '—' },
              { label: 'Email',       value: user.email },
              { label: 'Location',    value: user.location   || 'Not set' },
              { label: 'Life stage',  value: user.lifeStage  ? `${LIFE_STAGE_ICONS[user.lifeStage] ?? ''} ${user.lifeStage}` : 'Not set' },
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-outline-variant">{f.label}</span>
                <span className={`text-sm font-medium ${f.value === 'Not set' ? 'text-outline-variant italic' : 'text-on-surface'}`}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Language ── */}
        <section className="bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-[14px] p-5 mb-3.5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-on-surface">Preferred language</h2>
            {isSavingLang && <span className="text-[11px] text-outline-variant">Saving…</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLangChange(lang)}
                className={`py-1.5 px-3.5 rounded-full text-xs font-medium border-[0.5px] transition-all cursor-pointer font-sans ${
                  activeLang === lang
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'border-[#2a2c2c] text-outline bg-surface-container-low hover:border-outline-variant'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </section>

        {/* ── Plan & usage ── */}
        <section className="bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-[14px] p-5 mb-3.5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-on-surface">Plan & usage</h2>
          </div>

          <div className="flex items-center justify-between py-3 px-3.5 bg-surface-container-low rounded-[10px] mb-2.5">
            <div>
              <p className="text-sm font-semibold text-on-surface">{plan.name}</p>
              <p className="text-xs text-outline-variant mt-0.5">{plan.desc}</p>
            </div>
            <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-[rgba(74,222,128,.1)] text-[#4ade80] border-[0.5px] border-[rgba(74,222,128,.2)] shrink-0">
              Active
            </span>
          </div>

          {/* Analyses progress */}
          <div className="flex items-center gap-3 mb-2.5">
            <span className="text-[13px] text-outline w-40 shrink-0">Analyses this month</span>
            <div className="flex-1 bg-surface-container-low rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-primary to-primary-container transition-all"
                style={{ width: `${usage.analyses.percent}%` }}
              />
            </div>
            <span className="text-xs text-outline whitespace-nowrap">{usage.analyses.label}</span>
          </div>

          {/* Chat limit info */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[13px] text-outline w-40 shrink-0">Chat messages</span>
            <span className="text-xs text-outline-variant flex-1">{usage.chat.label}</span>
          </div>

          {plan.tier === 'explorer' && (
            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className="w-full py-3 rounded-[10px] text-[13px] font-semibold text-on-primary font-sans bg-linear-to-br from-primary-container to-primary hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              ⚡ Upgrade to Navigator — ₹299/month
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </section>

        {/* ── Recent sessions ── */}
        <section className="bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-[14px] p-5 mb-3.5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-on-surface">Recent sessions</h2>
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="text-xs text-primary bg-transparent border-none font-sans cursor-pointer hover:underline"
            >
              View all →
            </button>
          </div>

          {recentSessions.length === 0 ? (
            <p className="text-sm text-outline-variant text-center py-4">
              No sessions yet.{' '}
              <button type="button" onClick={() => navigate('/input')} className="text-primary hover:underline">
                Start your first analysis →
              </button>
            </p>
          ) : (
            <ul>
              {recentSessions.map((s) => (
                <li
                  key={s.id}
                  className="flex gap-3 items-start py-2.5 border-b-[0.5px] border-surface-container-low last:border-none last:pb-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate('/history')}
                >
                  <div className="w-[34px] h-[34px] rounded-[9px] bg-surface-container-low flex items-center justify-center text-base shrink-0 select-none">
                    {LIFE_STAGE_ICONS[s.situation?.slice(0, 20)] ?? '💡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-on-surface line-clamp-1">{s.situation}</p>
                    <p className="text-xs text-outline-variant mt-0.5">{relativeDate(s.createdAt)}</p>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 self-center ${
                      s.status === 'completed'
                        ? 'bg-[rgba(74,222,128,.1)] text-[#4ade80]'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {s.status === 'completed' ? 'Completed' : 'In progress'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Account actions ── */}
        <section className="bg-surface-container border-[0.5px] border-red-500/15 rounded-[14px] p-5 mb-3.5">
          <h2 className="text-[13px] font-semibold text-red-400 mb-3">Account actions</h2>
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-on-surface">Clear all history</p>
                <p className="text-xs text-outline-variant mt-0.5">Remove all past sessions and results permanently</p>
              </div>
              <button
                type="button"
                className="py-2 px-3.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/8 border-[0.5px] border-red-500/20 hover:bg-red-500/15 transition-colors font-sans whitespace-nowrap self-start sm:self-center"
              >
                Clear history
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-on-surface">Delete account</p>
                <p className="text-xs text-outline-variant mt-0.5">Permanently delete your account and all data</p>
              </div>
              <button
                type="button"
                className="py-2 px-3.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/8 border-[0.5px] border-red-500/20 hover:bg-red-500/15 transition-colors font-sans whitespace-nowrap self-start sm:self-center"
              >
                Delete account
              </button>
            </div>
          </div>
        </section>

        {/* ── Sign out ── */}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full py-3.5 bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-xl text-sm font-medium text-outline hover:border-outline-variant hover:text-on-surface transition-colors font-sans flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.4} />
          Sign out
        </button>
      </main>
    </PageWrapper>
  )
}
