import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get unique departments from active employees
    const departments = await prisma.employee.findMany({
      where: {
        status: 'active',
      },
      select: {
        department: true,
      },
      distinct: ['department'],
      orderBy: {
        department: 'asc',
      },
    })

    const departmentList = departments.map((d) => d.department)

    return NextResponse.json(departmentList)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}
