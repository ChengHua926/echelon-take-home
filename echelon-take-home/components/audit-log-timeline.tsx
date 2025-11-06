'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Plus, Edit, Trash2, User, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AuditLogEntry {
  id: string
  action: 'create' | 'update' | 'delete'
  changes: Record<string, any>
  timestamp: string
  user: {
    email: string
  } | null
  ipAddress: string | null
}

interface AuditLogTimelineProps {
  logs: AuditLogEntry[]
}

const ACTION_CONFIG = {
  create: {
    icon: Plus,
    label: 'Created',
    color: 'bg-green-100 text-green-700 border-green-200',
    iconColor: 'text-green-600',
  },
  update: {
    icon: Edit,
    label: 'Updated',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    iconColor: 'text-blue-600',
  },
  delete: {
    icon: Trash2,
    label: 'Deleted',
    color: 'bg-red-100 text-red-700 border-red-200',
    iconColor: 'text-red-600',
  },
}

// Format field name to be more readable
function formatFieldName(field: string): string {
  // Convert camelCase to Title Case
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

// Format field value for display
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return 'None'
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    // Format dates
    return new Date(value).toLocaleDateString()
  }
  return value.toString()
}

export function AuditLogTimeline({ logs }: AuditLogTimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p className="text-sm">No change history available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => {
        const config = ACTION_CONFIG[log.action]
        const Icon = config.icon
        const timestamp = new Date(log.timestamp)
        const relativeTime = formatDistanceToNow(timestamp, { addSuffix: true })

        return (
          <div key={log.id} className="relative">
            {/* Timeline line */}
            {index !== logs.length - 1 && (
              <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-slate-200" />
            )}

            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${config.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge variant="secondary" className={`${config.color} font-medium`}>
                        {config.label}
                      </Badge>
                      {log.user && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600">
                          <User className="h-3 w-3" />
                          {log.user.email}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500" title={timestamp.toLocaleString()}>
                        {relativeTime}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Changes */}
                  {log.changes && Object.keys(log.changes).length > 0 && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(log.changes).map(([field, value]) => {
                        // Handle update format (old/new)
                        if (value && typeof value === 'object' && 'old' in value && 'new' in value) {
                          return (
                            <div key={field} className="text-sm">
                              <span className="font-medium text-slate-700">
                                {formatFieldName(field)}:
                              </span>
                              <div className="ml-4 mt-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600 line-through">
                                    {formatValue(value.old)}
                                  </span>
                                  <span className="text-slate-400">→</span>
                                  <span className="text-green-600 font-medium">
                                    {formatValue(value.new)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }

                        // Handle create format (just new value)
                        return (
                          <div key={field} className="text-sm">
                            <span className="font-medium text-slate-700">
                              {formatFieldName(field)}:
                            </span>{' '}
                            <span className="text-slate-600">{formatValue(value)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* IP Address (optional) */}
                  {log.ipAddress && (
                    <div className="mt-2 text-xs text-slate-400">
                      IP: {log.ipAddress}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
