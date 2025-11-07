import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

/**
 * HRIS Data Tools for AI Chat
 * These tools allow the AI to query employee, team, and organizational data
 */

// Search for employees by various criteria
export const searchEmployees = tool({
  description: 'Search for employees by name, department, title, status, or other criteria. Returns a list of matching employees.',
  inputSchema: z.object({
    query: z.string().default('').describe('Search query to match against employee name, email, title, or department'),
    department: z.string().default('').describe('Filter by specific department'),
    title: z.string().default('').describe('Filter by job title'),
    status: z.enum(['active', 'inactive', 'terminated', '']).default('').describe('Filter by employment status'),
    managerId: z.string().default('').describe('Filter by manager ID'),
    limit: z.number().default(10).describe('Maximum number of results to return'),
  }),
  execute: async ({ query = '', department = '', title = '', status = '', managerId = '', limit = 10 }) => {
    try {
      const where: any = {}

      // Text search across multiple fields
      if (query && query.trim()) {
        where.OR = [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { department: { contains: query, mode: 'insensitive' } },
        ]
      }

      // Specific filters
      if (department && department.trim()) where.department = { equals: department, mode: 'insensitive' }
      if (title && title.trim()) where.title = { contains: title, mode: 'insensitive' }
      if (status && status.trim()) where.status = status
      if (managerId && managerId.trim()) where.managerId = managerId

      const employees = await prisma.employee.findMany({
        where,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
            },
          },
          _count: {
            select: {
              directReports: true,
              teamMembers: true,
            },
          },
        },
        take: limit,
        orderBy: { firstName: 'asc' },
      })

      return {
        success: true,
        count: employees.length,
        employees: employees.map(emp => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          title: emp.title,
          department: emp.department,
          status: emp.status,
          hireDate: emp.hireDate.toISOString().split('T')[0],
          salary: emp.salary?.toString(),
          manager: emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName} (${emp.manager.title})` : null,
          directReportsCount: emp._count.directReports,
          teamsCount: emp._count.teamMembers,
        })),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search employees',
      }
    }
  },
})

// Get detailed information about a specific employee
export const getEmployee = tool({
  description: 'Get detailed information about a specific employee by their ID or email. Returns full employee details including manager, direct reports, and team memberships.',
  inputSchema: z.object({
    employeeId: z.string().default('').describe('Employee UUID'),
    email: z.string().default('').describe('Employee email address'),
  }),
  execute: async ({ employeeId = '', email = '' }) => {
    try {
      if (!employeeId && !email) {
        return { success: false, error: 'Either employeeId or email must be provided' }
      }

      const where = employeeId ? { id: employeeId } : { email: email }

      const employee = await prisma.employee.findUnique({
        where,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
              email: true,
            },
          },
          directReports: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
              department: true,
            },
          },
          teamMembers: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      })

      if (!employee) {
        return { success: false, error: 'Employee not found' }
      }

      return {
        success: true,
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          title: employee.title,
          department: employee.department,
          status: employee.status,
          phone: employee.phone,
          hireDate: employee.hireDate.toISOString().split('T')[0],
          salary: employee.salary?.toString(),
          manager: employee.manager ? {
            id: employee.manager.id,
            name: `${employee.manager.firstName} ${employee.manager.lastName}`,
            title: employee.manager.title,
            email: employee.manager.email,
          } : null,
          directReports: employee.directReports.map(dr => ({
            id: dr.id,
            name: `${dr.firstName} ${dr.lastName}`,
            title: dr.title,
            department: dr.department,
          })),
          teams: employee.teamMembers.map(tm => ({
            id: tm.team.id,
            name: tm.team.name,
            description: tm.team.description,
            joinedAt: tm.joinedAt?.toISOString().split('T')[0],
          })),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get employee',
      }
    }
  },
})

// Get organizational chart/hierarchy
export const getOrgChart = tool({
  description: 'Get the organizational hierarchy starting from a specific employee (or from the top if no employee specified). Shows manager-employee reporting relationships.',
  inputSchema: z.object({
    startFromEmployeeId: z.string().default('').describe('Employee ID to start the org chart from. If not provided, starts from top-level executives.'),
    depth: z.number().default(3).describe('How many levels deep to traverse the hierarchy'),
  }),
  execute: async ({ startFromEmployeeId = '', depth = 3 }) => {
    try {
      // Helper function to recursively build org chart
      const buildOrgTree = async (employeeId: string | null, currentDepth: number): Promise<any> => {
        if (currentDepth >= depth) return null

        const employees = await prisma.employee.findMany({
          where: {
            managerId: employeeId,
            status: 'active',
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            department: true,
            email: true,
            _count: {
              select: {
                directReports: true,
              },
            },
          },
          orderBy: { firstName: 'asc' },
        })

        const tree = await Promise.all(
          employees.map(async (emp) => ({
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            title: emp.title,
            department: emp.department,
            email: emp.email,
            directReportsCount: emp._count.directReports,
            directReports: await buildOrgTree(emp.id, currentDepth + 1),
          }))
        )

        return tree.length > 0 ? tree : null
      }

      if (startFromEmployeeId && startFromEmployeeId.trim()) {
        // Start from specific employee
        const rootEmployee = await prisma.employee.findUnique({
          where: { id: startFromEmployeeId.trim() },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            department: true,
            email: true,
            managerId: true,
            _count: {
              select: {
                directReports: true,
              },
            },
          },
        })

        if (!rootEmployee) {
          return { success: false, error: 'Employee not found' }
        }

        return {
          success: true,
          orgChart: {
            id: rootEmployee.id,
            name: `${rootEmployee.firstName} ${rootEmployee.lastName}`,
            title: rootEmployee.title,
            department: rootEmployee.department,
            email: rootEmployee.email,
            directReportsCount: rootEmployee._count.directReports,
            directReports: await buildOrgTree(rootEmployee.id, 0),
          },
        }
      } else {
        // Start from top-level (employees with no manager)
        const topLevel = await buildOrgTree(null, 0)
        return {
          success: true,
          orgChart: topLevel,
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get org chart',
      }
    }
  },
})

// Search for teams
export const searchTeams = tool({
  description: 'Search for teams by name, description, or other criteria. Returns a list of matching teams.',
  inputSchema: z.object({
    query: z.string().default('').describe('Search query to match against team name or description'),
    teamLeadId: z.string().default('').describe('Filter by team lead ID'),
    parentTeamId: z.string().default('').describe('Filter by parent team ID'),
    limit: z.number().default(10).describe('Maximum number of results to return'),
  }),
  execute: async ({ query = '', teamLeadId = '', parentTeamId = '', limit = 10 }) => {
    try {
      const where: any = {}

      if (query && query.trim()) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      }

      if (teamLeadId && teamLeadId.trim()) where.teamLeadId = teamLeadId.trim()
      if (parentTeamId && parentTeamId.trim()) where.parentTeamId = parentTeamId.trim()

      const teams = await prisma.team.findMany({
        where,
        include: {
          teamLead: {
            select: {
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
          _count: {
            select: {
              members: true,
              subTeams: true,
            },
          },
        },
        take: limit,
        orderBy: { name: 'asc' },
      })

      return {
        success: true,
        count: teams.length,
        teams: teams.map(team => ({
          id: team.id,
          name: team.name,
          description: team.description,
          teamLead: team.teamLead ? `${team.teamLead.firstName} ${team.teamLead.lastName} (${team.teamLead.title})` : null,
          parentTeam: team.parentTeam?.name,
          membersCount: team._count.members,
          subTeamsCount: team._count.subTeams,
        })),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search teams',
      }
    }
  },
})

// Get detailed information about a specific team
export const getTeam = tool({
  description: 'Get detailed information about a specific team including members, subteams, and hierarchy.',
  inputSchema: z.object({
    teamId: z.string().describe('Team UUID'),
    includeMembers: z.boolean().default(true).describe('Include list of team members'),
    includeSubTeams: z.boolean().default(true).describe('Include list of subteams'),
  }),
  execute: async ({ teamId, includeMembers = true, includeSubTeams = true }) => {
    try {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          teamLead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
              email: true,
            },
          },
          parentTeam: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          members: includeMembers ? {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  title: true,
                  department: true,
                  email: true,
                },
              },
            },
          } : false,
          subTeams: includeSubTeams ? {
            select: {
              id: true,
              name: true,
              description: true,
              _count: {
                select: {
                  members: true,
                },
              },
            },
          } : false,
        },
      })

      if (!team) {
        return { success: false, error: 'Team not found' }
      }

      return {
        success: true,
        team: {
          id: team.id,
          name: team.name,
          description: team.description,
          teamLead: team.teamLead ? {
            id: team.teamLead.id,
            name: `${team.teamLead.firstName} ${team.teamLead.lastName}`,
            title: team.teamLead.title,
            email: team.teamLead.email,
          } : null,
          parentTeam: team.parentTeam,
          members: includeMembers && team.members ? team.members.map(m => ({
            id: m.employee.id,
            name: `${m.employee.firstName} ${m.employee.lastName}`,
            title: m.employee.title,
            department: m.employee.department,
            email: m.employee.email,
            joinedAt: m.joinedAt?.toISOString().split('T')[0],
          })) : undefined,
          subTeams: includeSubTeams && team.subTeams ? team.subTeams.map(st => ({
            id: st.id,
            name: st.name,
            description: st.description,
            membersCount: st._count.members,
          })) : undefined,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get team',
      }
    }
  },
})

// Get list of all departments
export const getDepartments = tool({
  description: 'Get a list of all unique departments in the organization with employee counts.',
  inputSchema: z.object({
    includeInactive: z.boolean().default(false).describe('Include inactive employees in counts'),
  }),
  execute: async ({ includeInactive = false }) => {
    try {
      const where = includeInactive ? {} : { status: 'active' }

      const departments = await prisma.employee.groupBy({
        by: ['department'],
        where,
        _count: {
          id: true,
        },
        orderBy: {
          department: 'asc',
        },
      })

      return {
        success: true,
        departments: departments.map(dept => ({
          name: dept.department,
          employeeCount: dept._count.id,
        })),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get departments',
      }
    }
  },
})

// Get employees by department
export const getEmployeesByDepartment = tool({
  description: 'Get all employees in a specific department.',
  inputSchema: z.object({
    department: z.string().describe('Department name'),
    status: z.enum(['active', 'inactive', 'terminated']).default('active').describe('Filter by employment status'),
  }),
  execute: async ({ department, status = 'active' }) => {
    try {
      const employees = await prisma.employee.findMany({
        where: {
          department: { equals: department, mode: 'insensitive' },
          status,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          title: true,
          email: true,
          hireDate: true,
          manager: {
            select: {
              firstName: true,
              lastName: true,
              title: true,
            },
          },
        },
        orderBy: [
          { title: 'asc' },
          { firstName: 'asc' },
        ],
      })

      return {
        success: true,
        department,
        count: employees.length,
        employees: employees.map(emp => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          title: emp.title,
          email: emp.email,
          hireDate: emp.hireDate.toISOString().split('T')[0],
          manager: emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : null,
        })),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get employees by department',
      }
    }
  },
})

// Get company statistics
export const getCompanyStats = tool({
  description: 'Get overall company statistics including employee counts, department breakdown, and other metrics.',
  inputSchema: z.object({
    topDepartmentsLimit: z.number().default(5).describe('Number of top departments to include'),
  }),
  execute: async ({ topDepartmentsLimit = 5 }) => {
    try {
      const [
        totalEmployees,
        activeEmployees,
        totalTeams,
        departmentStats,
        recentHires,
      ] = await Promise.all([
        prisma.employee.count(),
        prisma.employee.count({ where: { status: 'active' } }),
        prisma.team.count(),
        prisma.employee.groupBy({
          by: ['department'],
          where: { status: 'active' },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: topDepartmentsLimit,
        }),
        prisma.employee.count({
          where: {
            status: 'active',
            hireDate: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
            },
          },
        }),
      ])

      return {
        success: true,
        stats: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees: totalEmployees - activeEmployees,
          totalTeams,
          recentHires3Months: recentHires,
          topDepartments: departmentStats.map(dept => ({
            department: dept.department,
            employeeCount: dept._count.id,
          })),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get company stats',
      }
    }
  },
})

// Export all tools as a single object
export const hrisTools = {
  searchEmployees: searchEmployees,
  getEmployee: getEmployee,
  getOrgChart: getOrgChart,
  searchTeams: searchTeams,
  getTeam: getTeam,
  getDepartments: getDepartments,
  getEmployeesByDepartment: getEmployeesByDepartment,
  getCompanyStats: getCompanyStats,
}
