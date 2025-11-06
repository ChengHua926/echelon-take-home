import { prisma } from '@/lib/prisma'
import OrgChart from '@/components/org-chart'

// Recursively fetch all employees with their direct reports
async function getEmployeeWithReports(employeeId: string): Promise<any> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      title: true,
      department: true,
      directReports: {
        where: { status: 'active' },
        select: {
          id: true,
        },
      },
    },
  })

  if (!employee) return null

  const children = await Promise.all(
    employee.directReports.map((report) => getEmployeeWithReports(report.id))
  )

  return {
    ...employee,
    children: children.filter(Boolean),
  }
}

export default async function OrgChartPage() {
  // Fetch top-level employees (those without managers)
  const topLevelEmployees = await prisma.employee.findMany({
    where: {
      managerId: null,
      status: 'active',
    },
    select: {
      id: true,
    },
  })

  // Recursively fetch all employees with their hierarchies
  const orgData = await Promise.all(
    topLevelEmployees.map((emp) => getEmployeeWithReports(emp.id))
  )

  const filteredData = orgData.filter(Boolean)

  return (
    <div className="h-full p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Organization Chart
        </h1>
        <p className="text-gray-500 mt-1">
          View your organization's reporting structure. Pan, zoom, and click nodes to explore.
        </p>
      </div>

      {/* Org Chart */}
      <OrgChart data={filteredData} />
    </div>
  )
}
