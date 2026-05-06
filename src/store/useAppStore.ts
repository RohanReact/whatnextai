import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState } from '../types'

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentSession: null,
      history: [],
      isLoading: false,
      error: null,
      hasSeenWelcome: false,
      hasCompletedOnboarding: false,
      setCurrentSession: (session) => set({ currentSession: session }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
      setHasCompletedOnboarding: (completed) =>
        set({ hasCompletedOnboarding: completed }),
      addToHistory: (session) =>
        set((state) => ({ history: [session, ...state.history] })),
    }),
    { name: 'whatnext-storage' }
  )
)

export default useAppStore
