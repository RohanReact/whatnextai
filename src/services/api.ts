import axios from 'axios'
import { AnalysisResult, ChatMessage } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({ baseURL: BASE_URL })

export const analyzeInput = async (
  situation: string,
  blockage: string,
  category: string,
  wantsDownloads: boolean
): Promise<AnalysisResult> => {
  const response = await api.post('/analyze', {
    situation,
    blockage,
    category,
    wantsDownloads,
  })
  return response.data.data
}

export const sendChatMessage = async (
  sessionId: string,
  message: string,
  history: ChatMessage[],
  chosenPath: string
): Promise<string> => {
  const response = await api.post('/chat', {
    sessionId,
    message,
    history,
    chosenPath,
  })
  return response.data.reply
}

export default api
