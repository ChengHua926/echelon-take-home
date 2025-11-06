import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch organizational hierarchy starting from top-level employees
    const topLevelEmployees = await prisma.employee.findMany({
      where: {
        managerId: null,
        status: 'active',
      },
      include: {
        directReports: {
          include: {
            directReports: {
              include: {
                directReports: {
                  include: {
                    directReports: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(topLevelEmployees)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch org chart' },
      { status: 500 }
    )
  }
}
