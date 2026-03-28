// src/types/index.ts

export interface TokenUsage {
  input_tokens: number
  output_tokens: number
  total_tokens: number
  input_cost: number
  output_cost: number
  total_cost: number
  model: string
}

export type MessageRole = 'user' | 'assistant'
export type RouteType = 'on_topic' | 'off_topic' | ''

export interface Message {
  id: string
  role: MessageRole
  content: string
  route?: RouteType
  usage?: TokenUsage
  timestamp: number
}

export interface DocumentState {
  name: string
  text: string
  summary: string
  charCount: number
  cogneeLoaded: boolean
}

export interface AppState {
  document: DocumentState | null
  messages: Message[]
  sessionId: string
  chatUnlocked: boolean
  /** Live summary text while streaming; null when idle */
  summaryStream: string | null
}

export interface UploadResponse {
  filename: string
  document_text: string
  char_count: number
}

export interface CogneeLoadResponse {
  report: Record<string, string>
}
