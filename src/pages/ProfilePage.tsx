import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Pencil } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'

/** Placeholder profile payload until backend auth/profile exists. */
const DUMMY = {
  initials: 'R',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  badges: [
    { label: 'Free plan', variant: 'green' as const },
    { label: '🚀 Business owner', variant: 'amber' as const },
    { label: 'Siliguri, WB', variant: 'blue' as const },
  ],
  stats: [
    { value: '7', label: 'Sessions total' },
    { value: '3', label: 'Paths completed' },
    { value: '12', label: 'Day streak 🔥' },
  ],
  personal: [
    { label: 'Full name', value: 'Rahul Sharma' },
    { label: 'Email', value: 'rahul@example.com' },
    { label: 'Location', value: 'Siliguri, West Bengal' },
    { label: 'Life stage', value: '🚀 Business owner' },
    { label: 'Budget comfort', value: 'Under ₹1000' },
    { label: 'Time available', value: '1–2 hours/day' },
  ],
  languages: ['English', 'हिंदी', 'বাংলা', 'தமிழ்'] as const,
  plan: {
    name: 'Explorer — Free',
    desc: '3 analyses/month · 5 messages each',
    analysesPercent: 66,
    analysesLabel: '2 / 3 used',
    chatPercent: 40,
    chatLabel: '8 / 20 used',
    upgradeCta: '⚡ Upgrade to Navigator — ₹299/month',
  },
  recentSessions: [
    {
      icon: '🎨',
      title: 'Starting a YouTube travel channel',
      meta: '2 days ago · Easy path chosen',
      status: 'progress' as const,
    },
    {
      icon: '🚀',
      title: 'Taking tailoring shop online',
      meta: '1 week ago · Medium path chosen',
      status: 'done' as const,
    },
    {
      icon: '💰',
      title: 'Start saving with low salary',
      meta: '2 weeks ago · Easy path chosen',
      status: 'done' as const,
    },
  ],
}

function badgeClass(variant: 'green' | 'amber' | 'blue') {
  switch (variant) {
    case 'green':
      return 'bg-[rgba(74,222,128,.1)] text-[#4ade80] border-[0.5px] border-[rgba(74,222,128,.2)]'
    case 'amber':
      return 'bg-primary/10 text-primary border-[0.5px] border-primary/30'
    case 'blue':
      return 'bg-[rgba(147,197,253,.1)] text-[#93c5fd] border-[0.5px] border-[rgba(147,197,253,.2)]'
  }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<string>(DUMMY.languages[0])

  return (
    <PageWrapper>
      <main className="pt-28 pb-20 px-6 max-w-[720px] mx-auto">
        <header className="mb-7">
          <h1 className="font-display text-2xl font-semibold text-on-surface tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-outline">Manage your account, preferences, and usage</p>
        </header>

        {/* Hero */}
        <section className="bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-2xl p-6 mb-4 flex flex-col sm:flex-row gap-5 items-center">
          <div className="relative shrink-0">
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center font-display text-[26px] font-bold text-on-primary">
              {DUMMY.initials}
            </div>
            <button
              type="button"
              aria-label="Edit avatar"
              className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full bg-primary border-2 border-surface-container flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity"
            >
              <Pencil className="w-2.5 h-2.5" strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="font-display text-xl font-semibold text-on-surface">{DUMMY.name}</p>
            <p className="text-[13px] text-outline mt-1">{DUMMY.email}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2.5">
              {DUMMY.badges.map((b) => (
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {DUMMY.stats.map((s) => (
            <div
              key={s.label}
              className="bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-xl py-3.5 px-4 text-center"
            >
              <p className="font-display text-[26px] font-bold text-primary leading-none mb-1">{s.value}</p>
              <p className="text-xs text-outline-variant">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Personal */}
        <section className="bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-[14px] p-5 mb-3.5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-on-surface">Personal information</h2>
            <button type="button" className="text-xs text-primary bg-transparent border-none font-sans cursor-pointer hover:underline">
              Edit →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DUMMY.personal.map((f) => (
              <div key={f.label} className="flex flex-col gap-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-outline-variant">{f.label}</span>
                <span className="text-sm font-medium text-on-surface">{f.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Language */}
        <section className="bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-[14px] p-5 mb-3.5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-on-surface">Preferred language</h2>
            <button type="button" className="text-xs text-primary bg-transparent border-none font-sans cursor-pointer hover:underline">
              Change →
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {DUMMY.languages.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`py-1.5 px-3.5 rounded-full text-xs font-medium border-[0.5px] transition-all cursor-pointer font-sans ${
                  lang === code
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'border-[#2a2c2c] text-outline bg-surface-container-low hover:border-outline-variant'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </section>

        {/* Plan & usage */}
        <section className="bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-[14px] p-5 mb-3.5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-on-surface">Plan & usage</h2>
          </div>
          <div className="flex items-center justify-between py-3 px-3.5 bg-surface-container-low rounded-[10px] mb-2.5">
            <div>
              <p className="text-sm font-semibold text-on-surface">{DUMMY.plan.name}</p>
              <p className="text-xs text-outline-variant mt-0.5">{DUMMY.plan.desc}</p>
            </div>
            <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-[rgba(74,222,128,.1)] text-[#4ade80] border-[0.5px] border-[rgba(74,222,128,.2)] shrink-0">
              Active
            </span>
          </div>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="text-[13px] text-outline w-40 shrink-0">Analyses this month</span>
            <div className="flex-1 bg-surface-container-low rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container"
                style={{ width: `${DUMMY.plan.analysesPercent}%` }}
              />
            </div>
            <span className="text-xs text-outline whitespace-nowrap">{DUMMY.plan.analysesLabel}</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[13px] text-outline w-40 shrink-0">Chat messages</span>
            <div className="flex-1 bg-surface-container-low rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container"
                style={{ width: `${DUMMY.plan.chatPercent}%` }}
              />
            </div>
            <span className="text-xs text-outline whitespace-nowrap">{DUMMY.plan.chatLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/pricing')}
            className="w-full py-3 rounded-[10px] text-[13px] font-semibold text-on-primary font-sans bg-gradient-to-br from-primary-container to-primary hover:opacity-95 transition-opacity"
          >
            {DUMMY.plan.upgradeCta}
          </button>
        </section>

        {/* Recent */}
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
          <ul className="space-y-0">
            {DUMMY.recentSessions.map((s) => (
              <li
                key={s.title}
                className="flex gap-3 items-start py-2.5 border-b-[0.5px] border-surface-container-low last:border-none last:pb-0"
              >
                <div className="w-[34px] h-[34px] rounded-[9px] bg-surface-container-low flex items-center justify-center text-base shrink-0">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-on-surface">{s.title}</p>
                  <p className="text-xs text-outline-variant mt-0.5">{s.meta}</p>
                </div>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 self-center ${
                    s.status === 'progress'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-[rgba(74,222,128,.1)] text-[#4ade80]'
                  }`}
                >
                  {s.status === 'progress' ? 'In progress' : 'Completed'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Danger */}
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

        <button
          type="button"
          onClick={() => navigate('/sign-in')}
          className="w-full py-3.5 bg-surface-container border-[0.5px] border-[#2a2c2c] rounded-xl text-sm font-medium text-outline hover:border-outline-variant hover:text-on-surface transition-colors font-sans flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.4} />
          Sign out
        </button>
      </main>
    </PageWrapper>
  )
}
