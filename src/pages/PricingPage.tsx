import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import api from '../services/api'

type PlanId = 'explorer' | 'navigator' | 'guide'

type Plan = {
  id: PlanId
  name: string
  price: string
  sub: string
  featured?: boolean
  badge?: string
  features: Array<{ text: string; included: boolean }>
  cta: { label: string; action: 'start' | 'waitlist' }
}

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

export default function PricingPage() {
  const navigate = useNavigate()
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('navigator')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string>('')
  const [counts, setCounts] = useState<{ total: number; byPlan: Record<string, number> } | null>(null)

  const plans: Plan[] = useMemo(
    () => [
      {
        id: 'explorer',
        name: 'Explorer',
        price: 'Free',
        sub: 'Forever free',
        features: [
          { text: '3 analyses per month', included: true },
          { text: 'Basic path output', included: true },
          { text: '5 follow-up messages', included: true },
          { text: 'No downloads', included: false },
          { text: 'No history', included: false },
        ],
        cta: { label: 'Get started', action: 'start' },
      },
      {
        id: 'navigator',
        name: 'Navigator',
        price: '₹299/mo',
        sub: '~$3.5 USD',
        featured: true,
        badge: 'Popular',
        features: [
          { text: 'Unlimited analyses', included: true },
          { text: 'Deeper path detail', included: true },
          { text: 'Unlimited chat', included: true },
          { text: 'PDF + checklist downloads', included: true },
          { text: 'Full history + tracking', included: true },
        ],
        cta: { label: 'Join waiting list', action: 'waitlist' },
      },
      {
        id: 'guide',
        name: 'Guide',
        price: '₹799/mo',
        sub: 'For coaches and teams',
        features: [
          { text: 'Everything in Navigator', included: true },
          { text: '5 team members', included: true },
          { text: 'PPT export', included: true },
          { text: 'Priority AI responses', included: true },
          { text: 'White-label option', included: true },
        ],
        cta: { label: 'Join waiting list', action: 'waitlist' },
      },
    ],
    []
  )

  const openWaitlist = (planId: PlanId) => {
    setSelectedPlan(planId)
    setWaitlistOpen(true)
    setStatus('idle')
    setError('')
    setCounts(null)
  }

  const closeWaitlist = () => {
    setWaitlistOpen(false)
    setStatus('idle')
    setError('')
    setCounts(null)
  }

  const submitWaitlist = async () => {
    const trimmed = email.trim()
    if (!isValidEmail(trimmed)) {
      setStatus('error')
      setError('Please enter a valid email.')
      return
    }

    setStatus('submitting')
    setError('')

    try {
      const response = await api.post('/waitlist', { email: trimmed, plan: selectedPlan })
      const data = response.data as {
        success: boolean
        counts?: { total: number; byPlan: Record<string, number> }
        error?: string
      }
      if (!data.success) throw new Error(data.error || 'Failed to join waitlist')
      setCounts(data.counts || null)
      setStatus('success')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to join waitlist'
      setStatus('error')
      setError(message)
    }
  }

  const selectedPlanLabel = plans.find((p) => p.id === selectedPlan)?.name || 'Navigator'

  return (
    <PageWrapper>
      <main className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="font-display tracking-tight text-4xl md:text-5xl font-bold text-primary-container">
            Pricing
          </h1>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Free to try. Pay only when it proves value. For now, paid plans are in early access — join the waiting list
            so we can build what people actually want.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={plan.featured ? 'md:-mt-3' : ''}>
              <Card>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-100 font-display tracking-tight">{plan.name}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-50">{plan.price}</p>
                    <p className="mt-1 text-sm text-slate-400">{plan.sub}</p>
                  </div>
                  {plan.badge && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-container/15 text-primary-container border border-primary-container/25">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feat) => (
                    <div key={feat.text} className="flex items-start gap-3 text-sm text-slate-300">
                      {feat.included ? (
                        <Check className="mt-0.5 text-emerald-400" size={16} />
                      ) : (
                        <X className="mt-0.5 text-slate-500" size={16} />
                      )}
                      <span className={feat.included ? '' : 'text-slate-400'}>{feat.text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <Button
                    className={`w-full ${plan.featured ? '' : 'bg-white/10 text-slate-100 hover:opacity-100 hover:bg-white/15'} ${
                      plan.id === 'explorer' ? '' : ''
                    }`}
                    onClick={() => {
                      if (plan.cta.action === 'start') navigate('/input')
                      else openWaitlist(plan.id)
                    }}
                  >
                    {plan.cta.label}
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-10 text-sm text-slate-500">
          Explorer is free for everyone right now. Navigator &amp; Guide are coming soon.
        </div>
      </main>

      {waitlistOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-background p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-100 font-display tracking-tight">
                  Join the waiting list
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Plan: <span className="text-slate-200">{selectedPlanLabel}</span>
                </p>
              </div>
              <button
                onClick={closeWaitlist}
                className="text-slate-400 hover:text-slate-200 rounded-lg px-2 py-1 hover:bg-white/5"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5">
              <label className="block text-sm text-slate-300 mb-2">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-slate-100 outline-none focus:border-primary-container/40"
              />
              <p className="mt-2 text-xs text-slate-500">We’ll only use this to contact you when early access opens.</p>
            </div>

            {status === 'error' && <div className="mt-4 text-sm text-red-300">{error}</div>}
            {status === 'success' && (
              <div className="mt-4 text-sm text-emerald-300">
                You’re on the list. Thanks!
                {counts && (
                  <div className="mt-2 text-xs text-slate-400">
                    Current interest: {counts.total} total
                    {typeof counts.byPlan?.navigator === 'number' ? ` • Navigator: ${counts.byPlan.navigator}` : ''}
                    {typeof counts.byPlan?.guide === 'number' ? ` • Guide: ${counts.byPlan.guide}` : ''}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeWaitlist}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-slate-100 font-display font-semibold hover:bg-white/10"
              >
                Cancel
              </button>
              <Button className="flex-1" onClick={submitWaitlist} disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Joining…' : 'Join waiting list'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}

