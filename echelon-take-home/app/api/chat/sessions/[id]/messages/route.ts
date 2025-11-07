import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateChatResponse, formatMessagesForOpenAI, generateChatTitle } from '@/lib/openai'

// GET /api/chat/sessions/[id]/messages - Get messages for a session
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    // Verify session exists
    const session = await prisma.chatSession.findUnique({
      where: { id },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      )
    }

    if (session.deletedAt) {
      return NextResponse.json(
        { error: 'Chat session has been deleted' },
        { status: 410 }
      )
    }

    // Fetch messages
    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId: id,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    })

    // Transform messages to string dates
    const transformedMessages = messages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt?.toISOString() || '',
    }))

    return NextResponse.json({ messages: transformedMessages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/chat/sessions/[id]/messages - Send message and get AI response
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content } = body

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Verify session exists
    const session = await prisma.chatSession.findUnique({
      where: { id },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      )
    }

    if (session.deletedAt) {
      return NextResponse.json(
        { error: 'Cannot send messages to deleted chat session' },
        { status: 410 }
      )
    }

    // Get conversation history
    const previousMessages = await prisma.chatMessage.findMany({
      where: {
        sessionId: id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Check if this is the first message - if so, generate a title
    const isFirstMessage = previousMessages.length === 0
    let sessionTitle = session.title

    if (isFirstMessage && (!sessionTitle || sessionTitle === 'New Chat')) {
      try {
        sessionTitle = await generateChatTitle(content.trim())
      } catch (error) {
        console.error('Failed to generate title:', error)
        sessionTitle = content.trim().substring(0, 50) // Fallback to first 50 chars
      }
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId: id,
        role: 'user',
        content: content.trim(),
        tokens: 0, // Will be updated with actual token count
      },
    })

    // Prepare messages for OpenAI
    const conversationHistory = [
      ...previousMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content || '',
      })),
      {
        role: 'user' as const,
        content: content.trim(),
      },
    ]

    // Get AI response
    let assistantContent = ''
    let totalTokens = 0

    try {
      const response = await generateChatResponse(conversationHistory)
      assistantContent = response.content
      totalTokens = response.tokens
    } catch (error) {
      console.error('OpenAI API error:', error)
      // Create error message instead
      assistantContent = 'I apologize, but I encountered an error processing your message. Please try again.'
    }

    // Save assistant message
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: id,
        role: 'assistant',
        content: assistantContent,
        tokens: totalTokens,
      },
    })

    // Update session with new token count and title if needed
    const updateData: any = {
      totalTokens: session.totalTokens + totalTokens,
      updatedAt: new Date(),
    }

    if (isFirstMessage && sessionTitle !== session.title) {
      updateData.title = sessionTitle
    }

    await prisma.chatSession.update({
      where: { id },
      data: updateData,
    })

    // Return both messages
    return NextResponse.json({
      userMessage: {
        ...userMessage,
        createdAt: userMessage.createdAt?.toISOString() || '',
      },
      assistantMessage: {
        ...assistantMessage,
        createdAt: assistantMessage.createdAt?.toISOString() || '',
      },
      sessionTitle: isFirstMessage ? sessionTitle : undefined,
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
