import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        teamLead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            email: true,
          },
        },
        parentTeam: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        subTeams: {
          select: {
            id: true,
            name: true,
            description: true,
            members: {
              select: {
                id: true,
              },
            },
          },
        },
        members: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                title: true,
                email: true,
                department: true,
              },
            },
          },
          orderBy: {
            employee: {
              lastName: 'asc',
            },
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Transform sub-teams to include member count
    const transformedTeam = {
      ...team,
      subTeams: team.subTeams.map(subTeam => ({
        id: subTeam.id,
        name: subTeam.name,
        description: subTeam.description,
        memberCount: subTeam.members.length,
      })),
    }

    return NextResponse.json(transformedTeam)
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}
