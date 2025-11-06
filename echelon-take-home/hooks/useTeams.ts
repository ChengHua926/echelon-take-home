import { useState, useEffect, useCallback } from 'react'

export interface Team {
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
}

export interface TeamsResponse {
  teams: Team[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

export interface UseTeamsParams {
  search?: string
  teamLeadId?: string
  parentTeamId?: string
  memberCountRange?: string
  hasSubTeams?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export function useTeams(params: UseTeamsParams = {}) {
  const [data, setData] = useState<TeamsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string
      const queryParams = new URLSearchParams()
      if (params.search) queryParams.set('search', params.search)
      if (params.teamLeadId) queryParams.set('teamLeadId', params.teamLeadId)
      if (params.parentTeamId) queryParams.set('parentTeamId', params.parentTeamId)
      if (params.memberCountRange) queryParams.set('memberCountRange', params.memberCountRange)
      if (params.hasSubTeams) queryParams.set('hasSubTeams', params.hasSubTeams)
      if (params.sortBy) queryParams.set('sortBy', params.sortBy)
      if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder)
      if (params.page) queryParams.set('page', params.page.toString())
      if (params.limit) queryParams.set('limit', params.limit.toString())

      const response = await fetch(`/api/teams?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch teams')
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
    params.teamLeadId,
    params.parentTeamId,
    params.memberCountRange,
    params.hasSubTeams,
    params.sortBy,
    params.sortOrder,
    params.page,
    params.limit,
  ])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  return {
    teams: data?.teams || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch: fetchTeams,
  }
}
