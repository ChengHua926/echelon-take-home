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
  Users,
  Building2,
  UserCheck,
} from 'lucide-react'
import { useEmployees } from '@/hooks/useEmployees'
import { useDebounce } from '@/hooks/useDebounce'
import { AddEmployeeModal } from '@/components/add-employee-modal'
import { EmployeeDetailModal } from '@/components/employee-detail-modal'

export default function EmployeesPage() {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [department, setDepartment] = useState<string>('all')
  const [managerId, setManagerId] = useState<string>('all')
  const [sortBy, setSortBy] = useState('lastName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

  // Debounce search
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Fetch data - only send filters if they're not "all"
  const { employees, pagination, loading, error, refetch } = useEmployees({
    search: debouncedSearch,
    department: department !== 'all' ? department : undefined,
    managerId: managerId !== 'all' ? managerId : undefined,
    sortBy,
    sortOrder,
    page,
    limit,
  })

  // Handle employee click
  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setDetailModalOpen(true)
  }

  // Handle add employee success
  const handleAddSuccess = () => {
    refetch()
  }

  // Fetch filter options
  const [departments, setDepartments] = useState<string[]>([])
  const [managers, setManagers] = useState<any[]>([])

  useEffect(() => {
    // Fetch departments
    fetch('/api/employees/departments')
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error('Error fetching departments:', err))

    // Fetch managers
    fetch('/api/employees/managers')
      .then((res) => res.json())
      .then((data) => setManagers(data))
      .catch((err) => console.error('Error fetching managers:', err))
  }, [])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setDepartment('all')
    setManagerId('all')
    setSortBy('lastName')
    setSortOrder('asc')
    setPage(1)
  }

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, department, managerId])

  const hasActiveFilters = searchQuery || department !== 'all' || managerId !== 'all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                  Employees
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {pagination ? `${pagination.totalCount.toLocaleString()} total employees` : 'Loading...'}
                </p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => setAddModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all text-white font-semibold px-8 h-12 rounded-xl"
            >
              <Plus className="h-5 w-5" />
              Add Employee
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, email, title, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-12 h-14 text-base border-slate-200 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

            {/* Department Filter */}
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-[220px] h-11 border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <Building2 className="h-4 w-4 text-slate-400 mr-2" />
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg">
                <SelectItem value="all" className="cursor-pointer hover:bg-blue-50">
                  All Departments
                </SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept} className="cursor-pointer hover:bg-blue-50">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Manager Filter */}
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger className="w-[220px] h-11 border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <UserCheck className="h-4 w-4 text-slate-400 mr-2" />
                <SelectValue placeholder="All Managers" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg">
                <SelectItem value="all" className="cursor-pointer hover:bg-blue-50">
                  All Managers
                </SelectItem>
                <SelectItem value="none" className="cursor-pointer hover:bg-blue-50">
                  No Manager (CEO Level)
                </SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id} className="cursor-pointer hover:bg-blue-50">
                    {manager.firstName} {manager.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-11 border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg">
                  <SelectItem value="firstName" className="cursor-pointer hover:bg-blue-50">First Name</SelectItem>
                  <SelectItem value="lastName" className="cursor-pointer hover:bg-blue-50">Last Name</SelectItem>
                  <SelectItem value="title" className="cursor-pointer hover:bg-blue-50">Title</SelectItem>
                  <SelectItem value="department" className="cursor-pointer hover:bg-blue-50">Department</SelectItem>
                  <SelectItem value="hireDate" className="cursor-pointer hover:bg-blue-50">Hire Date</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="border-slate-200 h-11 px-4 bg-white hover:bg-slate-50 rounded-lg shadow-sm"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
              </Button>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-11 px-4 rounded-lg"
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
                <Badge variant="secondary" className="pl-3 pr-2 py-1.5 bg-blue-50 text-blue-700 border-blue-200 rounded-full">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {department !== 'all' && (
                <Badge variant="secondary" className="pl-3 pr-2 py-1.5 bg-blue-50 text-blue-700 border-blue-200 rounded-full">
                  {department}
                  <button
                    onClick={() => setDepartment('all')}
                    className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {managerId !== 'all' && (
                <Badge variant="secondary" className="pl-3 pr-2 py-1.5 bg-blue-50 text-blue-700 border-blue-200 rounded-full">
                  Manager: {managerId === 'none' ? 'CEO Level' : managers.find((m) => m.id === managerId)?.firstName + ' ' + managers.find((m) => m.id === managerId)?.lastName || 'Selected'}
                  <button
                    onClick={() => setManagerId('all')}
                    className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
              Showing <span className="font-semibold text-slate-900">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">{Math.min(page * limit, pagination.totalCount)}</span> of{' '}
              <span className="font-semibold text-slate-900">{pagination.totalCount}</span> employees
            </p>
            {pagination.totalPages > 1 && (
              <p className="text-sm text-slate-600">
                Page <span className="font-semibold text-slate-900">{pagination.page}</span> of{' '}
                <span className="font-semibold text-slate-900">{pagination.totalPages}</span>
              </p>
            )}
          </div>
        )}

        {/* Employee Table */}
        <Card className="overflow-hidden shadow-lg border-slate-200 rounded-2xl bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-slate-600 font-medium">Loading employees...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-96 text-red-600">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="font-semibold text-lg mb-2">Error loading employees</p>
              <p className="text-sm text-slate-600">{error}</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
              <Users className="h-20 w-20 mb-6 text-slate-300" />
              <p className="text-xl font-semibold text-slate-700 mb-2">No employees found</p>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Reports To
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {employees.map((employee, index) => (
                    <tr
                      key={employee.id}
                      className={`hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      <td className="px-8 py-5 whitespace-nowrap">
                        <button
                          onClick={() => handleEmployeeClick(employee.id)}
                          className="flex items-center gap-4 w-full text-left"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {employee.firstName} {employee.lastName}
                            </div>
                          </div>
                        </button>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm text-slate-700 font-medium">{employee.title}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 border-blue-200 font-medium px-3 py-1 rounded-full"
                        >
                          {employee.department}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600">
                        {employee.manager ? (
                          <button
                            onClick={() => handleEmployeeClick(employee.manager!.id)}
                            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                          >
                            {employee.manager.firstName} {employee.manager.lastName}
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">CEO Level</span>
                        )}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600">
                        <a href={`mailto:${employee.email}`} className="hover:text-blue-600 transition-colors">
                          {employee.email}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

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
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg rounded-lg h-10 w-10'
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
      <AddEmployeeModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleAddSuccess}
      />
      <EmployeeDetailModal
        employeeId={selectedEmployeeId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onEmployeeClick={handleEmployeeClick}
      />
    </div>
  )
}
