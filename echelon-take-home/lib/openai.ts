import OpenAI from 'openai'
import type { ChatMessage } from '@/types/chat'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface GenerateChatResponseResult {
  content: string
  tokens: number
}

/**
 * Generate a chat response using OpenAI Responses API
 * @param messages - Array of messages in the conversation
 * @returns The assistant's response and token count
 */
export async function generateChatResponse(
  messages: OpenAIMessage[]
): Promise<GenerateChatResponseResult> {
  try {
    // Convert messages array to a single input string for the Responses API
    // Format: "User: <message>\nAssistant: <message>\n..."
    const conversationInput = messages
      .map(msg => {
        const role = msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Assistant' : 'System'
        return `${role}: ${msg.content}`
      })
      .join('\n\n')

    const response = await openai.responses.create({
      model: 'gpt-5-mini-2025-08-07',
      input: conversationInput,
    })

    // Extract text content from the structured response
    let content = ''

    if (Array.isArray(response.output)) {
      // Response output is an array of content items
      for (const item of response.output) {
        if (item.type === 'message' && Array.isArray(item.content)) {
          // Extract text from message content
          for (const contentItem of item.content) {
            if (contentItem.type === 'output_text' && contentItem.text) {
              content += contentItem.text
            }
          }
        }
      }
    } else if (typeof response.output === 'string') {
      // Fallback: if output is a string
      content = response.output
    }

    // The responses API doesn't return detailed token usage, estimate it
    const tokens = Math.ceil((conversationInput.length + content.length) / 4) // Rough estimate: 1 token ≈ 4 chars

    return {
      content: content || 'I apologize, but I was unable to generate a response.',
      tokens,
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate chat response')
  }
}

/**
 * Convert database ChatMessage objects to OpenAI API format
 * @param messages - Array of ChatMessage from database
 * @returns Array of messages formatted for OpenAI API
 */
export function formatMessagesForOpenAI(messages: ChatMessage[]): OpenAIMessage[] {
  return messages
    .filter(msg => msg.role !== 'tool') // Exclude tool messages for now
    .map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content || '',
    }))
}

/**
 * Generate a title for a chat session based on the first message
 * @param firstMessage - The user's first message
 * @returns A short title for the chat
 */
export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const input = `Generate a short, descriptive title (5 words or less) for a chat conversation based on this first message. Only respond with the title, no quotes or punctuation.\n\nUser's first message: ${firstMessage}`

    const response = await openai.responses.create({
      model: 'gpt-5-mini-2025-08-07',
      input,
    })

    // Extract text content from the structured response
    let title = ''

    if (Array.isArray(response.output)) {
      // Response output is an array of content items
      for (const item of response.output) {
        if (item.type === 'message' && Array.isArray(item.content)) {
          // Extract text from message content
          for (const contentItem of item.content) {
            if (contentItem.type === 'output_text' && contentItem.text) {
              title += contentItem.text
            }
          }
        }
      }
    } else if (typeof response.output === 'string') {
      // Fallback: if output is a string
      title = response.output
    }

    return title?.trim() || 'New Chat'
  } catch (error) {
    console.error('Failed to generate title:', error)
    return 'New Chat'
  }
}
