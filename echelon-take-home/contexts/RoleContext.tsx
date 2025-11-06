'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Role, DemoUser, Permission, DEMO_USERS, hasPermission as checkPermission } from '@/lib/permissions'

interface RoleContextType {
  currentUser: DemoUser
  switchUser: (userId: string) => void
  hasPermission: (permission: Permission) => boolean
  canEditEmployee: (employeeId: string, employeeDepartment?: string) => boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

const STORAGE_KEY = 'demo-current-user-id'

interface RoleProviderProps {
  children: ReactNode
}

export function RoleProvider({ children }: RoleProviderProps) {
  // Initialize with admin user (Sarah Chen) as default
  const [currentUser, setCurrentUser] = useState<DemoUser>(DEMO_USERS[0])

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem(STORAGE_KEY)
      if (storedUserId) {
        const user = DEMO_USERS.find((u) => u.id === storedUserId)
        if (user) {
          setCurrentUser(user)
        }
      }
    }
  }, [])

  const switchUser = (userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId)
    if (user) {
      setCurrentUser(user)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, userId)
      }
    }
  }

  const hasPermission = (permission: Permission): boolean => {
    return checkPermission(currentUser.role, permission)
  }

  const canEditEmployee = (employeeId: string, employeeDepartment?: string): boolean => {
    const role = currentUser.role

    // Admin and HR can edit all employees
    if (role === 'admin' || role === 'hr') {
      return true
    }

    // Manager can edit employees in their department
    if (role === 'manager' && employeeDepartment) {
      return employeeDepartment === currentUser.department
    }

    // Employee role cannot edit anyone
    return false
  }

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        switchUser,
        hasPermission,
        canEditEmployee,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole(): RoleContextType {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}
