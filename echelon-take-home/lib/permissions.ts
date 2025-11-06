export type Role = 'admin' | 'hr' | 'manager' | 'employee'

export interface DemoUser {
  id: string
  employeeId: string
  name: string
  email: string
  title: string
  department: string
  role: Role
  avatar: string
}

// Demo users based on actual employees in the database
export const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-admin',
    employeeId: '10000000-0000-0000-0000-000000000001',
    name: 'Sarah Chen',
    email: 'sarah.chen@echelon.com',
    title: 'Chief Executive Officer',
    department: 'Executive',
    role: 'admin',
    avatar: 'SC',
  },
  {
    id: 'demo-hr',
    employeeId: '10000000-0000-0000-0000-000000000003',
    name: 'Emily Watson',
    email: 'emily.watson@echelon.com',
    title: 'Chief People Officer',
    department: 'Human Resources',
    role: 'hr',
    avatar: 'EW',
  },
  {
    id: 'demo-manager',
    employeeId: '10000000-0000-0000-0000-000000000002',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@echelon.com',
    title: 'Chief Technology Officer',
    department: 'Engineering',
    role: 'manager',
    avatar: 'MR',
  },
  {
    id: 'demo-employee',
    employeeId: '10000000-0000-0000-0000-000000000004',
    name: 'David Kim',
    email: 'david.kim@echelon.com',
    title: 'Chief Financial Officer',
    department: 'Finance',
    role: 'employee',
    avatar: 'DK',
  },
]

// Permission definitions
export type Permission =
  // Employee permissions
  | 'employee.create'
  | 'employee.edit.all'
  | 'employee.edit.own-department'
  | 'employee.delete'
  | 'employee.import'
  | 'employee.export'
  | 'employee.view.salary'
  // Team permissions
  | 'team.create'
  | 'team.edit'
  | 'team.delete'
  | 'team.export'

// Permission matrix
export const PERMISSIONS: Record<Permission, Role[]> = {
  // Employee permissions
  'employee.create': ['admin', 'hr'],
  'employee.edit.all': ['admin', 'hr'],
  'employee.edit.own-department': ['admin', 'hr', 'manager'],
  'employee.delete': ['admin'],
  'employee.import': ['admin', 'hr'],
  'employee.export': ['admin', 'hr'],
  'employee.view.salary': ['admin', 'hr'],

  // Team permissions
  'team.create': ['admin'],
  'team.edit': ['admin'],
  'team.delete': ['admin'],
  'team.export': ['admin', 'hr'],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission]
  return allowedRoles.includes(role)
}

/**
 * Get user by ID
 */
export function getUserById(id: string): DemoUser | undefined {
  return DEMO_USERS.find((user) => user.id === id)
}

/**
 * Get user by employee ID
 */
export function getUserByEmployeeId(employeeId: string): DemoUser | undefined {
  return DEMO_USERS.find((user) => user.employeeId === employeeId)
}

/**
 * Get role display information
 */
export function getRoleInfo(role: Role): {
  label: string
  color: string
  description: string
} {
  switch (role) {
    case 'admin':
      return {
        label: 'Admin',
        color: 'bg-red-100 text-red-700 border-red-200',
        description: 'Full system access',
      }
    case 'hr':
      return {
        label: 'HR',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        description: 'Manage employees & export',
      }
    case 'manager':
      return {
        label: 'Manager',
        color: 'bg-green-100 text-green-700 border-green-200',
        description: 'View all, edit department',
      }
    case 'employee':
      return {
        label: 'Employee',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        description: 'Read-only access',
      }
  }
}
