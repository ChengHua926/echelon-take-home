import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    })

    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
