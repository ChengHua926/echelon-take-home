import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog, buildChanges, getIpAddress } from '@/lib/audit-logger'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        manager: true,
        directReports: true,
        teamMembers: {
          include: {
            team: true,
          },
        },
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Fetch current employee data for audit log
    const currentEmployee = await prisma.employee.findUnique({
      where: { id },
    })

    if (!currentEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    const {
      firstName,
      lastName,
      email,
      title,
      department,
      hireDate,
      managerId,
      phone,
      salary,
      status,
    } = body

    // Basic validation
    if (!firstName || !lastName || !email || !title || !department || !hireDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate status if provided
    if (status && !['active', 'inactive', 'terminated'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Check email uniqueness if email changed
    if (email !== currentEmployee.email) {
      const existingEmployee = await prisma.employee.findUnique({
        where: { email },
      })

      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Employee with this email already exists' },
          { status: 409 }
        )
      }
    }

    // Prevent self-reference for manager
    if (managerId === id) {
      return NextResponse.json(
        { error: 'Employee cannot be their own manager' },
        { status: 400 }
      )
    }

    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        title,
        department,
        hireDate: new Date(hireDate),
        managerId: managerId || null,
        phone: phone || null,
        salary: salary ? parseFloat(salary) : null,
        status: status || 'active',
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        directReports: true,
        teamMembers: {
          include: {
            team: true,
          },
        },
      },
    })

    // Build changes object for audit log
    const changes = buildChanges(
      {
        firstName: currentEmployee.firstName,
        lastName: currentEmployee.lastName,
        email: currentEmployee.email,
        title: currentEmployee.title,
        department: currentEmployee.department,
        managerId: currentEmployee.managerId,
        phone: currentEmployee.phone,
        salary: currentEmployee.salary?.toString(),
        status: currentEmployee.status,
        hireDate: currentEmployee.hireDate.toISOString().split('T')[0],
      },
      {
        firstName,
        lastName,
        email,
        title,
        department,
        managerId: managerId || null,
        phone: phone || null,
        salary: salary?.toString() || null,
        status: status || 'active',
        hireDate: new Date(hireDate).toISOString().split('T')[0],
      }
    )

    // Create audit log
    await createAuditLog({
      userId: null, // TODO: Get from session when auth is implemented
      entityType: 'employee',
      entityId: id,
      action: 'update',
      changes,
      ipAddress: getIpAddress(request),
    })

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch employee to verify exists
    const employee = await prisma.employee.findUnique({
      where: { id },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Soft delete: update status to terminated
    await prisma.employee.update({
      where: { id },
      data: {
        status: 'terminated',
      },
    })

    // Create audit log
    await createAuditLog({
      userId: null, // TODO: Get from session when auth is implemented
      entityType: 'employee',
      entityId: id,
      action: 'delete',
      changes: {
        status: {
          old: employee.status,
          new: 'terminated',
        },
      },
      ipAddress: getIpAddress(request),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
