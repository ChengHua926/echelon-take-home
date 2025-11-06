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
  Loader2,
  UsersRound,
  Crown,
  ChevronRight,
  Calendar,
  Users,
} from 'lucide-react'
import { TeamTreeVisualization } from './team-tree-visualization'

interface TeamDetail {
  id: string
  name: string
  description: string | null
  createdAt: string
  teamLead: {
    id: string
    firstName: string
    lastName: string
    title: string
    email: string
  } | null
  parentTeam: {
    id: string
    name: string
    description: string | null
  } | null
  subTeams: Array<{
    id: string
    name: string
    description: string | null
    memberCount: number
  }>
  members: Array<{
    employee: {
      id: string
      firstName: string
      lastName: string
      title: string
      email: string
      department: string
    }
    joinedAt: string
  }>
}

interface TeamDetailModalProps {
  teamId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTeamClick?: (teamId: string) => void
  onEmployeeClick?: (employeeId: string) => void
}

export function TeamDetailModal({
  teamId,
  open,
  onOpenChange,
  onTeamClick,
  onEmployeeClick,
}: TeamDetailModalProps) {
  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && teamId) {
      fetchTeam()
    }
  }, [teamId, open])

  const fetchTeam = async () => {
    if (!teamId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/teams/${teamId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch team')
      }
      const data = await response.json()
      setTeam(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team')
    } finally {
      setLoading(false)
    }
  }

  const handleTeamClick = (id: string) => {
    if (onTeamClick) {
      onTeamClick(id)
    }
  }

  const handleEmployeeClick = (id: string) => {
    if (onEmployeeClick) {
      onEmployeeClick(id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600 font-medium">Loading team details...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-lg font-semibold text-red-600 mb-2">Error</p>
            <p className="text-sm text-slate-600">{error}</p>
          </div>
        ) : team ? (
          <>
            {/* Header Section */}
            <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 px-8 pt-8 pb-6 rounded-t-2xl">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                      {team.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-2xl text-white mb-1">
                        {team.name}
                      </DialogTitle>
                      {team.description && (
                        <p className="text-blue-100 text-base">{team.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge
                    className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-semibold px-3 py-1 flex-shrink-0"
                  >
                    <Users className="h-3.5 w-3.5 mr-1" />
                    {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                  </Badge>
                </div>

                {/* Quick Info Pills */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Created {new Date(team.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {team.subTeams.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                      <UsersRound className="h-3.5 w-3.5" />
                      <span>{team.subTeams.length} sub-{team.subTeams.length === 1 ? 'team' : 'teams'}</span>
                    </div>
                  )}
                </div>
              </DialogHeader>
            </div>

            {/* Content Section */}
            <div className="px-8 py-6 space-y-6">
              {/* Team Lead */}
              {team.teamLead && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Crown className="h-3.5 w-3.5" />
                    Team Lead
                  </h3>
                  <button
                    onClick={() => handleEmployeeClick(team.teamLead!.id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-blue-100 rounded-lg border border-slate-200 hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {team.teamLead.firstName[0]}{team.teamLead.lastName[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {team.teamLead.firstName} {team.teamLead.lastName}
                        </p>
                        <p className="text-xs text-slate-600">{team.teamLead.title}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </button>
                </div>
              )}

              {/* Team Hierarchy Visualization */}
              <TeamTreeVisualization
                currentTeam={{
                  id: team.id,
                  name: team.name,
                  description: team.description,
                  memberCount: team.members.length,
                }}
                parentTeam={team.parentTeam}
                subTeams={team.subTeams.map(sub => ({
                  ...sub,
                  memberCount: sub.memberCount || 0,
                }))}
                onTeamClick={handleTeamClick}
              />

              {/* Team Members */}
              {team.members.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Team Members ({team.members.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {team.members.map((membership) => (
                      <button
                        key={membership.employee.id}
                        onClick={() => handleEmployeeClick(membership.employee.id)}
                        className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all text-left group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                          {membership.employee.firstName[0]}{membership.employee.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {membership.employee.firstName} {membership.employee.lastName}
                          </p>
                          <p className="text-xs text-slate-600 truncate">{membership.employee.title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No members message */}
              {team.members.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No team members yet</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
