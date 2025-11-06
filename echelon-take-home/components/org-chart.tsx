"use client"

import React from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

// Dynamically import the org chart to avoid SSR issues
const OrganizationChart = dynamic(
  () => import('@dabeng/react-orgchart'),
  { ssr: false }
)

interface EmployeeNode {
  id: string
  firstName: string
  lastName: string
  title: string
  department: string
  children?: EmployeeNode[]
}

interface OrgChartNode {
  id: string
  name: string
  title: string
  department: string
  children?: OrgChartNode[]
}

// Custom node component with Apple-inspired design
const CustomNode = ({ nodeData }: { nodeData: OrgChartNode }) => {
  return (
    <Link href={`/employees/${nodeData.id}`}>
      <Card className="p-4 hover:shadow-lg transition-all cursor-pointer min-w-[200px] bg-white border border-gray-200">
        <div className="text-center">
          <p className="font-semibold text-gray-900 text-sm">
            {nodeData.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">{nodeData.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{nodeData.department}</p>
        </div>
      </Card>
    </Link>
  )
}

// Transform Prisma data to org chart format
function transformToOrgChartData(employee: EmployeeNode): OrgChartNode {
  return {
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`,
    title: employee.title,
    department: employee.department,
    children: employee.children?.map(transformToOrgChartData),
  }
}

interface OrgChartProps {
  data: EmployeeNode[]
}

export default function OrgChart({ data }: OrgChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No organizational structure found
      </div>
    )
  }

  // Transform the data
  const chartData = data.length === 1
    ? transformToOrgChartData(data[0])
    : {
        id: 'root',
        name: 'Organization',
        title: '',
        department: '',
        children: data.map(transformToOrgChartData),
      }

  return (
    <div className="bg-gray-50 rounded-xl p-8 overflow-hidden">
      <OrganizationChart
        datasource={chartData}
        chartClass="custom-orgchart"
        NodeTemplate={CustomNode}
        collapsible={true}
        pan={true}
        zoom={true}
      />
    </div>
  )
}
