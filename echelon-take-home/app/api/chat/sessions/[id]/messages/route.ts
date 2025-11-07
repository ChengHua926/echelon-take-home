import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateChatTitle } from '@/lib/openai'
import { Experimental_Agent as Agent, stepCountIs } from 'ai'
import { openai } from '@ai-sdk/openai'
import { hrisTools } from '@/lib/chat-tools'

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

// POST /api/chat/sessions/[id]/messages - Send message and get AI streaming response with tools
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
        // Update title immediately
        await prisma.chatSession.update({
          where: { id },
          data: { title: sessionTitle },
        })
      } catch (error) {
        console.error('Failed to generate title:', error)
      }
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: id,
        role: 'user',
        content: content.trim(),
        tokens: 0,
      },
    })

    // Create HRIS Agent
    const hrisAgent = new Agent({
      model: openai('gpt-5-mini'),
      system: `You are an AI assistant integrated with an HRIS (Human Resource Information System).
You have access to employee data, team information, organizational charts, and company statistics.
Use the available tools to answer questions about employees, teams, departments, and organizational structure.
Always be helpful, accurate, and respectful when discussing employee information.
When asked about specific employees or teams, use the search tools first to find relevant information.`,
      tools: hrisTools,
      stopWhen: stepCountIs(10),
    })

    // Build conversation history for the agent
    const conversationHistory = previousMessages
      .map(msg => {
        if (msg.role === 'user') {
          return `User: ${msg.content}`
        } else if (msg.role === 'assistant') {
          return `Assistant: ${msg.content}`
        }
        return ''
      })
      .filter(Boolean)
      .join('\n\n')

    // Generate response with agent
    const prompt = conversationHistory
      ? `${conversationHistory}\n\nUser: ${content.trim()}`
      : content.trim()

    const result = await hrisAgent.generate({
      prompt,
    })

    // Save assistant message with tool calls (only include tool-call steps)
    const toolCallSteps = result.steps?.filter((step: any) => step.type === 'tool-call') || []

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: id,
        role: 'assistant',
        content: result.text,
        toolCalls: toolCallSteps.length > 0 ? JSON.parse(JSON.stringify(toolCallSteps)) : null,
        tokens: result.usage?.totalTokens || 0,
      },
    })

    // Save tool executions if any
    if (result.steps && result.steps.length > 0) {
      const toolExecutions = result.steps
        .filter((step: any) => step.type === 'tool-call')
        .map((step: any) => ({
          messageId: assistantMessage.id,
          sessionId: id,
          toolName: step.toolName,
          parameters: step.args || {},
          result: step.result || {},
          success: true,
          executionTimeMs: null,
        }))

      if (toolExecutions.length > 0) {
        await prisma.chatToolExecution.createMany({
          data: toolExecutions,
        })
      }
    }

    // Update session with token count
    await prisma.chatSession.update({
      where: { id },
      data: {
        totalTokens: session.totalTokens + (result.usage?.totalTokens || 0),
        updatedAt: new Date(),
      },
    })

    // Return the response
    return NextResponse.json({
      message: assistantMessage,
      text: result.text,
    })
  } catch (error) {
    console.error('Error in chat stream:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
