'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Search as SearchIcon,
  Users,
  UsersRound,
  X,
  Loader2,
  Building2,
  Briefcase,
  Crown,
  ChevronLeft,
  ChevronRight,
  Network,
} from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { useDebounce } from '@/hooks/useDebounce'
import { EmployeeDetailModal } from '@/components/employee-detail-modal'
import { TeamDetailModal } from '@/components/team-detail-modal'

type EntityType = 'all' | 'employees' | 'teams'

export default function SearchPage() {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [entityType, setEntityType] = useState<EntityType>('all')
  const [page, setPage] = useState(1)
  const limit = 20

  // Modal state
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false)
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  // Debounce search
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Fetch search results
  const {
    employees,
    employeesTotal,
    teams,
    teamsTotal,
    pagination,
    loading,
    error,
  } = useSearch({
    query: debouncedSearch,
    type: entityType,
    page,
    limit,
  })

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, entityType])

  // Handle employee click
  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setEmployeeModalOpen(true)
  }

  // Handle team click
  const handleTeamClick = (teamId: string) => {
    setSelectedTeamId(teamId)
    setTeamModalOpen(true)
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
  }

  // Calculate total results
  const totalResults = employeesTotal + teamsTotal
  const hasQuery = searchQuery.trim().length > 0
  const hasResults = employees.length > 0 || teams.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-2xl shadow-lg shadow-purple-500/30">
              <SearchIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Search
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {hasQuery && totalResults > 0
                  ? `Found ${totalResults.toLocaleString()} result${totalResults !== 1 ? 's' : ''}`
                  : 'Search for employees and teams across your organization'}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search employees, teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-12 h-14 text-base border-slate-200 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Entity Type Filter Tabs */}
          {hasQuery && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEntityType('all')}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  entityType === 'all'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                All
                {totalResults > 0 && (
                  <span className={`ml-2 ${entityType === 'all' ? 'text-white/80' : 'text-slate-400'}`}>
                    ({totalResults})
                  </span>
                )}
              </button>
              <button
                onClick={() => setEntityType('employees')}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  entityType === 'employees'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Users className="h-4 w-4" />
                Employees
                {employeesTotal > 0 && (
                  <span className={`${entityType === 'employees' ? 'text-white/80' : 'text-slate-400'}`}>
                    ({employeesTotal})
                  </span>
                )}
              </button>
              <button
                onClick={() => setEntityType('teams')}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  entityType === 'teams'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <UsersRound className="h-4 w-4" />
                Teams
                {teamsTotal > 0 && (
                  <span className={`${entityType === 'teams' ? 'text-white/80' : 'text-slate-400'}`}>
                    ({teamsTotal})
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
            <p className="text-slate-600 font-medium">Searching...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-96 text-red-600">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="font-semibold text-lg mb-2">Error performing search</p>
            <p className="text-sm text-slate-600">{error}</p>
          </div>
        )}

        {/* Empty State - No Query */}
        {!hasQuery && !loading && (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="p-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full mb-6">
              <SearchIcon className="h-16 w-16 text-purple-600" />
            </div>
            <p className="text-xl font-semibold text-slate-700 mb-2">
              Start searching
            </p>
            <p className="text-sm text-slate-500 max-w-md text-center">
              Enter a search query to find employees and teams. Try searching by name, title, department, or team name.
            </p>
          </div>
        )}

        {/* No Results State */}
        {hasQuery && !hasResults && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-96">
            <SearchIcon className="h-20 w-20 text-slate-300 mb-6" />
            <p className="text-xl font-semibold text-slate-700 mb-2">
              No results found
            </p>
            <p className="text-sm text-slate-500 mb-6 max-w-md text-center">
              No employees or teams match "{searchQuery}". Try different keywords or check your spelling.
            </p>
            <Button
              variant="outline"
              onClick={clearSearch}
              className="border-slate-300 hover:bg-slate-50"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Search
            </Button>
          </div>
        )}

        {/* Results */}
        {hasQuery && hasResults && !loading && !error && (
          <div className="space-y-8">
            {/* Employees Section */}
            {employees.length > 0 && (entityType === 'all' || entityType === 'employees') && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Employees
                    <span className="text-slate-400 font-normal ml-2">
                      ({employeesTotal})
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employees.map((employee) => (
                    <button
                      key={employee.id}
                      onClick={() => handleEmployeeClick(employee.id)}
                      className="text-left"
                    >
                      <Card className="p-5 hover:shadow-xl hover:scale-[1.01] transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-300 bg-white">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-base mb-1">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                              <p className="text-sm text-slate-600 truncate">
                                {employee.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-700 border-blue-200 text-xs"
                              >
                                <Building2 className="h-3 w-3 mr-1" />
                                {employee.department}
                              </Badge>
                              <p className="text-xs text-slate-500 truncate">
                                {employee.email}
                              </p>
                            </div>
                            {employee.manager && (
                              <p className="text-xs text-slate-500 mt-2">
                                Reports to: {employee.manager.firstName} {employee.manager.lastName}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Teams Section */}
            {teams.length > 0 && (entityType === 'all' || entityType === 'teams') && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <UsersRound className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Teams
                    <span className="text-slate-400 font-normal ml-2">
                      ({teamsTotal})
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamClick(team.id)}
                      className="text-left"
                    >
                      <Card className="p-5 hover:shadow-xl hover:scale-[1.01] transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-indigo-300 bg-white h-full flex flex-col">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                              {team.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-bold text-slate-900 mb-1 truncate">
                                {team.name}
                              </h3>
                              {team.description && (
                                <p className="text-sm text-slate-600 line-clamp-2">
                                  {team.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {team.parentTeam && (
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 text-slate-700 border-slate-200 text-xs"
                            >
                              <Network className="h-3 w-3 mr-1" />
                              {team.parentTeam.name}
                            </Badge>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-2 mt-3">
                          {team.teamLead && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 flex items-center gap-1">
                                <Crown className="h-3 w-3" />
                                Team Lead
                              </span>
                              <span className="text-slate-900 font-medium truncate ml-2">
                                {team.teamLead.firstName} {team.teamLead.lastName}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Members
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-indigo-100 text-indigo-700 border-indigo-200 font-semibold"
                            >
                              {team.memberCount}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages && pagination.totalPages > 1 && entityType !== 'all' && (
              <div className="mt-8 flex items-center justify-between bg-white px-8 py-6 rounded-2xl shadow-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-slate-300 disabled:opacity-50 hover:bg-slate-50 rounded-lg h-10 px-4"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex gap-2 ml-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        return (
                          p === 1 ||
                          p === pagination.totalPages ||
                          (p >= page - 1 && p <= page + 1)
                        )
                      })
                      .map((p, i, arr) => (
                        <React.Fragment key={p}>
                          {i > 0 && arr[i - 1] !== p - 1 && (
                            <span className="px-2 py-2 text-slate-400 text-sm">...</span>
                          )}
                          <Button
                            variant={p === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(p)}
                            className={
                              p === page
                                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md hover:shadow-lg rounded-lg h-10 w-10'
                                : 'border-slate-300 hover:bg-slate-50 rounded-lg h-10 w-10'
                            }
                          >
                            {p}
                          </Button>
                        </React.Fragment>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages!, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="border-slate-300 disabled:opacity-50 hover:bg-slate-50 rounded-lg h-10 px-4 ml-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <div className="text-sm text-slate-600">
                  Page <span className="font-bold text-slate-900">{page}</span> of{' '}
                  <span className="font-bold text-slate-900">{pagination.totalPages}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <EmployeeDetailModal
        employeeId={selectedEmployeeId}
        open={employeeModalOpen}
        onOpenChange={setEmployeeModalOpen}
        onEmployeeClick={handleEmployeeClick}
      />
      <TeamDetailModal
        teamId={selectedTeamId}
        open={teamModalOpen}
        onOpenChange={setTeamModalOpen}
        onTeamClick={handleTeamClick}
        onEmployeeClick={handleEmployeeClick}
      />
    </div>
  )
}
