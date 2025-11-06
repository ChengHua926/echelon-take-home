import { prisma } from './prisma'

export type AuditAction = 'create' | 'update' | 'delete'
export type EntityType = 'employee' | 'team'

interface CreateAuditLogParams {
  userId?: string | null
  entityType: EntityType
  entityId: string
  action: AuditAction
  changes: Record<string, any>
  ipAddress?: string | null
}

/**
 * Create an audit log entry
 */
export async function createAuditLog({
  userId,
  entityType,
  entityId,
  action,
  changes,
  ipAddress,
}: CreateAuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        entityType,
        entityId,
        action,
        changes,
        ipAddress: ipAddress || null,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging shouldn't break the main operation
  }
}

/**
 * Build changes object for update operations
 * Compares old and new values and returns only changed fields
 */
export function buildChanges(
  oldData: Record<string, any>,
  newData: Record<string, any>
): Record<string, { old: any; new: any }> {
  const changes: Record<string, { old: any; new: any }> = {}

  for (const key in newData) {
    if (newData[key] !== oldData[key]) {
      // Handle null and undefined as equivalent
      if (!(newData[key] == null && oldData[key] == null)) {
        changes[key] = {
          old: oldData[key],
          new: newData[key],
        }
      }
    }
  }

  return changes
}

/**
 * Get IP address from request headers
 */
export function getIpAddress(request: Request): string | null {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null
  )
}
