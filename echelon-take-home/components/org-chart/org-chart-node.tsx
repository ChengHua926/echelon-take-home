'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Building2 } from 'lucide-react'

export interface OrgChartNodeData {
  id: string
  firstName: string
  lastName: string
  title: string
  department: string
  hasChildren: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
  onClick?: () => void
}

const OrgChartNode = memo(({ data }: NodeProps<OrgChartNodeData>) => {
  const initials = `${data.firstName[0]}${data.lastName[0]}`
  const fullName = `${data.firstName} ${data.lastName}`

  const handleClick = () => {
    if (data.onClick) {
      data.onClick()
    }
  }

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (data.onToggleExpand) {
      data.onToggleExpand()
    }
  }

  return (
    <div className="relative">
      {/* Input Handle (connection point from parent) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-cyan-500 !w-2 !h-2 !border-2 !border-white"
      />

      {/* Node Card */}
      <Card
        onClick={handleClick}
        className="p-4 cursor-pointer min-w-[220px] bg-white border-2 border-transparent hover:border-cyan-300 hover:shadow-xl hover:scale-105 transition-all duration-200 group"
      >
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl group-hover:shadow-cyan-500/50 transition-all">
              {initials}
            </div>
            {/* Expand/Collapse Button */}
            {data.hasChildren && (
              <button
                onClick={handleToggleExpand}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-cyan-500 flex items-center justify-center hover:bg-cyan-50 transition-colors shadow-md"
                title={data.isExpanded ? 'Collapse' : 'Expand'}
              >
                {data.isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-cyan-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-cyan-600" />
                )}
              </button>
            )}
          </div>

          {/* Name */}
          <div>
            <p className="font-bold text-sm text-slate-900 group-hover:text-cyan-700 transition-colors">
              {fullName}
            </p>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              {data.title}
            </p>
          </div>

          {/* Department Badge */}
          <Badge
            variant="secondary"
            className="bg-cyan-100 text-cyan-700 border-cyan-200 text-xs px-2 py-0.5"
          >
            <Building2 className="h-3 w-3 mr-1" />
            {data.department}
          </Badge>
        </div>
      </Card>

      {/* Output Handle (connection point to children) */}
      {data.hasChildren && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-cyan-500 !w-2 !h-2 !border-2 !border-white"
        />
      )}
    </div>
  )
})

OrgChartNode.displayName = 'OrgChartNode'

export default OrgChartNode
