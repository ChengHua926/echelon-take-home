'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRole } from '@/contexts/RoleContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Edit,
  Trash2,
  Save,
  X,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { AuditLogTimeline } from './audit-log-timeline'

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
  // Role-based access control
  const { hasPermission, canEditEmployee } = useRole()

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [showAuditLogs, setShowAuditLogs] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Edit form state
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    department: '',
    hireDate: '',
    salary: '',
    status: 'active',
    managerId: 'none',
  })

  // Available options
  const [departments, setDepartments] = useState<string[]>([])
  const [managers, setManagers] = useState<any[]>([])

  useEffect(() => {
    if (open && employeeId) {
      fetchEmployee()
      fetchAuditLogs()

      // Fetch filter options
      fetch('/api/employees/departments')
        .then((res) => res.json())
        .then((data) => setDepartments(data))
        .catch((err) => console.error('Error fetching departments:', err))

      fetch('/api/employees/managers')
        .then((res) => res.json())
        .then((data) => setManagers(data))
        .catch((err) => console.error('Error fetching managers:', err))
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

      // Initialize edit data
      setEditData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || '',
        title: data.title,
        department: data.department,
        hireDate: new Date(data.hireDate).toISOString().split('T')[0],
        salary: data.salary?.toString() || '',
        status: data.status,
        managerId: data.manager?.id || 'none',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employee')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async () => {
    if (!employeeId) return

    setLoadingLogs(true)
    try {
      const response = await fetch(`/api/audit-logs?entityType=employee&entityId=${employeeId}`)
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data)
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err)
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleSave = async () => {
    if (!employeeId) return

    setSaving(true)
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editData,
          managerId: editData.managerId === 'none' ? null : editData.managerId,
          salary: editData.salary ? parseFloat(editData.salary) : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update employee')
      }

      const updatedEmployee = await response.json()
      setEmployee(updatedEmployee)
      setIsEditMode(false)
      fetchAuditLogs() // Refresh audit logs
      alert('Employee updated successfully!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update employee')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (employee) {
      // Reset to original data
      setEditData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || '',
        title: employee.title,
        department: employee.department,
        hireDate: new Date(employee.hireDate).toISOString().split('T')[0],
        salary: employee.salary?.toString() || '',
        status: employee.status,
        managerId: employee.manager?.id || 'none',
      })
    }
    setIsEditMode(false)
  }

  const handleDelete = async () => {
    if (!employeeId || !employee) return

    const confirmed = confirm(
      `Are you sure you want to terminate ${employee.firstName} ${employee.lastName}? This will set their status to 'terminated'.`
    )
    if (!confirmed) return

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete employee')
      }

      alert('Employee terminated successfully!')
      onOpenChange(false)
      // Trigger refresh in parent component
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete employee')
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
                      {editData.firstName[0] || 'E'}{editData.lastName[0] || 'E'}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditMode ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={editData.firstName}
                              onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                              placeholder="First Name"
                            />
                            <Input
                              value={editData.lastName}
                              onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                              placeholder="Last Name"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <DialogTitle className="text-2xl text-white mb-1">
                            {employee.firstName} {employee.lastName}
                          </DialogTitle>
                          <p className="text-blue-100 text-base">{employee.title}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {(canEditEmployee(employeeId || '', employee?.department) || hasPermission('employee.delete')) && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {isEditMode ? (
                        <>
                          <Button
                            onClick={handleSave}
                            disabled={saving}
                            size="sm"
                            className="bg-white text-blue-600 hover:bg-white/90 cursor-pointer font-semibold shadow-md hover:shadow-lg transition-all"
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save
                          </Button>
                          <Button
                            onClick={handleCancel}
                            variant="outline"
                            size="sm"
                            className="bg-transparent border-white/30 text-white hover:bg-white/10 cursor-pointer font-semibold transition-all"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          {canEditEmployee(employeeId || '', employee?.department) && (
                            <Button
                              onClick={() => setIsEditMode(true)}
                              size="sm"
                              className="bg-white text-blue-600 hover:bg-white/90 cursor-pointer font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          )}
                          {hasPermission('employee.delete') && (
                            <Button
                              onClick={handleDelete}
                              size="sm"
                              className="cursor-pointer font-semibold shadow-md hover:shadow-lg transition-all bg-red-600 text-white hover:bg-red-700 border-0"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Info Pills */}
                <div className="flex flex-wrap gap-2">
                  {isEditMode ? (
                    <>
                      <Select
                        value={editData.department}
                        onValueChange={(value) => setEditData({ ...editData, department: value })}
                      >
                        <SelectTrigger className="w-[200px] bg-white/20 border-white/30 text-white">
                          <Building2 className="h-3.5 w-3.5 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={editData.status}
                        onValueChange={(value) => setEditData({ ...editData, status: value })}
                      >
                        <SelectTrigger className="w-[150px] bg-white/20 border-white/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <>
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
                      <Badge
                        variant={employee.status === 'active' ? 'default' : 'secondary'}
                        className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-semibold px-3 py-1"
                      >
                        {employee.status}
                      </Badge>
                    </>
                  )}
                </div>
              </DialogHeader>
            </div>

            {/* Content Section */}
            <div className="px-8 py-6 space-y-6">
              {isEditMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Hire Date *</Label>
                      <Input
                        type="date"
                        value={editData.hireDate}
                        onChange={(e) => setEditData({ ...editData, hireDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Salary</Label>
                      <Input
                        type="number"
                        value={editData.salary}
                        onChange={(e) => setEditData({ ...editData, salary: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Manager</Label>
                      <Select
                        value={editData.managerId}
                        onValueChange={(value) => setEditData({ ...editData, managerId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No Manager" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Manager</SelectItem>
                          {managers
                            .filter((m) => m.id !== employeeId)
                            .map((manager) => (
                              <SelectItem key={manager.id} value={manager.id}>
                                {manager.firstName} {manager.lastName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-blue-100 rounded-lg border border-slate-200 hover:border-blue-300 transition-all group cursor-pointer"
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
                            className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all text-left group cursor-pointer"
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
                </>
              )}

              {/* Audit Log Section */}
              <div className="border-t pt-6">
                <button
                  onClick={() => setShowAuditLogs(!showAuditLogs)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-600" />
                    <span className="font-semibold text-slate-900">
                      Change History
                    </span>
                    <Badge variant="secondary" className="ml-2">
                      {auditLogs.length}
                    </Badge>
                  </div>
                  {showAuditLogs ? (
                    <ChevronUp className="h-4 w-4 text-slate-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-600" />
                  )}
                </button>

                {showAuditLogs && (
                  <div className="mt-4">
                    {loadingLogs ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <AuditLogTimeline logs={auditLogs} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
