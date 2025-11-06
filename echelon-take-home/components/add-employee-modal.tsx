'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Loader2, UserPlus } from 'lucide-react'

interface AddEmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddEmployeeModal({
  open,
  onOpenChange,
  onSuccess,
}: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<string[]>([])
  const [managers, setManagers] = useState<any[]>([])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    department: '',
    managerId: '',
    hireDate: new Date().toISOString().split('T')[0],
    salary: '',
  })

  // Fetch departments and managers when modal opens
  useEffect(() => {
    if (open) {
      fetch('/api/employees/departments')
        .then((res) => res.json())
        .then((data) => setDepartments(data))
        .catch((err) => console.error('Error fetching departments:', err))

      fetch('/api/employees/managers')
        .then((res) => res.json())
        .then((data) => setManagers(data))
        .catch((err) => console.error('Error fetching managers:', err))
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          managerId: formData.managerId || null,
          salary: formData.salary ? parseFloat(formData.salary) : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create employee')
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: '',
        department: '',
        managerId: '',
        hireDate: new Date().toISOString().split('T')[0],
        salary: '',
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 px-8 pt-8 pb-6 rounded-t-2xl">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl text-white">
                  Add New Employee
                </DialogTitle>
                <p className="text-blue-100 text-sm mt-1">
                  Create a new employee record in the system
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-700">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="John"
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-700">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Doe"
                  required
                  className="border-slate-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john.doe@company.com"
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="border-slate-300"
              />
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Employment Details
            </h3>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Software Engineer"
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-slate-700">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleChange('department', value)}
                required
              >
                <SelectTrigger className="border-slate-300 bg-white">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-slate-200 shadow-2xl max-h-[300px]">
                  {departments.length === 0 && (
                    <SelectItem value="_loading" disabled>
                      Loading departments...
                    </SelectItem>
                  )}
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept} className="hover:bg-blue-50 cursor-pointer">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="managerId" className="text-slate-700">
                Manager
              </Label>
              <Select
                value={formData.managerId}
                onValueChange={(value) => handleChange('managerId', value)}
              >
                <SelectTrigger className="border-slate-300 bg-white">
                  <SelectValue placeholder="Select manager (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-slate-200 shadow-2xl max-h-[300px]">
                  <SelectItem value="none" className="hover:bg-blue-50 cursor-pointer">No Manager (CEO Level)</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id} className="hover:bg-blue-50 cursor-pointer">
                      {manager.firstName} {manager.lastName} - {manager.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hireDate" className="text-slate-700">
                  Hire Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleChange('hireDate', e.target.value)}
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary" className="text-slate-700">
                  Salary (USD)
                </Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleChange('salary', e.target.value)}
                  placeholder="100000"
                  min="0"
                  step="1000"
                  className="border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
        </form>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-4 rounded-b-2xl flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all h-11 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Employee
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-slate-300 hover:bg-slate-50 h-11 px-6"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
