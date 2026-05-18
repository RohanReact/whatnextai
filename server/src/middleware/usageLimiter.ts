import type { Request, Response, NextFunction } from 'express'
import { supabase } from '../services/supabase.js'

// ---- Plan limits ------------------------------------------------

const PLAN_LIMITS = {
  explorer:  { analyses: 3,        chatMsgsPerSession: 5 },
  navigator: { analyses: Infinity, chatMsgsPerSession: Infinity },
  guide:     { analyses: Infinity, chatMsgsPerSession: Infinity },
} as const

// ---- Analyses quota (monthly) -----------------------------------

/**
 * Runs after requireAuth / optionalAuth.
 * Blocks the request with 429 when an Explorer user has used all 3
 * monthly analyses. Silently passes through if no user is attached
 * (anonymous usage) — auth enforcement is separate.
 */
export async function analyzeUsageLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user
  if (!user) return next() // unauthenticated — let auth middleware handle it

  const limits = PLAN_LIMITS[user.subscription_tier]
  if (limits.analyses === Infinity) return next()

  try {
    const { data: usage } = await supabase
      .from('user_usage')
      .select('analyses_this_month, period_start')
      .eq('user_id', user.id)
      .single()

    const used = usage?.analyses_this_month ?? 0

    if (used >= limits.analyses) {
      const now    = new Date()
      const resetAt = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

      return res.status(429).json({
        success:   false,
        error:     'LIMIT_REACHED',
        limitType: 'analyses',
        used,
        limit:     limits.analyses,
        resetAt,
        message:   `You've used all ${limits.analyses} free analyses this month. Resets on ${new Date(resetAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}.`,
      })
    }
  } catch (err) {
    // If usage check fails, don't block the user — log and continue
    console.error('[usageLimiter] analyses check failed:', err)
  }

  next()
}

// ---- Chat quota (per session) -----------------------------------

/**
 * Blocks with 429 when an Explorer user has sent 5 messages in
 * this specific session. Requires `sessionId` in the request body.
 */
export async function chatUsageLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user
  if (!user) return next()

  const limits = PLAN_LIMITS[user.subscription_tier]
  if (limits.chatMsgsPerSession === Infinity) return next()

  const { sessionId } = req.body as { sessionId?: string }
  if (!sessionId) return next() // no session ID yet — first message

  try {
    const { count } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('role', 'user')

    const used = count ?? 0

    if (used >= limits.chatMsgsPerSession) {
      return res.status(429).json({
        success:   false,
        error:     'LIMIT_REACHED',
        limitType: 'chat',
        used,
        limit:     limits.chatMsgsPerSession,
        message:   `You've reached the ${limits.chatMsgsPerSession} message limit for this session on the free plan.`,
      })
    }
  } catch (err) {
    console.error('[usageLimiter] chat check failed:', err)
  }

  next()
}
