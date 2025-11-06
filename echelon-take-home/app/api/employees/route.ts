import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Query parameters
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'active'
    const department = searchParams.get('department') || ''
    const managerId = searchParams.get('managerId') || ''
    const sortBy = searchParams.get('sortBy') || 'lastName'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where: any = {}

    // Status filter (always filter by status)
    if (status && status !== 'all') {
      where.status = status
    }

    // Department filter - only apply if not "all" or empty
    if (department && department !== 'all') {
      where.department = department
    }

    // Manager filter - only apply if not "all" or empty
    if (managerId && managerId !== 'all') {
      if (managerId === 'none') {
        where.managerId = null
      } else {
        where.managerId = managerId
      }
    }

    // Search across multiple fields
    if (search) {
      const searchTerms = search.trim().split(/\s+/) // Split by whitespace

      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ]

      // Handle full name search (e.g., "alex thompson")
      if (searchTerms.length >= 2) {
        const [firstTerm, ...restTerms] = searchTerms
        const lastTerm = restTerms.join(' ')

        // Add condition for firstName + lastName match
        where.OR.push({
          AND: [
            { firstName: { contains: firstTerm, mode: 'insensitive' } },
            { lastName: { contains: lastTerm, mode: 'insensitive' } },
          ],
        })

        // Also check reverse order (lastName + firstName)
        where.OR.push({
          AND: [
            { firstName: { contains: lastTerm, mode: 'insensitive' } },
            { lastName: { contains: firstTerm, mode: 'insensitive' } },
          ],
        })
      }
    }

    // Build orderBy clause
    const orderByMap: Record<string, any> = {
      firstName: { firstName: sortOrder },
      lastName: { lastName: sortOrder },
      title: { title: sortOrder },
      department: { department: sortOrder },
      hireDate: { hireDate: sortOrder },
      email: { email: sortOrder },
    }
    const orderBy = orderByMap[sortBy] || { lastName: 'asc' }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Fetch employees with pagination
    const [employees, totalCount] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}
