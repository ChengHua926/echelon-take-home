'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserPlus, Search, X } from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  title: string
  department: string
}

interface AddTeamMemberModalProps {
  teamId: string
  teamName: string
  currentMemberIds: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddTeamMemberModal({
  teamId,
  teamName,
  currentMemberIds,
  open,
  onOpenChange,
  onSuccess,
}: AddTeamMemberModalProps) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) {
      fetchEmployees()
      setSelectedEmployeeIds(new Set())
      setSearchQuery('')
      setError(null)
    }
  }, [open, teamId])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      // Fetch all active employees
      const response = await fetch('/api/employees?status=active&limit=1000')
      if (!response.ok) throw new Error('Failed to fetch employees')

      const data = await response.json()

      // Filter out employees already in the team
      const availableEmployees = data.employees.filter(
        (emp: Employee) => !currentMemberIds.includes(emp.id)
      )

      setEmployees(availableEmployees)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEmployee = (employeeId: string) => {
    const newSelected = new Set(selectedEmployeeIds)
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId)
    } else {
      newSelected.add(employeeId)
    }
    setSelectedEmployeeIds(newSelected)
  }

  const handleSubmit = async () => {
    if (selectedEmployeeIds.size === 0) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeIds: Array.from(selectedEmployeeIds),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add team members')
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team members')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter employees by search query
  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      emp.firstName.toLowerCase().includes(searchLower) ||
      emp.lastName.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower) ||
      emp.title.toLowerCase().includes(searchLower) ||
      emp.department.toLowerCase().includes(searchLower)
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 px-8 pt-8 pb-6 rounded-t-2xl">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl text-white">Add Team Members</DialogTitle>
                <p className="text-indigo-100 text-sm mt-1">
                  Add employees to {teamName}
                </p>
              </div>
            </div>
            {selectedEmployeeIds.size > 0 && (
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-semibold px-3 py-1 w-fit">
                {selectedEmployeeIds.size} selected
              </Badge>
            )}
          </DialogHeader>
        </div>

        {/* Search */}
        <div className="px-8 pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search employees by name, email, title, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-slate-600 font-medium">Loading employees...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-600">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="font-semibold text-lg mb-2">Error</p>
              <p className="text-sm text-slate-600">{error}</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-500">
                {searchQuery
                  ? 'No employees found matching your search'
                  : 'All employees are already members of this team'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => handleToggleEmployee(employee.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-left ${
                    selectedEmployeeIds.has(employee.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedEmployeeIds.has(employee.id)
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {selectedEmployeeIds.has(employee.id) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                    {employee.firstName[0]}{employee.lastName[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-slate-600 truncate">{employee.title}</p>
                    <p className="text-xs text-slate-500 truncate">{employee.department}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-4 rounded-b-2xl flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={submitting || selectedEmployeeIds.size === 0}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all h-11 font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add {selectedEmployeeIds.size > 0 ? `${selectedEmployeeIds.size} ` : ''}
                {selectedEmployeeIds.size === 1 ? 'Member' : 'Members'}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="border-slate-300 hover:bg-slate-50 h-11 px-6"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
