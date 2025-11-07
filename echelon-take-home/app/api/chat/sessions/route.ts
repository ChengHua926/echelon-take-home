import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/chat/sessions - List all chat sessions for current user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Query parameters
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // TODO: Get user ID from session/auth
    // For demo: Get first user from database
    const firstUser = await prisma.user.findFirst()
    if (!firstUser) {
      return NextResponse.json(
        { error: 'No users found in system' },
        { status: 404 }
      )
    }
    const userId = firstUser.id

    // Build where clause
    const where: any = {
      userId,
      deletedAt: null, // Only show non-deleted sessions
    }

    // Search by title
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Fetch sessions with pagination
    const [sessions, totalCount] = await Promise.all([
      prisma.chatSession.findMany({
        where,
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Get last message for preview
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc', // Most recently updated first
        },
        skip,
        take: limit,
      }),
      prisma.chatSession.count({ where }),
    ])

    // Transform sessions to include lastMessage and messageCount
    const transformedSessions = sessions.map(session => ({
      id: session.id,
      userId: session.userId,
      title: session.title,
      deletedAt: session.deletedAt,
      totalTokens: session.totalTokens,
      createdAt: session.createdAt?.toISOString() || '',
      updatedAt: session.updatedAt?.toISOString() || '',
      messageCount: session._count.messages,
      lastMessage: session.messages[0]?.content || null,
      lastMessageAt: session.messages[0]?.createdAt?.toISOString() || null,
    }))

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      sessions: transformedSessions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    })
  } catch (error) {
    console.error('Error fetching chat sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    )
  }
}

// POST /api/chat/sessions - Create new chat session
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title } = body

    // TODO: Get user ID from session/auth
    // For demo: Get first user from database
    const user = await prisma.user.findFirst()

    if (!user) {
      return NextResponse.json(
        { error: 'No users found in system' },
        { status: 404 }
      )
    }

    // Create new chat session
    const session = await prisma.chatSession.create({
      data: {
        userId: user.id,
        title: title || 'New Chat',
        totalTokens: 0,
      },
      include: {
        messages: true,
      },
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error creating chat session:', error)
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    )
  }
}
