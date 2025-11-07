import { useState, useEffect, useCallback } from 'react'
import type { ChatSessionsResponse } from '@/types/chat'

export interface UseChatParams {
  userId?: string
  search?: string
  page?: number
  limit?: number
}

export function useChat(params: UseChatParams = {}) {
  const [data, setData] = useState<ChatSessionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const queryParams = new URLSearchParams()

      if (params.userId) queryParams.append('userId', params.userId)
      if (params.search) queryParams.append('search', params.search)
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())

      const response = await fetch(`/api/chat/sessions?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch chat sessions: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chat sessions')
      console.error('Error fetching chat sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [params.userId, params.search, params.page, params.limit])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    sessions: data?.sessions || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchSessions,
  }
}
