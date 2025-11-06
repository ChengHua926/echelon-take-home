import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Query parameters
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, employees, teams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // If no query, return empty results
    if (!query.trim()) {
      return NextResponse.json({
        employees: { items: [], total: 0 },
        teams: { items: [], total: 0 },
        pagination: {
          page,
          limit,
          totalResults: 0,
        },
      })
    }

    const skip = (page - 1) * limit

    // Search employees (if type is 'all' or 'employees')
    let employees = []
    let employeesTotal = 0

    if (type === 'all' || type === 'employees') {
      const searchTerms = query.trim().split(/\s+/)

      const employeeWhere: any = {
        status: 'active',
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { department: { contains: query, mode: 'insensitive' } },
        ],
      }

      // Handle full name search (e.g., "john doe")
      if (searchTerms.length >= 2) {
        const [firstTerm, ...restTerms] = searchTerms
        const lastTerm = restTerms.join(' ')

        employeeWhere.OR.push({
          AND: [
            { firstName: { contains: firstTerm, mode: 'insensitive' } },
            { lastName: { contains: lastTerm, mode: 'insensitive' } },
          ],
        })

        // Also check reverse order
        employeeWhere.OR.push({
          AND: [
            { firstName: { contains: lastTerm, mode: 'insensitive' } },
            { lastName: { contains: firstTerm, mode: 'insensitive' } },
          ],
        })
      }

      const [employeeResults, employeeCount] = await Promise.all([
        prisma.employee.findMany({
          where: employeeWhere,
          include: {
            manager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          take: type === 'all' ? limit : limit,
          skip: type === 'all' ? 0 : skip,
        }),
        prisma.employee.count({ where: employeeWhere }),
      ])

      // Apply relevance scoring
      const queryLower = query.toLowerCase()
      employees = employeeResults.map((emp) => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
        const titleLower = emp.title.toLowerCase()
        const emailLower = emp.email.toLowerCase()

        let score = 0

        // Exact match in name (highest priority)
        if (fullName === queryLower) score += 1000
        else if (fullName.startsWith(queryLower)) score += 500
        else if (fullName.includes(queryLower)) score += 250

        // Match in title
        if (titleLower === queryLower) score += 800
        else if (titleLower.startsWith(queryLower)) score += 400
        else if (titleLower.includes(queryLower)) score += 200

        // Match in email (lower priority)
        if (emailLower === queryLower) score += 600
        else if (emailLower.startsWith(queryLower)) score += 300
        else if (emailLower.includes(queryLower)) score += 150

        // Match in department
        if (emp.department.toLowerCase().includes(queryLower)) score += 100

        return { ...emp, relevanceScore: score }
      })

      // Sort by relevance score (highest first)
      employees.sort((a, b) => b.relevanceScore - a.relevanceScore)

      // If type is 'all', limit employees
      if (type === 'all') {
        employees = employees.slice(0, 10)
      }

      employeesTotal = employeeCount
    }

    // Search teams (if type is 'all' or 'teams')
    let teams = []
    let teamsTotal = 0

    if (type === 'all' || type === 'teams') {
      const teamWhere: any = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      }

      const [teamResults, teamCount] = await Promise.all([
        prisma.team.findMany({
          where: teamWhere,
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
          take: type === 'all' ? limit : limit,
          skip: type === 'all' ? 0 : skip,
        }),
        prisma.team.count({ where: teamWhere }),
      ])

      // Apply relevance scoring
      const queryLower = query.toLowerCase()
      teams = teamResults.map((team) => {
        const nameLower = team.name.toLowerCase()
        const descLower = (team.description || '').toLowerCase()

        let score = 0

        // Exact match in name (highest priority)
        if (nameLower === queryLower) score += 1000
        else if (nameLower.startsWith(queryLower)) score += 500
        else if (nameLower.includes(queryLower)) score += 250

        // Match in description (lower priority)
        if (descLower.includes(queryLower)) score += 100

        return {
          ...team,
          memberCount: team.members.length,
          subTeamCount: team.subTeams.length,
          relevanceScore: score,
        }
      })

      // Sort by relevance score
      teams.sort((a, b) => b.relevanceScore - a.relevanceScore)

      // If type is 'all', limit teams
      if (type === 'all') {
        teams = teams.slice(0, 10)
      }

      teamsTotal = teamCount
    }

    // Calculate total results
    const totalResults = employeesTotal + teamsTotal

    // Calculate pagination for filtered results
    let totalPages = 1
    let hasMore = false

    if (type === 'employees') {
      totalPages = Math.ceil(employeesTotal / limit)
      hasMore = page < totalPages
    } else if (type === 'teams') {
      totalPages = Math.ceil(teamsTotal / limit)
      hasMore = page < totalPages
    }

    return NextResponse.json({
      employees: {
        items: employees,
        total: employeesTotal,
      },
      teams: {
        items: teams,
        total: teamsTotal,
      },
      pagination: {
        page,
        limit,
        totalResults,
        totalPages,
        hasMore,
      },
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}
