'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Plus, Search, Loader2 } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { useChatSession } from '@/hooks/useChatSession'
import { useDebounce } from '@/hooks/useDebounce'
import { useRole } from '@/contexts/RoleContext'
import { ChatSessionList } from '@/components/chat/chat-session-list'
import { ChatMessageArea } from '@/components/chat/chat-message-area'
import { ChatInput } from '@/components/chat/chat-input'
import { EmptyChatState } from '@/components/chat/empty-chat-state'
import { NewChatModal } from '@/components/chat/new-chat-modal'

export default function ChatPage() {
  const { currentUser } = useRole()

  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [newChatModalOpen, setNewChatModalOpen] = useState(false)

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Fetch chat sessions
  const { sessions, loading: sessionsLoading, refetch: refetchSessions } = useChat({
    search: debouncedSearch,
  })

  // Fetch active session
  const {
    session,
    messages,
    loading: sessionLoading,
    sending,
    sendMessage,
    deleteSession,
    refetch: refetchSession,
  } = useChatSession(activeSessionId)

  // Handle new chat creation
  const handleNewChat = async (title?: string) => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'New Chat',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create chat session')
      }

      const newSession = await response.json()
      setActiveSessionId(newSession.id)
      setNewChatModalOpen(false)
      refetchSessions()
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  // Handle session selection
  const handleSessionSelect = (sessionId: string) => {
    setActiveSessionId(sessionId)
  }

  // Handle delete session
  const handleDeleteSession = async (sessionId: string) => {
    if (sessionId === activeSessionId) {
      setActiveSessionId(null)
    }
    refetchSessions()
  }

  // Handle send message
  const handleSendMessage = async (content: string) => {
    const result = await sendMessage(content)
    if (result.success) {
      refetchSessions() // Update session list with new last message
    }
    return result
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Chat</h1>
            <p className="text-slate-600">
              Chat with AI assistant powered by GPT-4o mini
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Sidebar - Session List */}
        <div className="col-span-3 flex flex-col bg-white rounded-2xl shadow-lg border border-slate-200">
          {/* Search and New Chat */}
          <div className="p-4 border-b border-slate-200 space-y-3">
            <Button
              onClick={() => setNewChatModalOpen(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto">
            {sessionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <ChatSessionList
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSessionSelect}
                onDeleteSession={handleDeleteSession}
                onRefresh={refetchSessions}
              />
            )}
          </div>
        </div>

        {/* Right Panel - Chat Area */}
        <div className="col-span-9 flex flex-col bg-white rounded-2xl shadow-lg border border-slate-200">
          {activeSessionId ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  {session?.title || 'Loading...'}
                </h2>
                {session && (
                  <p className="text-sm text-slate-500">
                    {session.messageCount || 0} messages · {session.totalTokens} tokens
                  </p>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto">
                <ChatMessageArea
                  messages={messages}
                  loading={sessionLoading}
                  sending={sending}
                />
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-200 p-4">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  disabled={sending}
                  placeholder="Type your message..."
                />
              </div>
            </>
          ) : (
            <EmptyChatState onNewChat={() => setNewChatModalOpen(true)} />
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        open={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        onCreate={handleNewChat}
      />
    </div>
  )
}
