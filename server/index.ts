import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '.env')
const refreshEnv = () => dotenv.config({ path: envPath, override: true })

refreshEnv()

const app = express()
const port = 3001
const getGeminiApiKey = () => {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
  return key.trim()
}
const getAnthropicApiKey = () => (process.env.ANTHROPIC_API_KEY || '').trim()
const getAnthropicClient = () => {
  const key = getAnthropicApiKey()
  if (!key || key === 'your_key_here') return null
  return new Anthropic({ apiKey: key })
}
const getGeminiClient = () => {
  const key = getGeminiApiKey()
  if (!key || key === 'your_key_here') return null
  return new GoogleGenAI({ apiKey: key })
}

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// const SYSTEM_PROMPT = `You are WhatNext, an AI guidance navigator.
// Your job is to help people who feel stuck by giving them clear,
// actionable paths forward.

// When a user describes their situation and what is blocking them,
// respond ONLY with a valid JSON object in this exact format with
// no extra text, no markdown, no backticks:

// {
//   "summary": "One sentence restating their situation simply",
//   "paths": [
//     {
//       "id": 1,
//       "title": "Short punchy path name",
//       "difficulty": "Easy",
//       "timeEstimate": "~2 weeks",
//       "recommended": false,
//       "description": "2-3 sentences in plain friendly language.",
//       "steps": [
//         "Step 1 specific action",
//         "Step 2 specific action",
//         "Step 3 specific action"
//       ],
//       "whyItWorks": "One sentence on why this works",
//       "commonMistake": "One sentence on the mistake to avoid",
//       "tools": ["Tool 1", "Tool 2"],
//       "hasDownload": true
//     },
//     { "id": 2, "difficulty": "Medium", "recommended": true, ... },
//     { "id": 3, "difficulty": "Advanced", "recommended": false, ... }
//   ]
// }

// Rules:
// - Always return exactly 3 paths
// - Path 1 Easy, Path 2 Medium, Path 3 Advanced
// - Mark exactly one path recommended: true
// - Plain language only, zero corporate jargon
// - Each step must be specific, not generic advice
// - JSON only in your response, nothing else`

const SYSTEM_PROMPT = `You are WhatNext, an AI guidance navigator for people who feel stuck.
Your job is to understand someone's real situation and give them clear, 
specific, locally-relevant paths forward — like advice from a smart 
friend who knows their world, not a generic consultant.

When a user describes their situation and what is blocking them,
respond ONLY with a valid JSON object in this exact format with
no extra text, no markdown, no backticks:

{
  "summary": "One sentence restating their situation in simple words, 
               showing you understood their specific context",
  "paths": [
    {
      "id": 1,
      "title": "Short punchy path name — max 5 words",
      "difficulty": "Easy",
      "timeEstimate": "~2 weeks",
      "recommended": false,
      "description": "2-3 sentences in plain, warm, friendly language. 
                       Write like a helpful friend, not a consultant. 
                       No jargon. Acknowledge their specific situation.",
      "steps": [
        "Step 1 — free action they can do TODAY with what they already have",
        "Step 2 — specific next action with exact tool or platform named",
        "Step 3 — specific action",
        "Step 4 — specific action",
        "Step 5 — specific action"
      ],
      "whyItWorks": "One sentence — specific reason, not generic motivation",
      "commonMistake": "One sentence — the most common real mistake for this path",
      "tools": ["Specific Tool 1", "Specific Tool 2", "Specific Tool 3"],
      "hasDownload": true
    },
    { "id": 2, "difficulty": "Medium", "recommended": true },
    { "id": 3, "difficulty": "Advanced", "recommended": false }
  ]
}

STRICT RULES — follow every single one:

STRUCTURE:
- Always return exactly 3 paths
- Path 1 must be Easy, Path 2 Medium, Path 3 Advanced
- Mark exactly one path as recommended: true
- JSON only — no extra text, no markdown, no backticks

LANGUAGE:
- Plain language only — write like a smart helpful friend
- Zero corporate jargon — never use: leverage, synergy, scalable, 
  pivot, ecosystem, utilize, optimize, streamline
- Keep sentences short — under 20 words each
- If user writes in Hindi or mixes Hindi-English, respond with 
  descriptions and steps in simple Hindi. Keep JSON keys in English.
  Keep tool names and platform names in English.

STEPS — this is the most important part:
- Always give exactly 5 steps per path
- Step 1 MUST be free and doable TODAY with zero money and 
  zero new accounts — using only what the user already has
- Step 2 onwards can introduce free tools and signups
- Each step must name a specific action — never say 
  "research options" or "consider your choices"
- Bad step: "Research and choose a platform"
  Good step: "Go to Instagram right now and create a Business account 
              using your existing personal account — it takes 3 minutes"

TOOLS — recommend locally relevant tools:
- Detect the user's country and context from their description
- For India: prefer WhatsApp Business, Razorpay, UPI, Google Pay, 
  Meesho, Flipkart Seller Hub, IndiaMART, Canva, YouTube, 
  Instagram Shopping, Dunzo, Swiggy Genie, Notion (free)
- For India: avoid recommending Stripe, Etsy, Squarespace, Shopify 
  (paid), Slack, or other Western-first tools unless specifically asked
- For students: prefer free tools only — Canva free, Google Docs, 
  YouTube tutorials, Coursera free audit, LinkedIn free
- For small/local businesses: prefer tools that work on basic 
  Android phones with slow internet

BUDGET AWARENESS:
- If no budget is mentioned, assume the user has very limited money
- Never suggest buying equipment or paid tools in Step 1 or Step 2
- Always offer the free version of any tool first
- Only suggest paid tools in Step 4 or 5, and only if genuinely necessary
- Bad: "Invest in a ring light and lightbox for product photos"
  Good: "Take photos near a window in the morning — natural light 
         is free and works better than most ring lights"

CONTEXT AWARENESS:
- Read the user's description carefully for clues about their location, 
  budget, experience level, and available time
- Adjust all recommendations to match their real world, not an ideal world
- If they mention a city or region, recommend things available there
- If they sound like a beginner, skip advanced tools entirely
- If they sound time-poor, make steps shorter and quicker

OUTPUT QUALITY CHECK — before finalizing, ask yourself:
- Is Step 1 free and doable today? If not, change it.
- Did I name specific tools for their location? If not, fix it.
- Would a person with no money and basic phone be able to follow this? 
  If not, simplify it.
- Does the summary show I understood their specific situation? 
  If it sounds generic, rewrite it.`

const getTextFromAnthropicResponse = (response: Anthropic.Messages.Message) => {
  const first = response.content[0]
  if (first && first.type === 'text') return first.text
  return ''
}

const getProvider = () => {
  const provider = (process.env.AI_PROVIDER || 'auto').toLowerCase()
  if (provider === 'anthropic' || provider === 'gemini' || provider === 'auto') return provider
  return 'auto'
}

const hasValidAnthropicKey = () =>
  !!getAnthropicApiKey() && getAnthropicApiKey() !== 'your_key_here'

const hasValidGeminiKey = () =>
  !!getGeminiApiKey() && getGeminiApiKey() !== 'your_key_here'

const pickRuntimeProvider = (): 'anthropic' | 'gemini' | null => {
  const provider = getProvider()

  if (provider === 'anthropic') return hasValidAnthropicKey() ? 'anthropic' : null
  if (provider === 'gemini') return hasValidGeminiKey() ? 'gemini' : null

  if (hasValidAnthropicKey()) return 'anthropic'
  if (hasValidGeminiKey()) return 'gemini'
  return null
}

const listCandidateProviders = (): Array<'anthropic' | 'gemini'> => {
  const provider = getProvider()
  const validAnthropic = hasValidAnthropicKey()
  const validGemini = hasValidGeminiKey()

  if (provider === 'anthropic') return validAnthropic ? ['anthropic'] : []
  if (provider === 'gemini') return validGemini ? ['gemini'] : []

  const candidates: Array<'anthropic' | 'gemini'> = []
  if (validAnthropic) candidates.push('anthropic')
  if (validGemini) candidates.push('gemini')
  return candidates
}

const parseErrorPayload = (value: string) => {
  try {
    const parsed = JSON.parse(value) as { error?: { message?: string; code?: number; status?: string } }
    return parsed.error
  } catch {
    return null
  }
}

const isFallbackError = (message: string) => {
  const text = message.toLowerCase()
  return (
    text.includes('quota') ||
    text.includes('resource_exhausted') ||
    text.includes('rate limit') ||
    text.includes('not found') ||
    text.includes('unsupported') ||
    text.includes('permission') ||
    text.includes('invalid api key') ||
    text.includes('authentication') ||
    text.includes('401') ||
    text.includes('403') ||
    text.includes('429')
  )
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const value = (err as { message?: unknown }).message
    if (typeof value === 'string' && value) return value
  }
  if (typeof err === 'object' && err !== null && 'error' in err) {
    const nested = (err as { error?: { message?: unknown } }).error?.message
    if (typeof nested === 'string' && nested) return nested
  }
  return fallback
}

const parseMaybeJson = (raw: string) => {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/, '')
    .trim()
  return JSON.parse(cleaned)
}

const toGeminiText = (value: unknown): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(toGeminiText).join('\n').trim()
  if (typeof value === 'object') {
    const maybe = value as { text?: string; parts?: unknown[] }
    if (typeof maybe.text === 'string') return maybe.text
    if (Array.isArray(maybe.parts)) {
      return maybe.parts
        .map((part) => {
          if (part && typeof part === 'object' && 'text' in (part as object)) {
            const text = (part as { text?: string }).text
            return text || ''
          }
          return ''
        })
        .join('\n')
        .trim()
    }
  }
  return ''
}

const getGeminiModels = () => {
  const fromEnv = (process.env.GEMINI_MODEL || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (fromEnv.length > 0) return fromEnv
  return ['gemini-1.5-flash', 'gemini-2.0-flash']
}

const allowMockFallback = () => (process.env.ALLOW_MOCK_FALLBACK || 'false').toLowerCase() === 'true'

const buildMockAnalysis = (payload: { situation: string; blockage: string; category: string }) => ({
  summary: `You are exploring ${payload.category} options and need non-coding alternatives to move forward confidently.`,
  paths: [
    {
      id: 1,
      title: 'Career Discovery Sprint',
      difficulty: 'Easy' as const,
      timeEstimate: '~2 weeks',
      description: 'Explore non-coding CS roles and map where your strengths fit best.',
      steps: [
        'List 5 job roles that use CS thinking but minimal coding (Product, QA, Analyst, UX, Support Engineering).',
        'Watch 2 day-in-the-life videos and write what energizes or drains you.',
        'Pick top 2 roles and connect with 3 people each on LinkedIn for informational chats.',
      ],
      whyItWorks: 'You avoid random guessing and quickly narrow to realistic options.',
      commonMistake: 'Choosing a role only by salary without checking daily work style.',
      tools: ['LinkedIn', 'YouTube', 'Google Sheets'],
      hasDownload: true,
      recommended: true,
    },
    {
      id: 2,
      title: 'Skill Bridge Plan',
      difficulty: 'Medium' as const,
      timeEstimate: '~6 weeks',
      description: 'Build practical portfolio pieces for your chosen non-coding path.',
      steps: [
        'Select one target role and read 15 job descriptions to identify repeated skills.',
        'Create 2 small portfolio projects (for example: product case brief, QA test plan, or analytics dashboard).',
        'Publish your work on LinkedIn/GitHub/Notion and request feedback from mentors.',
      ],
      whyItWorks: 'Employers value role-specific proof of work more than generic certificates.',
      commonMistake: 'Collecting too many courses without producing visible projects.',
      tools: ['Notion', 'Canva', 'Google Docs'],
      hasDownload: true,
    },
    {
      id: 3,
      title: 'Apprenticeship Path',
      difficulty: 'Advanced' as const,
      timeEstimate: '~3 months',
      description: 'Gain real-world experience through internships, volunteer projects, or campus leadership.',
      steps: [
        'Apply to 20 internships/part-time roles aligned to your chosen track.',
        'Offer to help 2 startups or college clubs with clear deliverables.',
        'Turn every project into a one-page case study with outcomes and lessons.',
      ],
      whyItWorks: 'Hands-on experience improves confidence and hiring chances rapidly.',
      commonMistake: 'Waiting for perfect opportunities instead of starting with small real tasks.',
      tools: ['Internshala', 'LinkedIn Jobs', 'Notion'],
      hasDownload: true,
    },
  ],
})

const buildMockChatReply = (message: string, chosenPath: string) =>
  `Great question. For "${chosenPath}", break it into this week, next 30 days, and next 90 days. Start with one small action today related to: ${message.slice(0, 80)}. If you want, I can give you a day-by-day plan.`

app.get('/health', (_req, res) => {
  refreshEnv()
  res.json({
    success: true,
    providerPreference: getProvider(),
    candidates: listCandidateProviders(),
    allowMockFallback: allowMockFallback(),
    hasAnthropicKey: hasValidAnthropicKey(),
    hasGeminiKey: hasValidGeminiKey(),
    geminiModels: getGeminiModels(),
  })
})

const createAnalyzeWithAnthropic = async (payload: {
  situation: string
  blockage: string
  category: string
}) => {
  const anthropicClient = getAnthropicClient()
  if (!anthropicClient) throw new Error('ANTHROPIC_API_KEY is not configured.')

  const response = await anthropicClient.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Category: ${payload.category}
What I am doing: ${payload.situation}
What is blocking me: ${payload.blockage}
Give me my 3 paths forward.`,
    }],
  })

  const raw = getTextFromAnthropicResponse(response)
  return parseMaybeJson(raw)
}

const createAnalyzeWithGemini = async (payload: {
  situation: string
  blockage: string
  category: string
}) => {
  const geminiClient = getGeminiClient()
  if (!geminiClient) throw new Error('GEMINI_API_KEY is not configured.')

  const models = getGeminiModels()
  let lastError: unknown = null

  for (let i = 0; i < models.length; i += 1) {
    const model = models[i]
    try {
      const response = await geminiClient.models.generateContent({
        model,
        contents: `Category: ${payload.category}
What I am doing: ${payload.situation}
What is blocking me: ${payload.blockage}
Give me my 3 paths forward.`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      })

      const raw = toGeminiText(response.text || response.candidates?.[0]?.content)
      return parseMaybeJson(raw)
    } catch (err) {
      lastError = err
      const message = getErrorMessage(err, 'Gemini analyze failed')
      if (!isFallbackError(message) || i === models.length - 1) break
    }
  }

  throw lastError || new Error('Gemini analyze failed')
}

const createChatWithAnthropic = async (payload: {
  message: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  chosenPath: string
}) => {
  const anthropicClient = getAnthropicClient()
  if (!anthropicClient) throw new Error('ANTHROPIC_API_KEY is not configured.')

  const messages: Anthropic.Messages.MessageParam[] = payload.history.map((item) => ({
    role: item.role,
    content: item.content,
  }))

  messages.push({ role: 'user', content: payload.message })

  const response = await anthropicClient.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
    max_tokens: 1000,
    system: `You are WhatNext navigator helping someone follow the path: "${payload.chosenPath}".
Answer follow-up questions helpfully and specifically.
Plain language only.
Keep responses under 150 words.`,
    messages,
  })

  return getTextFromAnthropicResponse(response)
}

const createChatWithGemini = async (payload: {
  message: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  chosenPath: string
}) => {
  const geminiClient = getGeminiClient()
  if (!geminiClient) throw new Error('GEMINI_API_KEY is not configured.')

  const conversation = payload.history
    .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
    .join('\n')
  const models = getGeminiModels()
  let lastError: unknown = null

  for (let i = 0; i < models.length; i += 1) {
    const model = models[i]
    try {
      const response = await geminiClient.models.generateContent({
        model,
        contents: `${conversation}
USER: ${payload.message}`,
        config: {
          systemInstruction: `You are WhatNext navigator helping someone follow the path: "${payload.chosenPath}".
Answer follow-up questions helpfully and specifically.
Plain language only.
Keep responses under 150 words.`,
        },
      })

      return toGeminiText(response.text || response.candidates?.[0]?.content)
    } catch (err) {
      lastError = err
      const message = getErrorMessage(err, 'Gemini chat failed')
      if (!isFallbackError(message) || i === models.length - 1) break
    }
  }

  throw lastError || new Error('Gemini chat failed')
}

app.post('/analyze', async (req, res) => {
  refreshEnv()
  const { situation, blockage, category } = req.body as {
    situation: string
    blockage: string
    category: string
  }

  const provider = pickRuntimeProvider()
  if (!provider) {
    return res.status(500).json({
      success: false,
      error: 'No valid AI key found. Set ANTHROPIC_API_KEY or GEMINI_API_KEY in server/.env and optionally AI_PROVIDER=anthropic|gemini|auto.',
    })
  }

  try {
    const candidates = listCandidateProviders()
    let lastError: unknown = null

    for (let i = 0; i < candidates.length; i += 1) {
      const current = candidates[i]
      try {
        const parsed = current === 'anthropic'
          ? await createAnalyzeWithAnthropic({ situation, blockage, category })
          : await createAnalyzeWithGemini({ situation, blockage, category })
        return res.json({ success: true, provider: current, data: parsed })
      } catch (err) {
        lastError = err
        const message = getErrorMessage(err, 'Analysis failed')
        if (!isFallbackError(message) || i === candidates.length - 1) break
      }
    }

    throw lastError || new Error('Analysis failed')
  } catch (err) {
    console.error('[ANALYZE_ERROR]', err)
    const message = getErrorMessage(err, 'Analysis failed')
    const parsedError = parseErrorPayload(message)
    const cleanMessage = parsedError?.message || message
    if (allowMockFallback()) {
      return res.json({
        success: true,
        provider: 'mock',
        data: buildMockAnalysis({ situation, blockage, category }),
      })
    }
    return res.status(500).json({ success: false, error: cleanMessage })
  }
})

app.post('/chat', async (req, res) => {
  refreshEnv()
  const { message, history, chosenPath } = req.body as {
    message: string
    history: Array<{ role: 'user' | 'assistant'; content: string }>
    chosenPath: string
  }

  const provider = pickRuntimeProvider()
  if (!provider) {
    return res.status(500).json({
      success: false,
      error: 'No valid AI key found. Set ANTHROPIC_API_KEY or GEMINI_API_KEY in server/.env and optionally AI_PROVIDER=anthropic|gemini|auto.',
    })
  }

  try {
    const candidates = listCandidateProviders()
    let lastError: unknown = null

    for (let i = 0; i < candidates.length; i += 1) {
      const current = candidates[i]
      try {
        const reply = current === 'anthropic'
          ? await createChatWithAnthropic({ message, history, chosenPath })
          : await createChatWithGemini({ message, history, chosenPath })
        return res.json({ success: true, provider: current, reply })
      } catch (err) {
        lastError = err
        const text = getErrorMessage(err, 'Chat failed')
        if (!isFallbackError(text) || i === candidates.length - 1) break
      }
    }

    throw lastError || new Error('Chat failed')
  } catch (err) {
    console.error('[CHAT_ERROR]', err)
    const message = getErrorMessage(err, 'Chat failed')
    const parsedError = parseErrorPayload(message)
    const cleanMessage = parsedError?.message || message
    if (allowMockFallback()) {
      return res.json({ success: true, provider: 'mock', reply: buildMockChatReply(message, chosenPath) })
    }
    return res.status(500).json({ success: false, error: cleanMessage })
  }
})

app.listen(port, () => console.log(`WhatNext server running on :${port}`))
