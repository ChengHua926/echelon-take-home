'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useRole } from '@/contexts/RoleContext'
import { Permission } from '@/lib/permissions'

interface ProtectedButtonProps extends React.ComponentProps<typeof Button> {
  permission: Permission
  fallback?: React.ReactNode
}

export function ProtectedButton({
  permission,
  fallback = null,
  children,
  ...props
}: ProtectedButtonProps) {
  const { hasPermission } = useRole()

  if (!hasPermission(permission)) {
    return fallback
  }

  return <Button {...props}>{children}</Button>
}
