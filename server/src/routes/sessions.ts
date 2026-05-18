import { Router } from 'express'
import type { Request, Response } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import { supabase }    from '../services/supabase.js'

const router = Router()

// GET /sessions — list all sessions for the authenticated user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, category, situation, summary, status, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[DB] sessions list failed:', error.message)
    return res.status(500).json({ success: false, error: 'Failed to fetch sessions.' })
  }

  return res.json({ success: true, data: sessions })
})

// GET /sessions/:id — full session with paths and step progress
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const userId    = req.user!.id
  const sessionId = req.params.id

  const { data: session, error: sessionErr } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (sessionErr || !session) {
    return res.status(404).json({ success: false, error: 'Session not found.' })
  }

  const { data: paths, error: pathsErr } = await supabase
    .from('paths')
    .select('*')
    .eq('session_id', sessionId)
    .order('path_order', { ascending: true })

  if (pathsErr) {
    console.error('[DB] paths fetch failed:', pathsErr.message)
    return res.status(500).json({ success: false, error: 'Failed to fetch paths.' })
  }

  // Fetch step progress for each path
  const pathIds = (paths || []).map((p) => p.id)
  let stepProgress: Record<string, boolean[]> = {}

  if (pathIds.length > 0) {
    const { data: progress } = await supabase
      .from('path_step_progress')
      .select('path_id, step_index, completed')
      .eq('user_id', userId)
      .in('path_id', pathIds)

    if (progress) {
      for (const row of progress) {
        if (!stepProgress[row.path_id]) stepProgress[row.path_id] = []
        stepProgress[row.path_id][row.step_index] = row.completed
      }
    }
  }

  // Fetch chat messages
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('id, path_id, role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  return res.json({
    success: true,
    data: { ...session, paths: paths || [], stepProgress, messages: messages || [] },
  })
})

// PATCH /sessions/:id/status — mark session as completed or abandoned
router.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
  const userId    = req.user!.id
  const sessionId = req.params.id
  const { status } = req.body as { status: 'in-progress' | 'completed' | 'abandoned' }

  const validStatuses = ['in-progress', 'completed', 'abandoned']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status value.' })
  }

  const { error } = await supabase
    .from('sessions')
    .update({ status })
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (error) {
    return res.status(500).json({ success: false, error: 'Failed to update session status.' })
  }

  return res.json({ success: true })
})

// PATCH /sessions/:id/paths/:pathId/steps/:stepIndex — toggle step completion
router.patch('/:id/paths/:pathId/steps/:stepIndex', requireAuth, async (req: Request, res: Response) => {
  const userId     = req.user!.id
  const pathId    = req.params.pathId    as string
  const stepIndex = req.params.stepIndex as string
  const stepIdx   = parseInt(stepIndex, 10)
  const { completed } = req.body as { completed: boolean }

  if (isNaN(stepIdx)) {
    return res.status(400).json({ success: false, error: 'Invalid step index.' })
  }

  const completedAt = completed ? new Date().toISOString() : null

  const { error } = await supabase
    .from('path_step_progress')
    .upsert(
      { path_id: pathId, user_id: userId, step_index: stepIdx, completed, completed_at: completedAt },
      { onConflict: 'path_id,user_id,step_index' }
    )

  if (error) {
    console.error('[DB] step progress upsert failed:', error.message)
    return res.status(500).json({ success: false, error: 'Failed to save step progress.' })
  }

  return res.json({ success: true, completed, completedAt })
})

export default router
