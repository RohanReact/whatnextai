/**
 * Thin auth service wrapper — all Supabase auth calls go through here.
 * If we ever migrate away from Supabase, only this file changes.
 */
import { supabase } from '../lib/supabase'
import { getAuthCallbackUrl } from '../utils/appUrl'
import { clearAuthRedirectParams, parseAuthRedirectError } from '../utils/authRedirect'
import { normalizeEmail } from '../utils/email'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id:    string
  email: string
  name:  string | null
}

const toAuthUser = (user: User): AuthUser => ({
  id:    user.id,
  email: user.email || '',
  name:  user.user_metadata?.full_name || user.user_metadata?.name || null,
})

let cachedAccessToken: string | null = null

/** Exchange OAuth/email ?code= param for a persisted session (PKCE flow). */
async function exchangeCodeIfPresent(): Promise<{ session: Session | null; error: Error | null }> {
  if (typeof window === 'undefined') {
    return { session: null, error: null }
  }

  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  if (!code) {
    return { session: null, error: null }
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  // Remove ?code= from the address bar so refresh doesn't retry a spent code.
  url.searchParams.delete('code')
  const cleaned = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, document.title, cleaned || '/')

  if (error) {
    return { session: null, error }
  }

  cachedAccessToken = data.session?.access_token ?? null
  return { session: data.session, error: null }
}

export const authService = {
  /** Sign up with email + password */
  signUp: async (
    email: string,
    password: string,
    name?: string,
    metadata?: { lifeStage?: string; preferredLanguage?: string }
  ) => {
    const cleanEmail = normalizeEmail(email)
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name:          name,
          life_stage:         metadata?.lifeStage,
          preferred_language: metadata?.preferredLanguage,
        },
      },
    })
    cachedAccessToken = data.session?.access_token || null
    return { user: data.user ? toAuthUser(data.user) : null, session: data.session, error }
  },

  /** Sign in with email + password */
  signIn: async (email: string, password: string) => {
    const cleanEmail = normalizeEmail(email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })
    cachedAccessToken = data.session?.access_token || null
    return { user: data.user ? toAuthUser(data.user) : null, session: data.session, error }
  },

  /** Sign in / sign up with Google OAuth */
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthCallbackUrl(),
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    })
    return { data, error }
  },

  /** Sign out */
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    cachedAccessToken = null
    return { error }
  },

  /** Complete OAuth redirect — call on app boot and /auth/callback */
  completeAuthFromRedirect: async (): Promise<{
    session: Session | null
    user: AuthUser | null
    error: Error | null
    redirectError: string | null
  }> => {
    const redirectError = parseAuthRedirectError()
    if (redirectError) {
      clearAuthRedirectParams()
      return { session: null, user: null, error: null, redirectError }
    }

    const exchanged = await exchangeCodeIfPresent()
    if (exchanged.error) {
      return { session: null, user: null, error: exchanged.error, redirectError: null }
    }

    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      return { session: null, user: null, error, redirectError: null }
    }

    cachedAccessToken = session?.access_token ?? null
    return {
      session,
      user: session?.user ? toAuthUser(session.user) : null,
      error: null,
      redirectError: null,
    }
  },

  /** Get the current session (reads from persisted storage) */
  getSession: async (): Promise<{ session: Session | null; user: AuthUser | null }> => {
    const { data: { session } } = await supabase.auth.getSession()
    cachedAccessToken = session?.access_token || null
    return {
      session,
      user: session?.user ? toAuthUser(session.user) : null,
    }
  },

  /** Get the JWT access token for API requests */
  getAccessToken: async (): Promise<string | null> => {
    if (cachedAccessToken) return cachedAccessToken
    const { data: { session } } = await supabase.auth.getSession()
    cachedAccessToken = session?.access_token || null
    return cachedAccessToken
  },

  /** Subscribe to auth state changes */
  onAuthStateChange: (callback: (user: AuthUser | null, session: Session | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      cachedAccessToken = session?.access_token || null
      callback(session?.user ? toAuthUser(session.user) : null, session)
    })
    return subscription
  },
}
