import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search as SearchIcon, Users, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ''

  // Search employees
  const employees = query
    ? await prisma.employee.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { title: { contains: query, mode: 'insensitive' } },
            { department: { contains: query, mode: 'insensitive' } },
          ],
          status: 'active',
        },
        take: 10,
      })
    : []

  // Search teams
  const teams = query
    ? await prisma.team.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          teamLead: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        take: 10,
      })
    : []

  const hasResults = employees.length > 0 || teams.length > 0
  const hasQuery = query.length > 0

  return (
    <div className="h-full p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Search
        </h1>
        <p className="text-gray-500 mt-1">
          Search for employees and teams across your organization
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-2xl mb-8">
        <form action="/search" method="get">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search employees, teams..."
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>
        </form>
      </div>

      {/* Results */}
      {hasQuery && (
        <div className="space-y-8">
          {/* Employees Results */}
          {employees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Employees ({employees.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees.map((employee) => (
                  <Link key={employee.id} href={`/employees/${employee.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {employee.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {employee.department}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {employee.email}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Teams Results */}
          {teams.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <UsersRound className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Teams ({teams.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <Link key={team.id} href={`/teams/${team.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div>
                        <p className="font-semibold text-gray-900">{team.name}</p>
                        {team.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {team.description}
                          </p>
                        )}
                        {team.teamLead && (
                          <p className="text-xs text-gray-500 mt-2">
                            Lead: {team.teamLead.firstName} {team.teamLead.lastName}
                          </p>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!hasResults && (
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No results found for "{query}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasQuery && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Enter a search query to find employees and teams
          </p>
        </div>
      )}
    </div>
  )
}
