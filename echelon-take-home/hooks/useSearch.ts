import { useState, useEffect, useCallback } from 'react'

export interface SearchEmployee {
  id: string
  firstName: string
  lastName: string
  email: string
  title: string
  department: string
  phone: string | null
  hireDate: string
  salary: number | null
  status: string
  manager: {
    id: string
    firstName: string
    lastName: string
  } | null
  relevanceScore?: number
}

export interface SearchTeam {
  id: string
  name: string
  description: string | null
  teamLeadId: string | null
  parentTeamId: string | null
  createdAt: string
  teamLead: {
    id: string
    firstName: string
    lastName: string
    title: string
  } | null
  parentTeam: {
    id: string
    name: string
  } | null
  memberCount: number
  subTeamCount: number
  relevanceScore?: number
}

export interface SearchResponse {
  employees: {
    items: SearchEmployee[]
    total: number
  }
  teams: {
    items: SearchTeam[]
    total: number
  }
  pagination: {
    page: number
    limit: number
    totalResults: number
    totalPages?: number
    hasMore?: boolean
  }
}

export interface UseSearchParams {
  query?: string
  type?: 'all' | 'employees' | 'teams'
  page?: number
  limit?: number
}

export function useSearch(params: UseSearchParams = {}) {
  const [data, setData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSearch = useCallback(async () => {
    // Don't search if query is empty
    if (!params.query || params.query.trim() === '') {
      setData({
        employees: { items: [], total: 0 },
        teams: { items: [], total: 0 },
        pagination: {
          page: 1,
          limit: params.limit || 20,
          totalResults: 0,
        },
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Build query string
      const queryParams = new URLSearchParams()
      if (params.query) queryParams.set('q', params.query)
      if (params.type) queryParams.set('type', params.type)
      if (params.page) queryParams.set('page', params.page.toString())
      if (params.limit) queryParams.set('limit', params.limit.toString())

      const response = await fetch(`/api/search?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to perform search')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [params.query, params.type, params.page, params.limit])

  useEffect(() => {
    fetchSearch()
  }, [fetchSearch])

  return {
    employees: data?.employees.items || [],
    employeesTotal: data?.employees.total || 0,
    teams: data?.teams.items || [],
    teamsTotal: data?.teams.total || 0,
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchSearch,
  }
}
