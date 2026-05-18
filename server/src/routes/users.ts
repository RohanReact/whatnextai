import { Router } from 'express'
import type { Request, Response } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import { supabase }    from '../services/supabase.js'
import type { SubscriptionTier } from '../types/index.js'

const router = Router()

const PLAN_LIMITS: Record<SubscriptionTier, { analyses: number | null; chat: number | null }> = {
  explorer:  { analyses: 3,    chat: 5    },
  navigator: { analyses: null, chat: null },
  guide:     { analyses: null, chat: null },
}

// GET /users/me — full profile + live usage + stats
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id

  const [
    { data: profile },
    { data: usage },
    { data: recentSessions },
    { count: totalSessions },
    { count: completedSessions },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('user_usage').select('*').eq('user_id', userId).single(),
    supabase
      .from('sessions')
      .select('id, category, situation, summary, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed'),
  ])

  if (!profile || !usage) {
    return res.status(404).json({ success: false, error: 'User profile not found.' })
  }

  const tier   = usage.subscription_tier as SubscriptionTier
  const limits = PLAN_LIMITS[tier]

  const now             = new Date()
  const resetAt         = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
  const analysesUsed    = usage.analyses_this_month ?? 0
  const analysesLimit   = limits.analyses
  const analysesPercent = analysesLimit
    ? Math.min(Math.round((analysesUsed / analysesLimit) * 100), 100)
    : 0

  return res.json({
    success: true,
    data: {
      user: {
        id:                profile.id,
        email:             profile.email,
        displayName:       profile.display_name    ?? null,
        avatarUrl:         profile.avatar_url      ?? null,
        location:          profile.location        ?? null,
        lifeStage:         profile.life_stage      ?? null,
        preferredLanguage: profile.preferred_language ?? 'English',
        createdAt:         profile.created_at,
      },
      plan: {
        tier,
        name: tier === 'explorer' ? 'Explorer — Free'
            : tier === 'navigator' ? 'Navigator'
            : 'Guide',
        desc: tier === 'explorer'
            ? '3 analyses/month · 5 messages per session'
            : 'Unlimited analyses & chat',
      },
      usage: {
        analyses: {
          used:    analysesUsed,
          limit:   analysesLimit,
          percent: analysesPercent,
          resetAt,
          label:   analysesLimit ? `${analysesUsed} / ${analysesLimit} used` : 'Unlimited',
        },
        chat: {
          limit: limits.chat,
          label: limits.chat ? `${limits.chat} messages per session` : 'Unlimited',
        },
      },
      stats: {
        totalSessions:     totalSessions     ?? 0,
        completedSessions: completedSessions ?? 0,
      },
      recentSessions: (recentSessions ?? []).map((s) => ({
        id:        s.id,
        situation: s.situation,
        summary:   s.summary,
        status:    s.status,
        createdAt: s.created_at,
      })),
    },
  })
})

// PATCH /users/me — update editable profile fields
router.patch('/me', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { displayName, location, lifeStage, preferredLanguage } = req.body as {
    displayName?:       string
    location?:          string
    lifeStage?:         string
    preferredLanguage?: string
  }

  const updates: Record<string, string> = {}
  if (displayName       !== undefined) updates.display_name       = displayName.slice(0, 100)
  if (location          !== undefined) updates.location           = location.slice(0, 100)
  if (lifeStage         !== undefined) updates.life_stage         = lifeStage.slice(0, 50)
  if (preferredLanguage !== undefined) updates.preferred_language = preferredLanguage.slice(0, 30)

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: 'No fields to update.' })
  }

  const { error } = await supabase.from('users').update(updates).eq('id', userId)

  if (error) {
    return res.status(500).json({ success: false, error: 'Failed to update profile.' })
  }

  return res.json({ success: true })
})

export default router
