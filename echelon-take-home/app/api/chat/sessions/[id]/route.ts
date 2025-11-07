import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/chat/sessions/[id] - Get single session with messages
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      )
    }

    // Check if session is deleted
    if (session.deletedAt) {
      return NextResponse.json(
        { error: 'Chat session has been deleted' },
        { status: 410 } // 410 Gone
      )
    }

    // Transform messages to include string dates
    const transformedSession = {
      ...session,
      createdAt: session.createdAt?.toISOString() || '',
      updatedAt: session.updatedAt?.toISOString() || '',
      messages: session.messages.map(msg => ({
        ...msg,
        createdAt: msg.createdAt?.toISOString() || '',
      })),
      messageCount: session._count.messages,
    }

    return NextResponse.json(transformedSession)
  } catch (error) {
    console.error('Error fetching chat session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat session' },
      { status: 500 }
    )
  }
}

// PATCH /api/chat/sessions/[id] - Update session (rename)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title } = body

    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Check if session exists
    const existingSession = await prisma.chatSession.findUnique({
      where: { id },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      )
    }

    if (existingSession.deletedAt) {
      return NextResponse.json(
        { error: 'Cannot update deleted chat session' },
        { status: 410 }
      )
    }

    // Update session
    const updatedSession = await prisma.chatSession.update({
      where: { id },
      data: {
        title: title.trim(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Error updating chat session:', error)
    return NextResponse.json(
      { error: 'Failed to update chat session' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat/sessions/[id] - Soft delete session
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if session exists
    const existingSession = await prisma.chatSession.findUnique({
      where: { id },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      )
    }

    if (existingSession.deletedAt) {
      return NextResponse.json(
        { error: 'Chat session already deleted' },
        { status: 410 }
      )
    }

    // Soft delete by setting deletedAt timestamp
    const deletedSession = await prisma.chatSession.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Chat session deleted successfully',
      session: deletedSession,
    })
  } catch (error) {
    console.error('Error deleting chat session:', error)
    return NextResponse.json(
      { error: 'Failed to delete chat session' },
      { status: 500 }
    )
  }
}
