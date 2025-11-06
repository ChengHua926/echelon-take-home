import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      teamLead: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          title: true,
        },
      },
      parentTeam: {
        select: {
          id: true,
          name: true,
        },
      },
      subTeams: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      members: {
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
              email: true,
            },
          },
        },
      },
    },
  })

  if (!team) {
    notFound()
  }

  return (
    <div className="h-full p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/teams">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Teams
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {team.name}
          </h1>
          {team.description && (
            <p className="text-gray-500 mt-1">{team.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({team.members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {team.members.length > 0 ? (
                <div className="space-y-2">
                  {team.members.map((membership) => (
                    <Link
                      key={membership.employee.id}
                      href={`/employees/${membership.employee.id}`}
                      className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {membership.employee.firstName}{' '}
                            {membership.employee.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {membership.employee.title}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {membership.employee.email}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No members in this team yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Sub-teams */}
          {team.subTeams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sub-teams ({team.subTeams.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {team.subTeams.map((subTeam) => (
                    <Link
                      key={subTeam.id}
                      href={`/teams/${subTeam.id}`}
                      className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {subTeam.name}
                      </p>
                      {subTeam.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {subTeam.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Lead */}
          {team.teamLead && (
            <Card>
              <CardHeader>
                <CardTitle>Team Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/employees/${team.teamLead.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {team.teamLead.firstName} {team.teamLead.lastName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {team.teamLead.title}
                  </p>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Parent Team */}
          {team.parentTeam && (
            <Card>
              <CardHeader>
                <CardTitle>Parent Team</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/teams/${team.parentTeam.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {team.parentTeam.name}
                  </p>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
