import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import GuestAuthBanner from '../components/GuestAuthBanner'
import LimitReachedModal from '../components/LimitReachedModal'
import Toggle from '../components/ui/Toggle'
import { GUEST_ANALYSIS_LIMIT } from '../constants/guest'
import {
  analyzeInput,
  fetchAnalysisQuota,
  isLimitReachedError,
  quotaToLimitPayload,
  type AnalysisQuota,
  type LimitReachedPayload,
} from '../services/api'
import useAppStore from '../store/useAppStore'
import { Session } from '../types'
import { createSessionId } from '../utils/helpers'

const categories = ['Learning', 'Career', 'Business', 'Tech', 'Creative', 'Personal', 'Other']

const btnBase =
  'cursor-pointer transition-all hover:opacity-95 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'

export default function InputForm() {
  const navigate = useNavigate()
  const authUser = useAppStore((state) => state.user)
  const guestAnalysesUsed = useAppStore((state) => state.guestAnalysesUsed)
  const markGuestAnalysisUsed = useAppStore((state) => state.markGuestAnalysisUsed)
  const setCurrentSession = useAppStore((state) => state.setCurrentSession)
  const addToHistory = useAppStore((state) => state.addToHistory)
  const setLoading = useAppStore((state) => state.setLoading)
  const setError = useAppStore((state) => state.setError)

  const [situation, setSituation] = useState('')
  const [blockage, setBlockage] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [wantsDownloads, setWantsDownloads] = useState(true)
  const [quota, setQuota] = useState<AnalysisQuota | null>(null)
  const [isCheckingQuota, setIsCheckingQuota] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [limitPayload, setLimitPayload] = useState<LimitReachedPayload | null>(null)
  const [limitModalOpen, setLimitModalOpen] = useState(false)

  const refreshQuota = useCallback(async () => {
    if (!authUser) {
      setQuota(null)
      return
    }
    setIsCheckingQuota(true)
    try {
      const next = await fetchAnalysisQuota()
      setQuota(next)
    } catch {
      setQuota(null)
    } finally {
      setIsCheckingQuota(false)
    }
  }, [authUser])

  useEffect(() => {
    refreshQuota()
  }, [refreshQuota])

  const showLimitModal = (payload: LimitReachedPayload) => {
    setLimitPayload(payload)
    setLimitModalOpen(true)
  }

  const closeLimitModal = () => {
    setLimitModalOpen(false)
  }

  const isGuest = !authUser
  const guestAtLimit = isGuest && guestAnalysesUsed >= GUEST_ANALYSIS_LIMIT

  const checkQuotaBeforeAnalyze = async (): Promise<boolean> => {
    if (isGuest) {
      if (guestAtLimit) return false
      return true
    }

    try {
      const latest = await fetchAnalysisQuota()
      setQuota(latest)
      const blocked = quotaToLimitPayload(latest)
      if (blocked) {
        showLimitModal(blocked)
        return false
      }
      return true
    } catch {
      return true
    }
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!situation.trim() || !blockage.trim() || isSubmitting) return

    setError(null)

    const canProceed = await checkQuotaBeforeAnalyze()
    if (!canProceed) return

    if (isGuest && guestAtLimit) return

    setIsSubmitting(true)
    setLoading(true)
    navigate('/loading')

    try {
      const result = await analyzeInput(situation, blockage, category, wantsDownloads)
      const resolvedSessionId = authUser && result.sessionId ? result.sessionId : createSessionId()
      const session: Session = {
        id: resolvedSessionId,
        createdAt: new Date(),
        category,
        situation,
        blockage,
        result,
        status: 'in-progress',
        messages: [],
      }

      setCurrentSession(session)
      addToHistory(session)
      if (isGuest) markGuestAnalysisUsed()
      await refreshQuota()
      navigate('/results')
    } catch (error: unknown) {
      const limit = isLimitReachedError(error)
      if (limit) {
        setQuota((q) =>
          q
            ? { ...q, allowed: false, used: limit.used, limit: limit.limit, message: limit.message }
            : null
        )
        showLimitModal(limit)
        navigate('/input')
        return
      }

      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: string; message?: string } } }).response?.data
          ?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response!.data!.message!
          : typeof error === 'object' &&
              error !== null &&
              'response' in error &&
              typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error ===
                'string'
            ? (error as { response?: { data?: { error?: string } } }).response!.data!.error!
            : 'We could not analyze your input right now.'
      setError(message)
      navigate('/error')
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  const atLimit = authUser
    ? quota != null && quota.limit != null && !quota.allowed
    : guestAtLimit
  const remaining = quota?.limit != null ? Math.max(quota.limit - quota.used, 0) : null
  const formDisabled = atLimit || isSubmitting

  return (
    <PageWrapper>
      <LimitReachedModal open={limitModalOpen} payload={limitPayload} onClose={closeLimitModal} />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-28">
        <h1 className="font-display text-4xl text-on-surface">Tell us your current situation</h1>
        <p className="mt-3 text-on-surface-variant">Two quick inputs and we will map your options.</p>

        {isGuest && (
          <div className="mt-6">
            <GuestAuthBanner
              analysesUsed={guestAnalysesUsed}
              variant={guestAtLimit ? 'exhausted' : 'default'}
            />
          </div>
        )}

        {authUser && quota?.limit != null && (
          <div
            className={`mt-6 flex gap-3 rounded-xl border px-4 py-3.5 ${
              atLimit
                ? 'border-amber-500/30 bg-amber-500/10'
                : remaining === 1
                  ? 'border-primary/25 bg-primary/8'
                  : 'border-white/10 bg-surface-container-low'
            }`}
          >
            <AlertCircle
              className={`mt-0.5 h-5 w-5 shrink-0 ${atLimit ? 'text-amber-400' : 'text-primary'}`}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              {atLimit ? (
                <>
                  <p className="text-sm font-semibold text-amber-200">No analyses left this month</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{quota.message}</p>
                  <button
                    type="button"
                    onClick={() => {
                      const blocked = quotaToLimitPayload(quota)
                      if (blocked) showLimitModal(blocked)
                    }}
                    className="mt-2 text-sm font-medium text-primary underline-offset-2 hover:underline"
                  >
                    View options →
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-on-surface">
                    {remaining === 1
                      ? '1 free analysis left this month'
                      : `${quota.used} of ${quota.limit} analyses used this month`}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-primary to-primary-container transition-all"
                      style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {authUser && isCheckingQuota && !quota && (
          <p className="mt-4 text-xs text-outline-variant">Checking your plan usage…</p>
        )}

        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm text-on-surface-variant">What are you trying to do?</span>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="min-h-[140px] w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 text-on-surface outline-none transition focus:border-primary/40"
              placeholder="I am trying to..."
              required
              disabled={formDisabled}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-on-surface-variant">What is blocking you right now?</span>
            <textarea
              value={blockage}
              onChange={(e) => setBlockage(e.target.value)}
              className="min-h-[120px] w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 text-on-surface outline-none transition focus:border-primary/40"
              placeholder="The main blocker is..."
              required
              disabled={formDisabled}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-on-surface-variant">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 text-on-surface outline-none transition focus:border-primary/40"
              disabled={formDisabled}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-surface-container-low p-4">
            <div>
              <p className="font-semibold">Include downloadable resources</p>
              <p className="text-sm text-on-surface-variant">Guides and checklists where useful</p>
            </div>
            <Toggle checked={wantsDownloads} onChange={setWantsDownloads} />
          </div>

          <button
            type="submit"
            disabled={formDisabled}
            className={`w-full rounded-xl bg-primary-container px-8 py-4 font-display text-lg font-bold text-on-primary ${btnBase}`}
          >
            {guestAtLimit
              ? 'Sign in to continue'
              : atLimit
                ? 'Monthly limit reached'
                : isSubmitting
                  ? 'Starting analysis…'
                  : 'Find My Next Steps'}
          </button>

          {atLimit && authUser && (
            <p className="text-center text-xs text-outline-variant">
              Upgrade for unlimited analyses, or wait until your free quota resets.
            </p>
          )}
        </form>
      </main>
    </PageWrapper>
  )
}
