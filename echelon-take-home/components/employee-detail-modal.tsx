'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Loader2,
  Building2,
  Briefcase,
  Users,
  ChevronRight,
} from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  title: string
  department: string
  hireDate: string
  salary: number | null
  status: string
  manager: {
    id: string
    firstName: string
    lastName: string
  } | null
  directReports: Array<{
    id: string
    firstName: string
    lastName: string
    title: string
  }>
  teamMembers: Array<{
    team: {
      id: string
      name: string
    }
  }>
}

interface EmployeeDetailModalProps {
  employeeId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEmployeeClick?: (employeeId: string) => void
}

export function EmployeeDetailModal({
  employeeId,
  open,
  onOpenChange,
  onEmployeeClick,
}: EmployeeDetailModalProps) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && employeeId) {
      fetchEmployee()
    }
  }, [employeeId, open])

  const fetchEmployee = async () => {
    if (!employeeId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/employees/${employeeId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch employee')
      }
      const data = await response.json()
      setEmployee(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employee')
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeClick = (id: string) => {
    if (onEmployeeClick) {
      onEmployeeClick(id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600 font-medium">Loading employee details...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-lg font-semibold text-red-600 mb-2">Error</p>
            <p className="text-sm text-slate-600">{error}</p>
          </div>
        ) : employee ? (
          <>
            {/* Header Section */}
            <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 px-8 pt-8 pb-6 rounded-t-2xl">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-2xl text-white mb-1">
                        {employee.firstName} {employee.lastName}
                      </DialogTitle>
                      <p className="text-blue-100 text-base">{employee.title}</p>
                    </div>
                  </div>
                  <Badge
                    variant={employee.status === 'active' ? 'default' : 'secondary'}
                    className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-semibold px-3 py-1 flex-shrink-0"
                  >
                    {employee.status}
                  </Badge>
                </div>

                {/* Quick Info Pills */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Joined {new Date(employee.hireDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {employee.salary && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>${Number(employee.salary).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </DialogHeader>
            </div>

            {/* Content Section */}
            <div className="px-8 py-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 font-medium">Email</p>
                      <a
                        href={`mailto:${employee.email}`}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium truncate block"
                      >
                        {employee.email}
                      </a>
                    </div>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 font-medium">Phone</p>
                        <a
                          href={`tel:${employee.phone}`}
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                        >
                          {employee.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Manager */}
              {employee.manager && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5" />
                    Reports To
                  </h3>
                  <button
                    onClick={() => handleEmployeeClick(employee.manager!.id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-blue-100 rounded-lg border border-slate-200 hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {employee.manager.firstName[0]}{employee.manager.lastName[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {employee.manager.firstName} {employee.manager.lastName}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </button>
                </div>
              )}

              {/* Direct Reports */}
              {employee.directReports.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Direct Reports ({employee.directReports.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {employee.directReports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => handleEmployeeClick(report.id)}
                        className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all text-left group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                          {report.firstName[0]}{report.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {report.firstName} {report.lastName}
                          </p>
                          <p className="text-xs text-slate-600 truncate">{report.title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams */}
              {employee.teamMembers.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Team Memberships
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {employee.teamMembers.map((membership) => (
                      <div
                        key={membership.team.id}
                        className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <p className="text-sm font-medium text-blue-700">
                          {membership.team.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
