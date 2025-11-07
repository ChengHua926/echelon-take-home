import React from 'react'
import { MessageSquare, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ChatSession } from '@/types/chat'
import { formatDistanceToNow } from 'date-fns'

interface ChatSessionListProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onRefresh: () => void
}

export function ChatSessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onRefresh,
}: ChatSessionListProps) {
  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this chat?')) {
      return
    }

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete session')
      }

      onDeleteSession(sessionId)
      onRefresh()
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 text-sm">No chats yet</p>
        <p className="text-slate-400 text-xs mt-1">Start a new conversation</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-100">
      {sessions.map(session => {
        const isActive = session.id === activeSessionId
        const lastMessageTime = session.lastMessageAt
          ? formatDistanceToNow(new Date(session.lastMessageAt), { addSuffix: true })
          : formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })

        return (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`p-4 cursor-pointer transition-colors group hover:bg-slate-50 ${
              isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium text-sm truncate ${
                    isActive ? 'text-blue-900' : 'text-slate-900'
                  }`}
                >
                  {session.title || 'New Chat'}
                </h3>
                {session.lastMessage && (
                  <p className="text-xs text-slate-500 truncate mt-1">
                    {session.lastMessage}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">{lastMessageTime}</span>
                  {session.messageCount && session.messageCount > 0 && (
                    <>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-400">
                        {session.messageCount} {session.messageCount === 1 ? 'message' : 'messages'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={e => handleDelete(e, session.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
