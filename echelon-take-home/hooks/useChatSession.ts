import { useState, useEffect, useCallback } from 'react'
import type { ChatSession, ChatMessage } from '@/types/chat'

export function useChatSession(sessionId: string | null) {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  // Fetch session and messages
  const fetchSession = useCallback(async () => {
    if (!sessionId) {
      setSession(null)
      setMessages([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/chat/sessions/${sessionId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch session: ${response.statusText}`)
      }

      const data = await response.json()
      setSession(data)
      setMessages(data.messages || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch session')
      console.error('Error fetching session:', err)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  // Send message
  const sendMessage = async (content: string): Promise<{ success: boolean; error?: string }> => {
    if (!sessionId) {
      return { success: false, error: 'No session selected' }
    }

    if (!content.trim()) {
      return { success: false, error: 'Message cannot be empty' }
    }

    setSending(true)
    setError(null)

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()

      // Add both user and assistant messages to state
      setMessages(prev => [...prev, data.userMessage, data.assistantMessage])

      // Update session title if it was auto-generated
      if (data.sessionTitle && session) {
        setSession(prev => prev ? { ...prev, title: data.sessionTitle } : null)
      }

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      console.error('Error sending message:', err)
      return { success: false, error: errorMessage }
    } finally {
      setSending(false)
    }
  }

  // Update session (rename)
  const updateSession = async (title: string): Promise<{ success: boolean; error?: string }> => {
    if (!sessionId) {
      return { success: false, error: 'No session selected' }
    }

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update session')
      }

      const data = await response.json()
      setSession(data)

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session'
      console.error('Error updating session:', err)
      return { success: false, error: errorMessage }
    }
  }

  // Delete session
  const deleteSession = async (): Promise<{ success: boolean; error?: string }> => {
    if (!sessionId) {
      return { success: false, error: 'No session selected' }
    }

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete session')
      }

      setSession(null)
      setMessages([])

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session'
      console.error('Error deleting session:', err)
      return { success: false, error: errorMessage }
    }
  }

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  return {
    session,
    messages,
    loading,
    error,
    sending,
    sendMessage,
    updateSession,
    deleteSession,
    refetch: fetchSession,
  }
}
