import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const department = searchParams.get('department')

    const where: any = { status }
    if (department) {
      where.department = department
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        manager: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    })

    return NextResponse.json(employees)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}
