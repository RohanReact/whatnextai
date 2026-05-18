/**
 * Thin auth service wrapper — all Supabase auth calls go through here.
 * If we ever migrate away from Supabase, only this file changes.
 */
import { supabase } from '../lib/supabase'
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

export const authService = {
  /** Sign up with email + password */
  signUp: async (
    email: string,
    password: string,
    name?: string,
    metadata?: { lifeStage?: string; preferredLanguage?: string }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:          name,
          life_stage:         metadata?.lifeStage,
          preferred_language: metadata?.preferredLanguage,
        },
      },
    })
    return { user: data.user ? toAuthUser(data.user) : null, session: data.session, error }
  },

  /** Sign in with email + password */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { user: data.user ? toAuthUser(data.user) : null, session: data.session, error }
  },

  /** Sign in with Google OAuth */
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider:  'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
    return { data, error }
  },

  /** Sign out */
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /** Get the current session (reads from persisted storage) */
  getSession: async (): Promise<{ session: Session | null; user: AuthUser | null }> => {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      session,
      user: session?.user ? toAuthUser(session.user) : null,
    }
  },

  /** Get the JWT access token for API requests */
  getAccessToken: async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  },

  /** Subscribe to auth state changes */
  onAuthStateChange: (callback: (user: AuthUser | null, session: Session | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? toAuthUser(session.user) : null, session)
    })
    return subscription
  },
}
