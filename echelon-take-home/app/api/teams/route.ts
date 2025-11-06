import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Query parameters
    const search = searchParams.get('search') || ''
    const teamLeadId = searchParams.get('teamLeadId') || ''
    const parentTeamId = searchParams.get('parentTeamId') || ''
    const memberCountRange = searchParams.get('memberCountRange') || ''
    const hasSubTeams = searchParams.get('hasSubTeams') || ''
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where: any = {}

    // Search across name and description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Team lead filter
    if (teamLeadId && teamLeadId !== 'all') {
      if (teamLeadId === 'none') {
        where.teamLeadId = null
      } else {
        where.teamLeadId = teamLeadId
      }
    }

    // Parent team filter
    if (parentTeamId && parentTeamId !== 'all') {
      if (parentTeamId === 'none') {
        where.parentTeamId = null  // Root teams only
      } else {
        where.parentTeamId = parentTeamId
      }
    }

    // Has sub-teams filter
    if (hasSubTeams && hasSubTeams !== 'all') {
      if (hasSubTeams === 'true') {
        where.subTeams = { some: {} }
      } else if (hasSubTeams === 'false') {
        where.subTeams = { none: {} }
      }
    }

    // Build orderBy clause
    let orderBy: any
    if (sortBy === 'name') {
      orderBy = { name: sortOrder }
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder }
    } else {
      // For memberCount and subTeamCount, we'll sort in memory after fetching
      orderBy = { name: 'asc' }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Fetch teams with relationships
    const [allTeams, totalCount] = await Promise.all([
      prisma.team.findMany({
        where,
        include: {
          teamLead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          parentTeam: {
            select: {
              id: true,
              name: true,
            },
          },
          members: {
            select: {
              id: true,
            },
          },
          subTeams: {
            select: {
              id: true,
            },
          },
        },
        orderBy,
      }),
      prisma.team.count({ where }),
    ])

    // Transform teams to include counts
    let teamsWithCounts = allTeams.map(team => ({
      ...team,
      memberCount: team.members.length,
      subTeamCount: team.subTeams.length,
    }))

    // Apply member count filter (post-processing)
    if (memberCountRange && memberCountRange !== 'all') {
      if (memberCountRange === '0-5') {
        teamsWithCounts = teamsWithCounts.filter(t => t.memberCount >= 0 && t.memberCount <= 5)
      } else if (memberCountRange === '6-15') {
        teamsWithCounts = teamsWithCounts.filter(t => t.memberCount >= 6 && t.memberCount <= 15)
      } else if (memberCountRange === '16-50') {
        teamsWithCounts = teamsWithCounts.filter(t => t.memberCount >= 16 && t.memberCount <= 50)
      } else if (memberCountRange === '51+') {
        teamsWithCounts = teamsWithCounts.filter(t => t.memberCount >= 51)
      }
    }

    // Sort by memberCount or subTeamCount if needed
    if (sortBy === 'memberCount') {
      teamsWithCounts.sort((a, b) => {
        const diff = a.memberCount - b.memberCount
        return sortOrder === 'asc' ? diff : -diff
      })
    } else if (sortBy === 'subTeamCount') {
      teamsWithCounts.sort((a, b) => {
        const diff = a.subTeamCount - b.subTeamCount
        return sortOrder === 'asc' ? diff : -diff
      })
    }

    // Update total count after member count filter
    const filteredTotalCount = teamsWithCounts.length

    // Apply pagination after filtering
    const paginatedTeams = teamsWithCounts.slice(skip, skip + limit)

    // Calculate pagination metadata
    const totalPages = Math.ceil(filteredTotalCount / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      teams: paginatedTeams,
      pagination: {
        page,
        limit,
        totalCount: filteredTotalCount,
        totalPages,
        hasMore,
      },
    })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}
