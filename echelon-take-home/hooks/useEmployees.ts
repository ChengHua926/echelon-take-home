import { useState, useEffect, useCallback } from 'react'

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  title: string
  department: string
  managerId: string | null
  phone: string | null
  hireDate: string
  salary: number | null
  status: string
  manager: {
    id: string
    firstName: string
    lastName: string
  } | null
}

export interface EmployeesResponse {
  employees: Employee[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

export interface UseEmployeesParams {
  search?: string
  department?: string
  managerId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export function useEmployees(params: UseEmployeesParams = {}) {
  const [data, setData] = useState<EmployeesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string
      const queryParams = new URLSearchParams()
      if (params.search) queryParams.set('search', params.search)
      if (params.department) queryParams.set('department', params.department)
      if (params.managerId) queryParams.set('managerId', params.managerId)
      if (params.sortBy) queryParams.set('sortBy', params.sortBy)
      if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder)
      if (params.page) queryParams.set('page', params.page.toString())
      if (params.limit) queryParams.set('limit', params.limit.toString())

      const response = await fetch(`/api/employees?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch employees')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [
    params.search,
    params.department,
    params.managerId,
    params.sortBy,
    params.sortOrder,
    params.page,
    params.limit,
  ])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  return {
    employees: data?.employees || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchEmployees,
  }
}
