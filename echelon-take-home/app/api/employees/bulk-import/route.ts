import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog, getIpAddress } from '@/lib/audit-logger'

interface ImportEmployee {
  firstName: string
  lastName: string
  email: string
  phone?: string
  title: string
  department: string
  managerId?: string | null
  hireDate: string
  salary?: string | number | null
  status?: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { employees } = body as { employees: ImportEmployee[] }

    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json(
        { error: 'No employees provided' },
        { status: 400 }
      )
    }

    // Validate all employees first
    const validationErrors: Array<{ row: number; errors: string[] }> = []
    const validatedEmployees: ImportEmployee[] = []

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i]
      const errors: string[] = []

      // Check required fields
      if (!emp.firstName?.trim()) errors.push('First name is required')
      if (!emp.lastName?.trim()) errors.push('Last name is required')
      if (!emp.email?.trim()) errors.push('Email is required')
      if (!emp.title?.trim()) errors.push('Title is required')
      if (!emp.department?.trim()) errors.push('Department is required')
      if (!emp.hireDate) errors.push('Hire date is required')

      // Validate email format
      if (emp.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emp.email)) {
        errors.push('Invalid email format')
      }

      // Validate status if provided
      if (emp.status && !['active', 'inactive', 'terminated'].includes(emp.status)) {
        errors.push('Invalid status (must be: active, inactive, or terminated)')
      }

      // Validate date format
      if (emp.hireDate && isNaN(Date.parse(emp.hireDate))) {
        errors.push('Invalid hire date format')
      }

      if (errors.length > 0) {
        validationErrors.push({ row: i + 1, errors })
      } else {
        validatedEmployees.push(emp)
      }
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation errors found',
          validationErrors,
          successCount: 0,
          failureCount: validationErrors.length,
        },
        { status: 400 }
      )
    }

    // Check email uniqueness across database and within batch
    const emails = validatedEmployees.map((e) => e.email)
    const emailSet = new Set<string>()
    const duplicateEmails: string[] = []

    for (const email of emails) {
      if (emailSet.has(email)) {
        duplicateEmails.push(email)
      }
      emailSet.add(email)
    }

    if (duplicateEmails.length > 0) {
      return NextResponse.json(
        {
          error: 'Duplicate emails found in import',
          duplicates: [...new Set(duplicateEmails)],
        },
        { status: 400 }
      )
    }

    // Check for existing emails in database
    const existingEmployees = await prisma.employee.findMany({
      where: {
        email: {
          in: emails,
        },
      },
      select: {
        email: true,
      },
    })

    if (existingEmployees.length > 0) {
      return NextResponse.json(
        {
          error: 'Some emails already exist in database',
          existingEmails: existingEmployees.map((e) => e.email),
        },
        { status: 409 }
      )
    }

    // Use transaction to create all employees atomically
    const results = await prisma.$transaction(async (tx) => {
      const createdEmployees = []
      const ipAddress = getIpAddress(request)

      for (const emp of validatedEmployees) {
        // Create employee
        const newEmployee = await tx.employee.create({
          data: {
            firstName: emp.firstName.trim(),
            lastName: emp.lastName.trim(),
            email: emp.email.trim(),
            phone: emp.phone?.trim() || null,
            title: emp.title.trim(),
            department: emp.department.trim(),
            managerId: emp.managerId || null,
            hireDate: new Date(emp.hireDate),
            salary: emp.salary ? parseFloat(emp.salary.toString()) : null,
            status: emp.status || 'active',
          },
        })

        createdEmployees.push(newEmployee)

        // Create audit log
        await createAuditLog({
          userId: null, // TODO: Get from session when auth is implemented
          entityType: 'employee',
          entityId: newEmployee.id,
          action: 'create',
          changes: {
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            title: emp.title,
            department: emp.department,
          },
          ipAddress,
        })
      }

      return createdEmployees
    })

    return NextResponse.json({
      success: true,
      imported: results.length,
      employees: results,
    })
  } catch (error) {
    console.error('Error importing employees:', error)
    return NextResponse.json(
      { error: 'Failed to import employees' },
      { status: 500 }
    )
  }
}
