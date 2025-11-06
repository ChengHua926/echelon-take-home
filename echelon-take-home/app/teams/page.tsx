'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  X,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UsersRound,
  Crown,
  Users,
  Network,
} from 'lucide-react'
import { useTeams } from '@/hooks/useTeams'
import { useDebounce } from '@/hooks/useDebounce'
import { TeamDetailModal } from '@/components/team-detail-modal'
import { EmployeeDetailModal } from '@/components/employee-detail-modal'

export default function TeamsPage() {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [teamLeadId, setTeamLeadId] = useState<string>('all')
  const [parentTeamId, setParentTeamId] = useState<string>('all')
  const [memberCountRange, setMemberCountRange] = useState<string>('all')
  const [hasSubTeams, setHasSubTeams] = useState<string>('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Modal state
  const [teamDetailModalOpen, setTeamDetailModalOpen] = useState(false)
  const [employeeDetailModalOpen, setEmployeeDetailModalOpen] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

  // Debounce search
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Fetch data
  const { teams, pagination, loading, error, refetch } = useTeams({
    search: debouncedSearch,
    teamLeadId: teamLeadId !== 'all' ? teamLeadId : undefined,
    parentTeamId: parentTeamId !== 'all' ? parentTeamId : undefined,
    memberCountRange: memberCountRange !== 'all' ? memberCountRange : undefined,
    hasSubTeams: hasSubTeams !== 'all' ? hasSubTeams : undefined,
    sortBy,
    sortOrder,
    page,
    limit,
  })

  // Handle team click
  const handleTeamClick = (teamId: string) => {
    setSelectedTeamId(teamId)
    setTeamDetailModalOpen(true)
  }

  // Handle employee click (from team modal)
  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setTeamDetailModalOpen(false)
    setEmployeeDetailModalOpen(true)
  }

  // Fetch filter options
  const [teamLeads, setTeamLeads] = useState<any[]>([])
  const [parentTeams, setParentTeams] = useState<any[]>([])

  useEffect(() => {
    // Fetch team leads
    fetch('/api/teams/leads')
      .then((res) => res.json())
      .then((data) => setTeamLeads(data))
      .catch((err) => console.error('Error fetching team leads:', err))

    // Fetch parent teams (all teams)
    fetch('/api/teams')
      .then((res) => res.json())
      .then((data) => {
        if (data.teams) {
          setParentTeams(data.teams)
        }
      })
      .catch((err) => console.error('Error fetching parent teams:', err))
  }, [])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setTeamLeadId('all')
    setParentTeamId('all')
    setMemberCountRange('all')
    setHasSubTeams('all')
    setSortBy('name')
    setSortOrder('asc')
    setPage(1)
  }

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, teamLeadId, parentTeamId, memberCountRange, hasSubTeams])

  const hasActiveFilters =
    searchQuery ||
    teamLeadId !== 'all' ||
    parentTeamId !== 'all' ||
    memberCountRange !== 'all' ||
    hasSubTeams !== 'all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                <UsersRound className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">Teams</h1>
                <p className="text-sm text-slate-500 mt-1">
                  {pagination
                    ? `${pagination.totalCount.toLocaleString()} total teams`
                    : 'Loading...'}
                </p>
              </div>
            </div>
            <Button
              size="lg"
              disabled
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all text-white font-semibold px-8 h-12 rounded-xl opacity-50 cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
              Add Team
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by team name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-12 h-14 text-base border-slate-200 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mr-2">
              <Filter className="h-4 w-4 text-slate-500" />
              Filters
            </div>

            {/* Team Lead Filter */}
            <Select value={teamLeadId} onValueChange={setTeamLeadId}>
              <SelectTrigger className="w-[220px] h-11 border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <Crown className="h-4 w-4 text-slate-400 mr-2" />
                <SelectValue placeholder="All Team Leads" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg">
                <SelectItem value="all" className="cursor-pointer hover:bg-indigo-50">
                  All Team Leads
                </SelectItem>
                <SelectItem value="none" className="cursor-pointer hover:bg-indigo-50">
                  No Team Lead
                </SelectItem>
                {teamLeads.map((lead) => (
                  <SelectItem
                    key={lead.id}
                    value={lead.id}
                    className="cursor-pointer hover:bg-indigo-50"
                  >
                    {lead.firstName} {lead.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Parent Team Filter */}
            <Select value={parentTeamId} onValueChange={setParentTeamId}>
              <SelectTrigger className="w-[220px] h-11 border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <Network className="h-4 w-4 text-slate-400 mr-2" />
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg max-h-[300px]">
                <SelectItem value="all" className="cursor-pointer hover:bg-indigo-50">
                  All Teams
                </SelectItem>
                <SelectItem value="none" className="cursor-pointer hover:bg-indigo-50">
                  Root Teams Only
                </SelectItem>
                {parentTeams.map((team) => (
                  <SelectItem
                    key={team.id}
                    value={team.id}
                    className="cursor-pointer hover:bg-indigo-50"
                  >
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Member Count Filter */}
            <Select value={memberCountRange} onValueChange={setMemberCountRange}>
              <SelectTrigger className="w-[220px] h-11 border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <Users className="h-4 w-4 text-slate-400 mr-2" />
                <SelectValue placeholder="All Sizes" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg">
                <SelectItem value="all" className="cursor-pointer hover:bg-indigo-50">
                  All Sizes
                </SelectItem>
                <SelectItem value="0-5" className="cursor-pointer hover:bg-indigo-50">
                  Small (1-5 members)
                </SelectItem>
                <SelectItem value="6-15" className="cursor-pointer hover:bg-indigo-50">
                  Medium (6-15 members)
                </SelectItem>
                <SelectItem value="16-50" className="cursor-pointer hover:bg-indigo-50">
                  Large (16-50 members)
                </SelectItem>
                <SelectItem value="51+" className="cursor-pointer hover:bg-indigo-50">
                  Very Large (51+ members)
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Has Sub-teams Filter */}
            <Select value={hasSubTeams} onValueChange={setHasSubTeams}>
              <SelectTrigger className="w-[200px] h-11 border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <UsersRound className="h-4 w-4 text-slate-400 mr-2" />
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg">
                <SelectItem value="all" className="cursor-pointer hover:bg-indigo-50">
                  All Teams
                </SelectItem>
                <SelectItem value="true" className="cursor-pointer hover:bg-indigo-50">
                  With Sub-teams
                </SelectItem>
                <SelectItem value="false" className="cursor-pointer hover:bg-indigo-50">
                  No Sub-teams
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-300 mx-2"></div>

            {/* Sort Section */}
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ArrowUpDown className="h-4 w-4 text-slate-500" />
              Sort
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-11 border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg">
                  <SelectItem value="name" className="cursor-pointer hover:bg-indigo-50">
                    Team Name
                  </SelectItem>
                  <SelectItem value="memberCount" className="cursor-pointer hover:bg-indigo-50">
                    Member Count
                  </SelectItem>
                  <SelectItem value="subTeamCount" className="cursor-pointer hover:bg-indigo-50">
                    Sub-team Count
                  </SelectItem>
                  <SelectItem value="createdAt" className="cursor-pointer hover:bg-indigo-50">
                    Date Created
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="border-slate-200 h-11 px-4 bg-white hover:bg-slate-50 rounded-lg shadow-sm"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
              </Button>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-11 px-4 rounded-lg"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-2 py-1.5 bg-indigo-50 text-indigo-700 border-indigo-200 rounded-full"
                >
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {teamLeadId !== 'all' && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-2 py-1.5 bg-indigo-50 text-indigo-700 border-indigo-200 rounded-full"
                >
                  Lead:{' '}
                  {teamLeadId === 'none'
                    ? 'No Lead'
                    : teamLeads.find((l) => l.id === teamLeadId)?.firstName +
                      ' ' +
                      teamLeads.find((l) => l.id === teamLeadId)?.lastName || 'Selected'}
                  <button
                    onClick={() => setTeamLeadId('all')}
                    className="ml-2 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {parentTeamId !== 'all' && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-2 py-1.5 bg-indigo-50 text-indigo-700 border-indigo-200 rounded-full"
                >
                  Parent:{' '}
                  {parentTeamId === 'none'
                    ? 'Root Teams'
                    : parentTeams.find((t) => t.id === parentTeamId)?.name || 'Selected'}
                  <button
                    onClick={() => setParentTeamId('all')}
                    className="ml-2 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {memberCountRange !== 'all' && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-2 py-1.5 bg-indigo-50 text-indigo-700 border-indigo-200 rounded-full"
                >
                  Size: {memberCountRange}
                  <button
                    onClick={() => setMemberCountRange('all')}
                    className="ml-2 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {hasSubTeams !== 'all' && (
                <Badge
                  variant="secondary"
                  className="pl-3 pr-2 py-1.5 bg-indigo-50 text-indigo-700 border-indigo-200 rounded-full"
                >
                  {hasSubTeams === 'true' ? 'With Sub-teams' : 'No Sub-teams'}
                  <button
                    onClick={() => setHasSubTeams('all')}
                    className="ml-2 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Results Info */}
        {pagination && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{(page - 1) * limit + 1}</span>{' '}
              to{' '}
              <span className="font-semibold text-slate-900">
                {Math.min(page * limit, pagination.totalCount)}
              </span>{' '}
              of <span className="font-semibold text-slate-900">{pagination.totalCount}</span> teams
            </p>
            {pagination.totalPages > 1 && (
              <p className="text-sm text-slate-600">
                Page <span className="font-semibold text-slate-900">{pagination.page}</span> of{' '}
                <span className="font-semibold text-slate-900">{pagination.totalPages}</span>
              </p>
            )}
          </div>
        )}

        {/* Teams Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-slate-600 font-medium">Loading teams...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-96 text-red-600">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="font-semibold text-lg mb-2">Error loading teams</p>
            <p className="text-sm text-slate-600">{error}</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500">
            <UsersRound className="h-20 w-20 mb-6 text-slate-300" />
            <p className="text-xl font-semibold text-slate-700 mb-2">No teams found</p>
            <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-6 border-slate-300 hover:bg-slate-50"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamClick(team.id)}
                className="text-left"
              >
                <Card className="p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-indigo-300 bg-white h-full flex flex-col">
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                        {team.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
                          {team.name}
                        </h3>
                        {team.description && (
                          <p className="text-sm text-slate-600 line-clamp-2">{team.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Parent Team Badge */}
                    {team.parentTeam && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 border-slate-200 text-xs px-2 py-1 rounded-md"
                        >
                          <Network className="h-3 w-3 mr-1" />
                          {team.parentTeam.name}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-slate-100 space-y-2 mt-4">
                    {team.teamLead && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Crown className="h-3.5 w-3.5" />
                          Team Lead
                        </span>
                        <span className="text-slate-900 font-medium truncate ml-2">
                          {team.teamLead.firstName} {team.teamLead.lastName}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Members
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-indigo-100 text-indigo-700 border-indigo-200 font-semibold"
                      >
                        {team.memberCount}
                      </Badge>
                    </div>
                    {team.subTeamCount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <UsersRound className="h-3.5 w-3.5" />
                          Sub-teams
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-700 border-purple-200 font-semibold"
                        >
                          {team.subTeamCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
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

              {/* Page numbers */}
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
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg rounded-lg h-10 w-10'
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
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
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

      {/* Modals */}
      <TeamDetailModal
        teamId={selectedTeamId}
        open={teamDetailModalOpen}
        onOpenChange={setTeamDetailModalOpen}
        onTeamClick={handleTeamClick}
        onEmployeeClick={handleEmployeeClick}
      />
      <EmployeeDetailModal
        employeeId={selectedEmployeeId}
        open={employeeDetailModalOpen}
        onOpenChange={setEmployeeDetailModalOpen}
        onEmployeeClick={handleEmployeeClick}
      />
    </div>
  )
}
