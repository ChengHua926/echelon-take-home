import { Card } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

// Component to render an employee node
function EmployeeNode({
  employee,
  level = 0,
}: {
  employee: any
  level?: number
}) {
  const hasReports = employee.directReports && employee.directReports.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Employee Card */}
      <Link href={`/employees/${employee.id}`}>
        <Card className="p-4 hover:shadow-lg transition-all cursor-pointer min-w-[200px] bg-white">
          <div className="text-center">
            <p className="font-semibold text-gray-900 text-sm">
              {employee.firstName} {employee.lastName}
            </p>
            <p className="text-xs text-gray-500 mt-1">{employee.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{employee.department}</p>
          </div>
        </Card>
      </Link>

      {/* Connection line */}
      {hasReports && (
        <div className="w-0.5 h-8 bg-gray-300 my-2" />
      )}

      {/* Direct Reports */}
      {hasReports && (
        <div className="flex gap-8 relative">
          {/* Horizontal connector line */}
          {employee.directReports.length > 1 && (
            <div
              className="absolute top-0 h-0.5 bg-gray-300"
              style={{
                left: '50%',
                right: '50%',
                width: `${(employee.directReports.length - 1) * 200}px`,
                transform: 'translateX(-50%)',
              }}
            />
          )}

          {employee.directReports.map((report: any, index: number) => (
            <div key={report.id} className="flex flex-col items-center">
              {/* Vertical connector to horizontal line */}
              <div className="w-0.5 h-8 bg-gray-300 mb-2" />
              <EmployeeNode employee={report} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default async function OrgChartPage() {
  // Fetch the org chart starting from employees without managers (typically CEO/top level)
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

  return (
    <div className="h-full p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Organization Chart
        </h1>
        <p className="text-gray-500 mt-1">
          View your organization's reporting structure
        </p>
      </div>

      {/* Org Chart */}
      <div className="overflow-x-auto pb-8">
        <div className="inline-flex flex-col gap-8 min-w-full">
          {topLevelEmployees.map((employee) => (
            <EmployeeNode key={employee.id} employee={employee} />
          ))}
        </div>
      </div>

      {topLevelEmployees.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No organizational structure found
        </div>
      )}
    </div>
  )
}
