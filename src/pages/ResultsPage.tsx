import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import useAppStore from '../store/useAppStore'

export default function ResultsPage() {
  const navigate = useNavigate()
  const currentSession = useAppStore((state) => state.currentSession)
  const setCurrentSession = useAppStore((state) => state.setCurrentSession)

  if (!currentSession) {
    return (
      <PageWrapper>
        <main className="mx-auto min-h-[70vh] max-w-4xl px-6 pb-24 pt-28">
          <p className="text-on-surface-variant">No active paths yet. Submit your situation to generate your plan.</p>
        </main>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        <header className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary-container/30 bg-primary-container/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-primary">
            Navigation Results Generated
          </div>
          <h1 className="mt-4 font-display text-4xl text-on-surface">My Paths Forward</h1>
          <p className="mx-auto mt-3 max-w-3xl text-on-surface-variant">{currentSession.result.summary}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => navigate('/history')} className="rounded-lg bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface-variant">
              History
            </button>
            <button
              onClick={() => navigate(`/chat/${currentSession.chosenPathId ?? currentSession.result.paths[0].id}`)}
              className="rounded-lg bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface-variant"
            >
              Chat for Context
            </button>
          </div>
        </header>

        <div className="mt-10 space-y-5">
          {currentSession.result.paths.map((path, index) => {
            const selected = currentSession.chosenPathId === path.id
            return (
              <article
                key={path.id}
                className={`relative overflow-hidden rounded-2xl border p-6 transition-colors ${
                  selected ? 'border-primary-container/50 bg-primary-container/10' : 'border-white/10 bg-surface-container'
                }`}
              >
                <span className="pointer-events-none absolute -right-4 -top-8 font-display text-8xl font-bold text-white/5">
                  {index + 1}
                </span>
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary">{path.difficulty}</p>
                      <h2 className="mt-2 font-display text-2xl text-on-surface">{path.title}</h2>
                    </div>
                    {selected && (
                      <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">Chosen</span>
                    )}
                  </div>
                  <p className="mt-3 text-on-surface-variant">{path.description}</p>
                  <p className="mt-3 text-xs text-text-dim">Estimated timeline: {path.timeEstimate}</p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setCurrentSession({ ...currentSession, chosenPathId: path.id })
                        navigate(`/path/${path.id}`)
                      }}
                      className="rounded-xl bg-primary-container px-5 py-3 font-semibold text-on-primary"
                    >
                      Explore This Path
                    </button>
                    <button
                      onClick={() => {
                        setCurrentSession({ ...currentSession, chosenPathId: path.id })
                        navigate(`/chat/${path.id}`)
                      }}
                      className="rounded-xl border border-white/15 bg-surface-container-high px-5 py-3 font-semibold text-on-surface-variant"
                    >
                      Open Follow-up Chat
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </main>
    </PageWrapper>
  )
}
