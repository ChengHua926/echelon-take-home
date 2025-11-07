import React, { useEffect, useRef } from 'react'
import { Loader2, User, Bot, Wrench, CheckCircle2 } from 'lucide-react'
import type { ChatMessage } from '@/types/chat'
import { format } from 'date-fns'

interface ChatMessageAreaProps {
  messages: ChatMessage[]
  loading: boolean
  sending: boolean
}

interface ToolCallProps {
  toolCall: {
    toolName?: string
    args?: any
    type?: string
  }
}

function ToolCallDisplay({ toolCall }: ToolCallProps) {
  // Handle Agent steps format where toolName might be missing
  if (!toolCall.toolName || toolCall.type !== 'tool-call') {
    return null
  }

  const toolNameDisplay = toolCall.toolName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()

  return (
    <div className="mt-2 p-2 bg-white/50 rounded-lg border border-slate-200">
      <div className="flex items-center gap-2 text-xs">
        <Wrench className="w-3 h-3 text-blue-600" />
        <span className="font-medium text-slate-700">
          Using tool: {toolNameDisplay}
        </span>
        <CheckCircle2 className="w-3 h-3 text-green-600 ml-auto" />
      </div>
      {toolCall.args && Object.keys(toolCall.args).length > 0 && (
        <div className="mt-1 text-xs text-slate-600">
          <span className="font-medium">Parameters:</span>
          {' '}
          {Object.entries(toolCall.args)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join(', ')}
        </div>
      )}
    </div>
  )
}

export function ChatMessageArea({ messages, loading, sending }: ChatMessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (messages.length === 0 && !sending) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">Start the conversation</p>
          <p className="text-slate-400 text-sm mt-1">Type a message below to begin</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {messages.map((message, index) => {
        const isUser = message.role === 'user'
        const isLastMessage = index === messages.length - 1

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!isUser && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                isUser
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              {/* Tool calls display */}
              {!isUser && message.toolCalls && Array.isArray(message.toolCalls) && message.toolCalls.length > 0 && (
                <div className="mb-3">
                  {message.toolCalls.map((toolCall: any, idx: number) => (
                    <ToolCallDisplay key={idx} toolCall={toolCall} />
                  ))}
                </div>
              )}

              {/* Message content */}
              {message.content && (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )}

              {/* Timestamp */}
              <p
                className={`text-xs mt-2 ${
                  isUser ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                {format(new Date(message.createdAt), 'h:mm a')}
              </p>
            </div>

            {isUser && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-600" />
              </div>
            )}
          </div>
        )
      })}

      {/* Typing indicator */}
      {sending && (
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="bg-slate-100 rounded-2xl px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
