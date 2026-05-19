import { FormEvent, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowUp, Compass, History, Home, Loader2, PanelLeftClose, PanelLeftOpen, Route } from 'lucide-react'
import GuestAuthBanner from '../components/GuestAuthBanner'
import { sendChatMessage } from '../services/api'
import useAppStore from '../store/useAppStore'
import { ChatMessage } from '../types'

export default function NavigatorChat() {
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const authUser = useAppStore((state) => state.user)
  const currentSession = useAppStore((state) => state.currentSession)
  const setCurrentSession = useAppStore((state) => state.setCurrentSession)
  const setError = useAppStore((state) => state.setError)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const messagesScrollRef = useRef<HTMLDivElement>(null)

  /** Nested scroll panel: scroll the overflow container, not the window. */
  useLayoutEffect(() => {
    const el = messagesScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [currentSession?.messages.length, isSending])

  /** Let the browser paint user message + thinking row before the network await. */
  function waitForPaint(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve())
      })
    })
  }

  const pathId = Number(params.id)
  const selectedPath = useMemo(
    () => currentSession?.result.paths.find((path) => path.id === pathId),
    [currentSession, pathId]
  )
  const stepStatus = currentSession?.pathStepStatus?.[String(pathId)] || selectedPath?.steps.map(() => false) || []
  const activeStep = Math.min(stepStatus.filter(Boolean).length + 1, selectedPath?.steps.length || 1)

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault()
    if (!authUser) return
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    const nextMessages = [...currentSession.messages, userMessage]
    setIsSending(true)
    setCurrentSession({ ...currentSession, messages: nextMessages, chosenPathId: pathId })
    setInput('')

    await waitForPaint()

    const started = Date.now()
    const minThinkingMs = 320

    try {
      const reply = await sendChatMessage(currentSession.id, trimmed, currentSession.messages, selectedPath.title)
      const assistantMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }
      const elapsed = Date.now() - started
      if (elapsed < minThinkingMs) {
        await new Promise((r) => setTimeout(r, minThinkingMs - elapsed))
      }
      setCurrentSession({
        ...currentSession,
        messages: [...nextMessages, assistantMessage],
        chosenPathId: pathId,
      })
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Chat request failed.'

      const elapsed = Date.now() - started
      if (elapsed < minThinkingMs) {
        await new Promise((r) => setTimeout(r, minThinkingMs - elapsed))
      }
      setError(message || 'Chat request failed.')
      setCurrentSession({ ...currentSession, messages: nextMessages, chosenPathId: pathId })
    } finally {
      setIsSending(false)
    }
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-background text-on-background">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
          <GuestAuthBanner analysesUsed={1} variant="exhausted" />
          <p className="mt-4 text-center text-sm text-outline-variant">
            Please sign in to use follow-up chat and continue your path.
          </p>
          <button
            type="button"
            onClick={() => navigate('/results')}
            className="mt-6 cursor-pointer text-sm font-medium text-primary hover:underline"
          >
            ← Back to your paths
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      <main className="mx-auto flex min-h-screen max-w-7xl gap-4 px-4 pb-6 pt-6 md:gap-6">
        <aside
          className={`sticky top-6 hidden h-[calc(100vh-48px)] overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low md:flex md:flex-col ${
            isNavCollapsed ? 'w-[72px]' : 'w-64'
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
            {!isNavCollapsed ? (
              <button onClick={() => navigate('/')} className="font-display text-lg font-bold tracking-tight text-primary-container">
                whatnextai
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="font-display text-lg font-bold tracking-tight text-primary-container"
                aria-label="Home"
                title="Home"
              >
                w
              </button>
            )}
            <button
              onClick={() => setIsNavCollapsed((prev) => !prev)}
              className="rounded-lg border border-white/15 bg-surface-container-high p-2 text-on-surface-variant hover:text-on-surface"
              aria-label={isNavCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              title={isNavCollapsed ? 'Expand' : 'Collapse'}
            >
              {isNavCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-2 p-3">
            {[
              { id: 'Home', to: '/', icon: Home },
              { id: 'My Paths', to: '/results', icon: Route },
              { id: 'Explore', to: '/explore', icon: Compass },
              { id: 'History', to: '/history', icon: History },
            ].map((item) => {
              const active =
                (item.id === 'Home' && location.pathname === '/') ||
                (item.id === 'History' && location.pathname === '/history') ||
                (item.id === 'Explore' && location.pathname === '/explore') ||
                (item.id === 'My Paths' &&
                  (location.pathname.startsWith('/results') ||
                    location.pathname.startsWith('/path') ||
                    location.pathname.startsWith('/chat')))
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.to)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                    active
                      ? 'border-primary-container/40 bg-primary-container/10 text-primary-container'
                      : 'border-white/10 bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  title={isNavCollapsed ? item.id : undefined}
                  aria-label={item.id}
                >
                  <Icon size={18} />
                  {!isNavCollapsed ? <span className="font-display text-sm font-semibold">{item.id}</span> : null}
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="min-h-0 flex-1">
          <div className="flex h-[calc(100vh-48px)] min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface-container">
            <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => (selectedPath ? navigate(`/path/${selectedPath.id}`) : navigate('/results'))}
                  className="rounded-lg border border-white/15 bg-surface-container-high px-3 py-1 text-xs text-on-surface-variant"
                >
                  Back
                </button>
                <div>
                  <h1 className="font-display text-lg">whatnextai Navigator</h1>
                  <p className="text-[11px] text-text-dim">Online · helping with your path</p>
                </div>
              </div>
            </header>

            {currentSession && selectedPath ? (
              <div className="border-b border-white/10 bg-surface-container-low px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-dim">Active path</p>
                    <p className="mt-1 truncate font-display text-sm text-primary">{selectedPath.title}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                    {selectedPath.difficulty} · {selectedPath.timeEstimate}
                  </span>
                </div>
              </div>
            ) : null}

            <div
              ref={messagesScrollRef}
              className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto scroll-smooth p-4"
            >
              {!currentSession || !selectedPath ? (
                <div className="rounded-2xl border border-white/10 bg-surface-container-high p-6 text-on-surface-variant">
                  <p className="text-sm">No active session for chat.</p>
                  <button
                    onClick={() => navigate('/input')}
                    className="mt-4 rounded-xl bg-primary-container px-5 py-3 text-sm font-semibold text-on-primary"
                  >
                    Start again
                  </button>
                </div>
              ) : (
                <>
                  {currentSession.messages.length === 0 && (
                    <div className="rounded-xl border border-white/10 bg-surface-container-high p-4 text-sm text-on-surface-variant">
                      Ask anything about this path. I will help you with your next action.
                    </div>
                  )}
                  {currentSession.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          message.role === 'user'
                            ? 'bg-primary-container text-on-primary'
                            : 'bg-surface-container-high text-on-surface'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isSending ? (
                    <div className="flex justify-start" aria-live="polite" aria-busy="true">
                      <div className="flex max-w-[82%] items-center gap-3 rounded-2xl border border-white/5 bg-surface-container-high px-4 py-3 text-sm text-on-surface-variant">
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary-container" aria-hidden />
                        <div>
                          <span className="sr-only">Assistant is thinking</span>
                          <p className="text-xs font-medium text-text-dim">Thinking…</p>
                          <p className="mt-0.5 text-[11px] text-on-surface-variant/80">Drafting a reply</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {currentSession && selectedPath ? (
              <div className="mt-auto border-t border-white/10 px-4 pb-4 pt-3">
                <div className="mb-2 flex flex-wrap gap-2">
                  {[
                    'How long should my first output be?',
                    'I have slow internet, what should I do?',
                    'What should I write in the description?',
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setInput(chip)}
                      className="rounded-full border border-white/15 bg-surface-container-high px-3 py-1 text-xs text-on-surface-variant hover:text-primary"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <form onSubmit={submitMessage} className="flex gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    className="flex-1 rounded-full border border-white/10 bg-surface-container-low p-3 text-sm"
                    placeholder="Ask anything about this path..."
                  />
                  <button
                    type="submit"
                    disabled={isSending}
                    aria-label={isSending ? 'Sending message' : 'Send message'}
                    title={isSending ? 'Sending…' : 'Send'}
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-container text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    ) : (
                      <ArrowUp className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                    )}
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}
