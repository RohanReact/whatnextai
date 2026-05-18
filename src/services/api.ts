import axios from 'axios'
import type { AxiosError } from 'axios'
import { authService }   from './auth'
import { AnalysisResult, ChatMessage } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({ baseURL: BASE_URL })

// -- Attach JWT on every request if the user is signed in --
api.interceptors.request.use(async (config) => {
  const token = await authService.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---- Analysis ----

export const analyzeInput = async (
  situation:     string,
  blockage:      string,
  category:      string,
  wantsDownloads: boolean
): Promise<AnalysisResult & { sessionId?: string }> => {
  const response = await api.post('/analyze', { situation, blockage, category, wantsDownloads })
  return { ...response.data.data, sessionId: response.data.sessionId }
}

// ---- Chat ----

export const sendChatMessage = async (
  sessionId:  string,
  message:    string,
  history:    ChatMessage[],
  chosenPath: string,
  pathId?:    string
): Promise<string> => {
  const response = await api.post('/chat', { sessionId, message, history, chosenPath, pathId })
  return response.data.reply
}

// ---- Sessions ----

export const fetchSessions = async () => {
  const response = await api.get('/sessions')
  return response.data.data as Array<{
    id: string; category: string; situation: string
    summary: string; status: string; created_at: string
  }>
}

export const fetchSession = async (id: string) => {
  const response = await api.get(`/sessions/${id}`)
  return response.data.data
}

export const updateSessionStatus = async (id: string, status: 'in-progress' | 'completed' | 'abandoned') => {
  await api.patch(`/sessions/${id}/status`, { status })
}

export const updateStepProgress = async (
  sessionId:  string,
  pathId:     string,
  stepIndex:  number,
  completed:  boolean
) => {
  const response = await api.patch(
    `/sessions/${sessionId}/paths/${pathId}/steps/${stepIndex}`,
    { completed }
  )
  return response.data
}

// ---- User / Profile ----

export const fetchMe = async () => {
  const response = await api.get('/users/me')
  return response.data.data
}

export const updateProfile = async (updates: {
  displayName?:       string
  location?:          string
  lifeStage?:         string
  preferredLanguage?: string
  avatarUrl?:         string | null
}) => {
  await api.patch('/users/me', updates)
}

export const uploadAvatar = async (file: File): Promise<string> => {
  const mimeType = file.type || 'image/jpeg'
  const imageBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read image file.'))
    reader.readAsDataURL(file)
  })

  const response = await api.post('/users/me/avatar', { imageBase64, mimeType })
  return response.data.data.avatarUrl as string
}

export const clearAllHistory = async () => {
  await api.delete('/users/me/sessions')
}

export const deleteAccount = async () => {
  await api.delete('/users/me')
}

// ---- Waitlist ----
// (kept on the default export so PricingPage's existing api.post('/waitlist', ...) still works)

export default api

// ---- Limit error helper ----

export interface LimitReachedPayload {
  limitType: 'analyses' | 'chat'
  used:      number
  limit:     number
  resetAt?:  string
  message:   string
}

export const isLimitReachedError = (err: unknown): LimitReachedPayload | null => {
  const axiosErr = err as AxiosError<{ error?: string } & LimitReachedPayload>
  if (axiosErr?.response?.status === 429 && axiosErr.response.data?.error === 'LIMIT_REACHED') {
    return axiosErr.response.data as LimitReachedPayload
  }
  return null
}
