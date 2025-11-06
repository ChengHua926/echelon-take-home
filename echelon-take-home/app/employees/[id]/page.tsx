import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mail, Phone, Calendar, DollarSign } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      directReports: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          title: true,
        },
      },
      teamMembers: {
        include: {
          team: true,
        },
      },
    },
  })

  if (!employee) {
    notFound()
  }

  return (
    <div className="h-full p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/employees">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-gray-500 mt-1">{employee.title}</p>
          </div>
          <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
            {employee.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{employee.email}</p>
                </div>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{employee.phone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p className="text-sm text-gray-900">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Title</p>
                  <p className="text-sm text-gray-900">{employee.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Hire Date</p>
                  <p className="text-sm text-gray-900">
                    {new Date(employee.hireDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {employee.salary && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Salary</p>
                    <p className="text-sm text-gray-900">
                      ${Number(employee.salary).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Direct Reports */}
          {employee.directReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Direct Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {employee.directReports.map((report) => (
                    <Link
                      key={report.id}
                      href={`/employees/${report.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {report.firstName} {report.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{report.title}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Manager */}
          {employee.manager && (
            <Card>
              <CardHeader>
                <CardTitle>Reports To</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/employees/${employee.manager.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {employee.manager.firstName} {employee.manager.lastName}
                  </p>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Teams */}
          {employee.teamMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {employee.teamMembers.map((membership) => (
                    <Link
                      key={membership.team.id}
                      href={`/teams/${membership.team.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {membership.team.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
