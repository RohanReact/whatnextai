import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Toggle from '../components/ui/Toggle'
import { analyzeInput } from '../services/api'
import useAppStore from '../store/useAppStore'
import { Session } from '../types'
import { createSessionId } from '../utils/helpers'

const categories = ['Learning', 'Career', 'Business', 'Tech', 'Creative', 'Personal', 'Other']

export default function InputForm() {
  const navigate = useNavigate()
  const setCurrentSession = useAppStore((state) => state.setCurrentSession)
  const addToHistory = useAppStore((state) => state.addToHistory)
  const setLoading = useAppStore((state) => state.setLoading)
  const setError = useAppStore((state) => state.setError)

  const [situation, setSituation] = useState('')
  const [blockage, setBlockage] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [wantsDownloads, setWantsDownloads] = useState(true)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!situation.trim() || !blockage.trim()) return

    setError(null)
    setLoading(true)
    navigate('/loading')

    try {
      const result = await analyzeInput(situation, blockage, category, wantsDownloads)
      const session: Session = {
        id: createSessionId(),
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
      navigate('/results')
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'We could not analyze your input right now.'
      setError(message || 'We could not analyze your input right now.')
      navigate('/error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-28">
        <h1 className="font-display text-4xl text-on-surface">Tell us your current situation</h1>
        <p className="mt-3 text-on-surface-variant">Two quick inputs and we will map your options.</p>

        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm text-on-surface-variant">What are you trying to do?</span>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="min-h-[140px] w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4"
              placeholder="I am trying to..."
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-on-surface-variant">What is blocking you right now?</span>
            <textarea
              value={blockage}
              onChange={(e) => setBlockage(e.target.value)}
              className="min-h-[120px] w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4"
              placeholder="The main blocker is..."
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-on-surface-variant">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4">
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

          <button type="submit" className="w-full rounded-xl bg-primary-container px-8 py-4 font-display text-lg font-bold text-on-primary">
            Find My Next Steps
          </button>
        </form>
      </main>
    </PageWrapper>
  )
}
