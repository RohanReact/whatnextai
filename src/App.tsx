import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import { authService } from './services/auth'
import useAppStore from './store/useAppStore'

export default function App() {
  const { setUser, setAccessToken, setAuthLoading } = useAppStore()

  useEffect(() => {
    // Hydrate auth state from persisted Supabase session on first load
    authService.getSession().then(({ user, session }) => {
      setUser(user)
      setAccessToken(session?.access_token ?? null)
      setAuthLoading(false)
    })

    // Keep Zustand in sync with Supabase auth events (sign in, sign out, token refresh)
    const subscription = authService.onAuthStateChange((user, session) => {
      setUser(user)
      setAccessToken(session?.access_token ?? null)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setAccessToken, setAuthLoading])

  return <RouterProvider router={router} />
}
