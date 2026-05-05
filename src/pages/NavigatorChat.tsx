import { FormEvent, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { sendChatMessage } from '../services/api'
import useAppStore from '../store/useAppStore'
import { ChatMessage } from '../types'

export default function NavigatorChat() {
  const params = useParams()
  const navigate = useNavigate()
  const currentSession = useAppStore((state) => state.currentSession)
  const setCurrentSession = useAppStore((state) => state.setCurrentSession)
  const setError = useAppStore((state) => state.setError)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const pathId = Number(params.id)
  const selectedPath = useMemo(
    () => currentSession?.result.paths.find((path) => path.id === pathId),
    [currentSession, pathId]
  )
  const stepStatus = currentSession?.pathStepStatus?.[String(pathId)] || selectedPath?.steps.map(() => false) || []
  const activeStep = Math.min(stepStatus.filter(Boolean).length + 1, selectedPath?.steps.length || 1)

  if (!currentSession || !selectedPath) {
    return (
      <div className="min-h-screen bg-background text-on-background">
        <Navbar />
        <main className="mx-auto min-h-[70vh] max-w-4xl px-6 pb-24 pt-28">
          <p className="text-on-surface-variant">No active session for chat.</p>
        </main>
      </div>
    )
  }

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    const nextMessages = [...currentSession.messages, userMessage]
    setCurrentSession({ ...currentSession, messages: nextMessages, chosenPathId: pathId })
    setInput('')
    setIsSending(true)

    try {
      const reply = await sendChatMessage(currentSession.id, trimmed, currentSession.messages, selectedPath.title)
      const assistantMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
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

      setError(message || 'Chat request failed.')
      setCurrentSession({ ...currentSession, messages: nextMessages, chosenPathId: pathId })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />
      <main className={`${isExpanded ? 'fixed inset-0 z-50 bg-background px-4 pb-4 pt-20' : 'mx-auto max-w-7xl px-4 pb-10 pt-20'}`}>
        <div className={`grid overflow-hidden rounded-2xl border border-white/10 bg-surface-container ${isExpanded ? 'h-[calc(100vh-96px)] md:grid-cols-[320px_1fr]' : 'h-[calc(100vh-180px)] md:grid-cols-[320px_1fr]'}`}>
          <aside className="hidden border-r border-white/10 bg-surface-container-low p-5 md:block">
            <div className="rounded-xl border border-white/10 bg-surface-container p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-dim">Active path</p>
              <h2 className="mt-2 font-display text-lg leading-tight text-primary">{selectedPath.title}</h2>
              <span className="mt-3 inline-block rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                {selectedPath.difficulty} · {selectedPath.timeEstimate}
              </span>
              <div className="mt-5 space-y-3">
                {selectedPath.steps.map((step, index) => {
                  const done = stepStatus[index]
                  const isCurrent = !done && index + 1 === activeStep
                  return (
                    <div key={`${selectedPath.id}-${index}`} className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold ${done ? 'border-green-500/30 bg-green-500/10 text-green-300' : isCurrent ? 'border-primary-container/30 bg-primary-container/10 text-primary' : 'border-white/20 text-text-dim'}`}>
                        {done ? '✓' : index + 1}
                      </span>
                      <p className={`text-xs leading-relaxed ${done ? 'text-green-300' : isCurrent ? 'text-primary' : 'text-on-surface-variant'}`}>{step}</p>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-4 rounded-r-xl border border-white/10 border-l-primary-container bg-surface-container p-4 text-xs leading-relaxed text-on-surface-variant">
              Navigator tip: Ask about your current step for focused next actions and quick decisions.
            </div>
          </aside>

          <section className="flex h-full min-h-0 flex-col">
            <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/path/${selectedPath.id}`)} className="rounded-lg border border-white/15 bg-surface-container-high px-3 py-1 text-xs text-on-surface-variant">
                  Back
                </button>
                <div>
                  <h1 className="font-display text-lg">WhatNext Navigator</h1>
                  <p className="text-[11px] text-text-dim">Online · helping with your path</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="rounded-lg border border-white/15 bg-surface-container-high px-3 py-1 text-xs text-on-surface-variant"
              >
                {isExpanded ? 'Exit Full Screen' : 'Expand'}
              </button>
            </header>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
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
            </div>

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
                  className="rounded-full bg-primary-container px-5 py-3 font-semibold text-on-primary disabled:opacity-60"
                >
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
