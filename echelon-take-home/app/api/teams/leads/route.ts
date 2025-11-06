import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all employees who are team leads
    const teamLeads = await prisma.employee.findMany({
      where: {
        ledTeams: {
          some: {}
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        title: true,
        ledTeams: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        lastName: 'asc'
      }
    })

    // Transform to include team count
    const transformedLeads = teamLeads.map(lead => ({
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      title: lead.title,
      teamsLedCount: lead.ledTeams.length
    }))

    return NextResponse.json(transformedLeads)
  } catch (error) {
    console.error('Error fetching team leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team leads' },
      { status: 500 }
    )
  }
}
