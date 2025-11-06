import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all employees who are managers (have direct reports)
    const managers = await prisma.employee.findMany({
      where: {
        status: 'active',
        directReports: {
          some: {},
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        title: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    })

    return NextResponse.json(managers)
  } catch (error) {
    console.error('Error fetching managers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch managers' },
      { status: 500 }
    )
  }
}
