import React from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, Sparkles, Plus } from 'lucide-react'

interface EmptyChatStateProps {
  onNewChat: () => void
}

export function EmptyChatState({ onNewChat }: EmptyChatStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md px-6">
        <div className="mb-6 relative">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <div className="absolute top-0 right-1/4 animate-pulse">
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Welcome to AI Chat
        </h2>
        <p className="text-slate-600 mb-6">
          Start a conversation with our AI assistant powered by gpt-5-mini. Ask questions, get help, or just chat!
        </p>

        <Button
          onClick={onNewChat}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Start New Chat
        </Button>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-3">Try asking about:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
              Coding help
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
              General questions
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
              Creative ideas
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
              Problem solving
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
