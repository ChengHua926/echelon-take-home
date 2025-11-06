import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function EmployeesPage() {
  // Fetch employees from database
  const employees = await prisma.employee.findMany({
    where: {
      status: 'active'
    },
    include: {
      manager: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: {
      lastName: 'asc'
    }
  })

  return (
    <div className="h-full p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Employees
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your organization's employee directory
            </p>
          </div>
          <Link href="/employees/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search employees..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Employee List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/employees/${employee.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {employee.firstName} {employee.lastName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.manager
                      ? `${employee.manager.firstName} ${employee.manager.lastName}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {employees.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No employees found
        </div>
      )}
    </div>
  )
}
