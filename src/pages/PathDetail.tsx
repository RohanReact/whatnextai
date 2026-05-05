import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import useAppStore from '../store/useAppStore'

export default function PathDetail() {
  const navigate = useNavigate()
  const params = useParams()
  const currentSession = useAppStore((state) => state.currentSession)
  const setCurrentSession = useAppStore((state) => state.setCurrentSession)
  const pathId = Number(params.id)

  const path = useMemo(
    () => currentSession?.result.paths.find((item) => item.id === pathId),
    [currentSession, pathId]
  )

  const pathKey = String(pathId)
  const stepStatus = currentSession?.pathStepStatus?.[pathKey] ?? (path?.steps.map(() => false) || [])
  const completedCount = stepStatus.filter(Boolean).length
  const totalSteps = path?.steps.length || 0
  const progress = totalSteps ? Math.round((completedCount / totalSteps) * 100) : 0

  useEffect(() => {
    if (!currentSession || !path) return
    if (!currentSession.pathStepStatus?.[pathKey]) {
      setCurrentSession({
        ...currentSession,
        chosenPathId: path.id,
        pathStepStatus: {
          ...(currentSession.pathStepStatus || {}),
          [pathKey]: path.steps.map(() => false),
        },
      })
    }
  }, [currentSession, path, pathKey, setCurrentSession])

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.92
    window.speechSynthesis.speak(utterance)
  }

  const markCurrentStepDone = () => {
    if (!currentSession || !path) return
    const nextSteps = [...(currentSession.pathStepStatus?.[pathKey] || path.steps.map(() => false))]
    const firstOpenIndex = nextSteps.findIndex((done) => !done)
    if (firstOpenIndex === -1) return
    nextSteps[firstOpenIndex] = true
    setCurrentSession({
      ...currentSession,
      chosenPathId: path.id,
      pathStepStatus: { ...(currentSession.pathStepStatus || {}), [pathKey]: nextSteps },
    })
  }

  const speakAllSteps = () => {
    if (!path) return
    speakText(path.steps.map((step, index) => `Step ${index + 1}. ${step}`).join(' '))
  }

  if (!currentSession || !path) {
    return (
      <PageWrapper>
        <main className="mx-auto min-h-[70vh] max-w-4xl px-6 pb-24 pt-28">
          <p className="text-on-surface-variant">Path not found.</p>
        </main>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-24">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <button onClick={() => navigate('/results')}>Back to paths</button>
          <span>·</span>
          <span className="text-primary">{path.title}</span>
        </div>

        <section className="mt-4 rounded-2xl border border-white/10 bg-surface-container p-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">
              Your progress - Step {Math.min(completedCount + 1, totalSteps)} of {totalSteps}
            </span>
            <span className="text-green-300">{progress}% complete</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-container-highest">
            <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500" style={{ width: `${progress}%` }} />
          </div>
        </section>

        <section className="mt-3 rounded-2xl border border-white/10 bg-surface-container p-6">
          <h1 className="font-display text-3xl">{path.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-green-300">{path.difficulty}</span>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-blue-300">{path.timeEstimate}</span>
            {path.recommended && <span className="rounded-full border border-primary-container/30 bg-primary-container/10 px-3 py-1 text-primary">Recommended</span>}
          </div>
          <p className="mt-4 text-on-surface-variant">{path.description}</p>
          <button onClick={() => speakText(path.description)} className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs text-blue-300">
            Read aloud
          </button>
        </section>

        <section className="mt-3 rounded-2xl border border-white/10 bg-surface-container p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-dim">Your steps</p>
          <div className="mt-4 space-y-4">
            {path.steps.map((step, index) => {
              const done = stepStatus[index]
              return (
                <div key={`${path.id}-${index}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        if (!currentSession) return
                        const next = [...stepStatus]
                        next[index] = !next[index]
                        setCurrentSession({
                          ...currentSession,
                          chosenPathId: path.id,
                          pathStepStatus: { ...(currentSession.pathStepStatus || {}), [pathKey]: next },
                        })
                      }}
                      className={`h-8 w-8 rounded-full border text-xs font-semibold ${done ? 'border-green-400 bg-green-500/10 text-green-300' : 'border-white/20 bg-surface-container-low text-on-surface-variant'}`}
                    >
                      {done ? '✓' : index + 1}
                    </button>
                    {index !== path.steps.length - 1 && <div className="mt-1 h-6 w-px bg-white/10" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className={`${done ? 'text-green-300' : 'text-on-surface'} text-sm leading-relaxed`}>{step}</p>
                    <button onClick={() => speakText(step)} className="mt-1 text-xs text-blue-300">
                      Read step
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-3 rounded-2xl border border-white/10 bg-surface-container p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-dim">Why this works + what to avoid</p>
          <p className="mt-3 text-sm text-on-surface-variant">{path.whyItWorks}</p>
          <div className="my-4 h-px bg-white/10" />
          <p className="text-sm text-on-surface-variant">{path.commonMistake}</p>
        </section>

        <section className="mt-3 rounded-2xl border border-white/10 bg-surface-container p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-dim">Tools for this path</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {path.tools.map((tool) => (
              <div key={tool} className="rounded-lg border border-white/10 bg-surface-container-high p-3 text-sm text-on-surface">
                {tool}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={markCurrentStepDone} className="rounded-xl bg-primary-container px-5 py-3 font-semibold text-on-primary">
            Mark next step done
          </button>
          <button onClick={speakAllSteps} className="rounded-xl border border-white/15 bg-surface-container-high px-5 py-3 font-semibold text-on-surface-variant">
            Read all steps
          </button>
          <button onClick={() => navigate(`/chat/${path.id}`)} className="rounded-xl border border-primary-container/30 bg-primary-container/10 px-5 py-3 font-semibold text-primary">
            Open Follow-up Chat
          </button>
        </div>
      </main>
    </PageWrapper>
  )
}
