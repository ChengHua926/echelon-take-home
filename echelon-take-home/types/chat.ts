// Chat-related TypeScript types and interfaces

export interface ChatSession {
  id: string
  userId: string
  title: string | null
  deletedAt: Date | null
  totalTokens: number
  createdAt: string
  updatedAt: string
  messages?: ChatMessage[]
  messageCount?: number
  lastMessage?: string
  lastMessageAt?: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string | null
  toolCalls: any | null
  toolCallId: string | null
  tokens: number | null
  createdAt: string
}

export interface ChatToolExecution {
  id: string
  messageId: string
  sessionId: string
  toolName: string
  parameters: any
  result: any | null
  executionTimeMs: number | null
  success: boolean | null
  errorMessage: string | null
  executedAt: string
}

export interface ChatSessionsResponse {
  sessions: ChatSession[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

export interface SendMessageRequest {
  content: string
}

export interface SendMessageResponse {
  userMessage: ChatMessage
  assistantMessage: ChatMessage
}

export interface CreateSessionRequest {
  title?: string
}

export interface UpdateSessionRequest {
  title: string
}
