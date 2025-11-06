'use client'

import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Edit2,
} from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

interface ImportEmployee {
  firstName: string
  lastName: string
  email: string
  phone?: string
  title: string
  department: string
  managerId?: string | null
  hireDate: string
  salary?: string | number | null
  status?: string
}

interface ValidationError {
  row: number
  field: string
  message: string
}

interface ImportEmployeesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete?: () => void
}

export function ImportEmployeesModal({
  open,
  onOpenChange,
  onImportComplete,
}: ImportEmployeesModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'results'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [employees, setEmployees] = useState<ImportEmployee[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [editingCell, setEditingCell] = useState<{ row: number; field: string } | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    success: boolean
    imported?: number
    errors?: any[]
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const template = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0100',
        title: 'Software Engineer',
        department: 'Engineering',
        managerId: '',
        hireDate: '2024-01-15',
        salary: '85000',
        status: 'active',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0101',
        title: 'Product Manager',
        department: 'Product',
        managerId: '',
        hireDate: '2024-02-01',
        salary: '95000',
        status: 'active',
      },
    ]

    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employee-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const fileName = selectedFile.name.toLowerCase()

    try {
      if (fileName.endsWith('.csv')) {
        Papa.parse(selectedFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            processImportData(results.data as any[])
          },
          error: (error) => {
            console.error('CSV parsing error:', error)
            alert('Failed to parse CSV file')
          },
        })
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const data = await selectedFile.arrayBuffer()
        const workbook = XLSX.read(data)
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet)
        processImportData(jsonData as any[])
      } else {
        alert('Please upload a CSV or Excel file')
      }
    } catch (error) {
      console.error('File processing error:', error)
      alert('Failed to process file')
    }
  }

  const processImportData = (data: any[]) => {
    const processedEmployees: ImportEmployee[] = data.map((row) => ({
      firstName: row.firstName || row.first_name || '',
      lastName: row.lastName || row.last_name || '',
      email: row.email || '',
      phone: row.phone || '',
      title: row.title || '',
      department: row.department || '',
      managerId: row.managerId || row.manager_id || null,
      hireDate: row.hireDate || row.hire_date || '',
      salary: row.salary || null,
      status: row.status || 'active',
    }))

    setEmployees(processedEmployees)
    validateEmployees(processedEmployees)
    setStep('preview')
  }

  const validateEmployees = (emps: ImportEmployee[]) => {
    const errors: ValidationError[] = []

    emps.forEach((emp, index) => {
      const row = index + 1

      if (!emp.firstName?.trim()) {
        errors.push({ row, field: 'firstName', message: 'Required' })
      }
      if (!emp.lastName?.trim()) {
        errors.push({ row, field: 'lastName', message: 'Required' })
      }
      if (!emp.email?.trim()) {
        errors.push({ row, field: 'email', message: 'Required' })
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emp.email)) {
        errors.push({ row, field: 'email', message: 'Invalid format' })
      }
      if (!emp.title?.trim()) {
        errors.push({ row, field: 'title', message: 'Required' })
      }
      if (!emp.department?.trim()) {
        errors.push({ row, field: 'department', message: 'Required' })
      }
      if (!emp.hireDate) {
        errors.push({ row, field: 'hireDate', message: 'Required' })
      } else if (isNaN(Date.parse(emp.hireDate))) {
        errors.push({ row, field: 'hireDate', message: 'Invalid date' })
      }
      if (emp.status && !['active', 'inactive', 'terminated'].includes(emp.status)) {
        errors.push({ row, field: 'status', message: 'Invalid status' })
      }
    })

    // Check for duplicate emails
    const emailCounts = new Map<string, number[]>()
    emps.forEach((emp, index) => {
      if (emp.email) {
        const rows = emailCounts.get(emp.email) || []
        rows.push(index + 1)
        emailCounts.set(emp.email, rows)
      }
    })

    emailCounts.forEach((rows, email) => {
      if (rows.length > 1) {
        rows.forEach((row) => {
          errors.push({ row, field: 'email', message: 'Duplicate email' })
        })
      }
    })

    setValidationErrors(errors)
  }

  const getFieldError = (row: number, field: string) => {
    return validationErrors.find((err) => err.row === row && err.field === field)
  }

  const updateEmployeeField = (index: number, field: keyof ImportEmployee, value: any) => {
    const updatedEmployees = [...employees]
    updatedEmployees[index] = { ...updatedEmployees[index], [field]: value }
    setEmployees(updatedEmployees)
    validateEmployees(updatedEmployees)
  }

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      alert('Please fix all validation errors before importing')
      return
    }

    setImporting(true)
    setStep('importing')

    try {
      const response = await fetch('/api/employees/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees }),
      })

      const data = await response.json()

      if (response.ok) {
        setImportResults({
          success: true,
          imported: data.imported,
        })
      } else {
        setImportResults({
          success: false,
          errors: data.validationErrors || data.existingEmails || [{ message: data.error }],
        })
      }
    } catch (error) {
      console.error('Import error:', error)
      setImportResults({
        success: false,
        errors: [{ message: 'Failed to import employees' }],
      })
    } finally {
      setImporting(false)
      setStep('results')
    }
  }

  const handleClose = () => {
    if (importResults?.success && onImportComplete) {
      onImportComplete()
    }
    // Reset state
    setStep('upload')
    setFile(null)
    setEmployees([])
    setValidationErrors([])
    setEditingCell(null)
    setImportResults(null)
    onOpenChange(false)
  }

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-medium mb-2">Import Employees from CSV or Excel</h3>
        <p className="text-sm text-slate-600 mb-6">
          Upload a file with employee data or download our template to get started
        </p>

        <div className="space-y-4">
          <Button variant="outline" onClick={downloadTemplate} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>

          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Required Fields</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• First Name, Last Name</li>
          <li>• Email (must be unique)</li>
          <li>• Title, Department</li>
          <li>• Hire Date (YYYY-MM-DD format)</li>
        </ul>
        <h4 className="text-sm font-medium text-blue-900 mt-3 mb-2">Optional Fields</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Phone, Manager ID</li>
          <li>• Salary, Status (active/inactive/terminated)</li>
        </ul>
      </div>
    </div>
  )

  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Preview Import Data</h3>
          <p className="text-sm text-slate-600">
            {employees.length} employees • {validationErrors.length} errors
          </p>
        </div>
        {validationErrors.length > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Fix Errors
          </Badge>
        )}
      </div>

      <div className="border rounded-lg max-h-[400px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium">#</th>
              <th className="px-3 py-2 text-left font-medium">First Name</th>
              <th className="px-3 py-2 text-left font-medium">Last Name</th>
              <th className="px-3 py-2 text-left font-medium">Email</th>
              <th className="px-3 py-2 text-left font-medium">Title</th>
              <th className="px-3 py-2 text-left font-medium">Department</th>
              <th className="px-3 py-2 text-left font-medium">Hire Date</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, index) => {
              const row = index + 1
              return (
                <tr key={index} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-500">{row}</td>
                  {(['firstName', 'lastName', 'email', 'title', 'department', 'hireDate'] as const).map(
                    (field) => {
                      const error = getFieldError(row, field)
                      const isEditing =
                        editingCell?.row === row && editingCell?.field === field

                      return (
                        <td
                          key={field}
                          className={`px-3 py-2 ${error ? 'bg-red-50' : ''}`}
                          onDoubleClick={() => setEditingCell({ row, field })}
                        >
                          {isEditing ? (
                            <Input
                              value={emp[field] as string}
                              onChange={(e) =>
                                updateEmployeeField(index, field, e.target.value)
                              }
                              onBlur={() => setEditingCell(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditingCell(null)
                              }}
                              autoFocus
                              className="h-7 text-sm"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={error ? 'text-red-600' : ''}>
                                {emp[field] || '-'}
                              </span>
                              {error && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs px-1 py-0"
                                  title={error.message}
                                >
                                  {error.message}
                                </Badge>
                              )}
                            </div>
                          )}
                        </td>
                      )
                    }
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-500">
        <Edit2 className="h-3 w-3 inline mr-1" />
        Double-click any cell to edit
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('upload')}>
          Back
        </Button>
        <Button
          onClick={handleImport}
          disabled={validationErrors.length > 0}
          className="bg-green-600 hover:bg-green-700"
        >
          Import {employees.length} Employees
        </Button>
      </div>
    </div>
  )

  const renderImportingStep = () => (
    <div className="text-center py-12">
      <Loader2 className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-spin" />
      <h3 className="text-lg font-medium mb-2">Importing Employees</h3>
      <p className="text-sm text-slate-600">
        Please wait while we import {employees.length} employees...
      </p>
    </div>
  )

  const renderResultsStep = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        {importResults?.success ? (
          <>
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-medium mb-2">Import Successful!</h3>
            <p className="text-sm text-slate-600">
              Successfully imported {importResults.imported} employees
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-medium mb-2">Import Failed</h3>
            <p className="text-sm text-slate-600 mb-4">
              There were errors during the import process
            </p>
            {importResults?.errors && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left max-h-[300px] overflow-auto">
                <ul className="text-sm text-red-800 space-y-2">
                  {importResults.errors.map((err: any, index: number) => (
                    <li key={index}>
                      {err.row && `Row ${err.row}: `}
                      {err.message || err.error || JSON.stringify(err)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleClose}>
          {importResults?.success ? 'Done' : 'Close'}
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Import Employees</span>
            {file && step === 'preview' && (
              <Badge variant="secondary" className="font-normal">
                {file.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && renderUploadStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'importing' && renderImportingStep()}
        {step === 'results' && renderResultsStep()}
      </DialogContent>
    </Dialog>
  )
}
