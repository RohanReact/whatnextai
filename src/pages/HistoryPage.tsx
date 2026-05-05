import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import useAppStore from '../store/useAppStore'
import { formatDate } from '../utils/helpers'

export default function HistoryPage() {
  const navigate = useNavigate()
  const history = useAppStore((state) => state.history)
  const setCurrentSession = useAppStore((state) => state.setCurrentSession)

  return (
    <PageWrapper>
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-28">
        <h1 className="font-display text-4xl">History</h1>
        <div className="mt-8 space-y-4">
          {history.length === 0 && <p className="text-on-surface-variant">No saved sessions yet.</p>}
          {history.map((session) => (
            <article key={session.id} className="glass-card rounded-2xl p-5">
              <p className="text-xs text-on-surface-variant">{formatDate(session.createdAt)}</p>
              <h2 className="mt-2 font-display text-2xl">{session.category}</h2>
              <p className="mt-2 text-sm text-on-surface-variant line-clamp-2">{session.situation}</p>
              <button
                onClick={() => {
                  setCurrentSession(session)
                  navigate('/results')
                }}
                className="mt-4 rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary"
              >
                Reopen Session
              </button>
            </article>
          ))}
        </div>
      </main>
    </PageWrapper>
  )
}
