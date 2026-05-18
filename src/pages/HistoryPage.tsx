import { useEffect, useState } from 'react'
import { useNavigate }          from 'react-router-dom'
import { Clock, ArrowRight }    from 'lucide-react'
import PageWrapper   from '../components/layout/PageWrapper'
import useAppStore   from '../store/useAppStore'
import { fetchSessions } from '../services/api'

interface SessionSummary {
  id:        string
  category:  string
  situation: string
  summary:   string
  status:    string
  created_at: string
}

const relativeDate = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  const days  = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/5 ${className ?? ''}`} />
}

export default function HistoryPage() {
  const navigate  = useNavigate()
  const authUser  = useAppStore((s) => s.user)

  const [sessions,  setSessions]  = useState<SessionSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    // Guest users — no server history, show local Zustand sessions or empty
    if (!authUser) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    fetchSessions()
      .then((data) => { if (!cancelled) setSessions(data as SessionSummary[]) })
      .catch(() => { if (!cancelled) setError('Could not load history. Please try again.') })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [authUser])

  return (
    <PageWrapper>
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-28">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-6 h-6 text-primary-container" />
          <h1 className="font-display text-4xl">History</h1>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-5 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-32 mt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Not signed in */}
        {!isLoading && !error && !authUser && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-on-surface-variant mb-4">Sign in to see your full session history saved across devices.</p>
            <button
              onClick={() => navigate('/sign-in')}
              className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Sign in <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Empty signed-in state */}
        {!isLoading && !error && authUser && sessions.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-on-surface-variant mb-4">No sessions yet. Start your first analysis to see your history here.</p>
            <button
              onClick={() => navigate('/input')}
              className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Start an analysis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Session list */}
        {!isLoading && !error && sessions.length > 0 && (
          <div className="space-y-4">
            {sessions.map((session) => (
              <article key={session.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs text-on-surface-variant">{relativeDate(session.created_at)}</p>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                      session.status === 'completed'
                        ? 'bg-[rgba(74,222,128,.1)] text-[#4ade80]'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {session.status === 'completed' ? 'Completed' : 'In progress'}
                  </span>
                </div>
                <h2 className="font-display text-xl text-on-surface">{session.category}</h2>
                <p className="mt-1 text-sm text-on-surface-variant line-clamp-2">{session.situation}</p>
                {session.summary && (
                  <p className="mt-1.5 text-xs text-outline italic line-clamp-1">{session.summary}</p>
                )}
                <button
                  onClick={() => navigate(`/sessions/${session.id}`)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity"
                >
                  Open session <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </PageWrapper>
  )
}
