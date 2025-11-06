import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params
    const body = await request.json()
    const { employeeIds } = body

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json(
        { error: 'Employee IDs are required' },
        { status: 400 }
      )
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    })

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Verify all employees exist
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds },
      },
    })

    if (employees.length !== employeeIds.length) {
      return NextResponse.json(
        { error: 'One or more employees not found' },
        { status: 404 }
      )
    }

    // Add members to team (skipDuplicates handles the unique constraint)
    const result = await prisma.teamMember.createMany({
      data: employeeIds.map((employeeId) => ({
        teamId,
        employeeId,
      })),
      skipDuplicates: true,
    })

    return NextResponse.json({
      success: true,
      addedCount: result.count,
    })
  } catch (error) {
    console.error('Error adding team members:', error)
    return NextResponse.json(
      { error: 'Failed to add team members' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params
    const body = await request.json()
    const { employeeIds } = body

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json(
        { error: 'Employee IDs are required' },
        { status: 400 }
      )
    }

    // Remove members from team
    await prisma.teamMember.deleteMany({
      where: {
        teamId,
        employeeId: { in: employeeIds },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing team members:', error)
    return NextResponse.json(
      { error: 'Failed to remove team members' },
      { status: 500 }
    )
  }
}
