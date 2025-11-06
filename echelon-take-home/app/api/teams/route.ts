import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        teamLead: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        members: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                title: true,
              },
            },
          },
        },
        subTeams: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(teams)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}
