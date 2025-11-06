import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function TeamsPage() {
  // Fetch teams from database
  const teams = await prisma.team.findMany({
    include: {
      teamLead: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      members: {
        select: {
          id: true,
        },
      },
      subTeams: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="h-full p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Teams
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your organization's team structure
            </p>
          </div>
          <Button className="gap-2" disabled>
            <Plus className="h-4 w-4" />
            Add Team
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search teams..." className="pl-10" />
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Link key={team.id} href={`/teams/${team.id}`}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {team.name}
                  </h3>
                  {team.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {team.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                  {team.teamLead && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Team Lead</span>
                      <span className="text-gray-900 font-medium">
                        {team.teamLead.firstName} {team.teamLead.lastName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Members</span>
                    <span className="text-gray-900 font-medium">
                      {team.members.length}
                    </span>
                  </div>
                  {team.subTeams.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Sub-teams</span>
                      <span className="text-gray-900 font-medium">
                        {team.subTeams.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No teams found
        </div>
      )}
    </div>
  )
}
