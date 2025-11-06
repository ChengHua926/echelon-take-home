'use client'

import { Card } from '@/components/ui/card'
import { ChevronRight, Minus } from 'lucide-react'

interface Team {
  id: string
  name: string
  description?: string | null
  memberCount?: number
}

interface TeamTreeProps {
  currentTeam: Team
  parentTeam?: Team | null
  subTeams?: Team[]
  onTeamClick?: (teamId: string) => void
}

export function TeamTreeVisualization({
  currentTeam,
  parentTeam,
  subTeams = [],
  onTeamClick,
}: TeamTreeProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Team Hierarchy
      </h3>

      <div className="relative">
        {/* Parent Team (if exists) */}
        {parentTeam && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs text-slate-500 font-medium">Parent Team</div>
            </div>
            <button
              onClick={() => onTeamClick?.(parentTeam.id)}
              className="w-full"
            >
              <Card className="p-3 hover:shadow-md hover:border-blue-300 transition-all border-slate-200 bg-slate-50 hover:bg-blue-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {parentTeam.name[0]}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {parentTeam.name}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </Card>
            </button>

            {/* Connecting line */}
            <div className="flex justify-center py-2">
              <div className="w-px h-6 bg-slate-300"></div>
            </div>
          </div>
        )}

        {/* Current Team */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs text-blue-600 font-bold">Current Team</div>
          </div>
          <Card className="p-4 border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                {currentTeam.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-900 truncate">
                  {currentTeam.name}
                </p>
                {currentTeam.memberCount !== undefined && (
                  <p className="text-xs text-slate-600 mt-0.5">
                    {currentTeam.memberCount} {currentTeam.memberCount === 1 ? 'member' : 'members'}
                  </p>
                )}
              </div>
            </div>
            {currentTeam.description && (
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                {currentTeam.description}
              </p>
            )}
          </Card>
        </div>

        {/* Sub-teams (if exist) */}
        {subTeams.length > 0 && (
          <div>
            {/* Connecting line */}
            <div className="flex justify-center py-2">
              <div className="w-px h-6 bg-slate-300"></div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs text-slate-500 font-medium">
                Sub-teams ({subTeams.length})
              </div>
            </div>

            {/* Sub-teams grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subTeams.map((subTeam, index) => (
                <div key={subTeam.id} className="relative">
                  {/* Connecting lines from parent */}
                  {index === 0 && subTeams.length > 1 && (
                    <div className="absolute -top-2 left-1/2 w-1/2 border-t-2 border-slate-300"></div>
                  )}
                  {index === subTeams.length - 1 && subTeams.length > 1 && (
                    <div className="absolute -top-2 right-1/2 w-1/2 border-t-2 border-slate-300"></div>
                  )}
                  {index > 0 && index < subTeams.length - 1 && (
                    <div className="absolute -top-2 left-0 right-0 border-t-2 border-slate-300"></div>
                  )}
                  {subTeams.length === 1 && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-px h-2 bg-slate-300"></div>
                  )}

                  <button
                    onClick={() => onTeamClick?.(subTeam.id)}
                    className="w-full"
                  >
                    <Card className="p-3 hover:shadow-md hover:border-blue-300 transition-all border-slate-200 bg-white hover:bg-blue-50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {subTeam.name[0]}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {subTeam.name}
                          </p>
                          {subTeam.memberCount !== undefined && (
                            <p className="text-xs text-slate-600">
                              {subTeam.memberCount} {subTeam.memberCount === 1 ? 'member' : 'members'}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </Card>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No sub-teams message */}
        {subTeams.length === 0 && !parentTeam && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
              <Minus className="h-4 w-4 text-slate-400" />
              <p className="text-sm text-slate-600">
                Standalone team (no parent or sub-teams)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
