'use client'

import React, { useState } from 'react'
import { Network } from 'lucide-react'
import OrgChartFlow from '@/components/org-chart/org-chart-flow'
import { EmployeeDetailModal } from '@/components/employee-detail-modal'
import { EmployeeNode } from '@/components/org-chart/utils'
import { ExportButton } from '@/components/export-button'
import {
  exportOrgChartToCSV,
  exportOrgChartToPDF,
  exportOrgChartToPNG,
} from '@/lib/export-utils'

interface OrgChartClientProps {
  data: EmployeeNode[]
}

export default function OrgChartClient({ data }: OrgChartClientProps) {
  // Modal state
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

  // Handle employee click
  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setEmployeeModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-cyan-500/30">
                <Network className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                  Organization Chart
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  View your organization's reporting structure. Pan, zoom, and click nodes to explore.
                </p>
              </div>
            </div>
            {data.length > 0 && (
              <ExportButton
                onExportCSV={() => exportOrgChartToCSV(data, 'org-chart')}
                onExportPDF={async () => await exportOrgChartToPDF('org-chart-container', 'org-chart')}
                onExportPNG={async () => await exportOrgChartToPNG('org-chart-container', 'org-chart')}
                label="Export"
                variant="outline"
                size="lg"
                className="border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all font-semibold px-6 h-12 rounded-xl"
              />
            )}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div id="org-chart-container" className="max-w-[1600px] mx-auto px-8 py-8 h-[calc(100vh-140px)]">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Network className="h-20 w-20 text-slate-300 mb-6" />
            <p className="text-xl font-semibold text-slate-700 mb-2">
              No organizational structure found
            </p>
            <p className="text-sm text-slate-500">
              Add employees with reporting relationships to see the org chart.
            </p>
          </div>
        ) : (
          <OrgChartFlow data={data} onEmployeeClick={handleEmployeeClick} />
        )}
      </div>

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employeeId={selectedEmployeeId}
        open={employeeModalOpen}
        onOpenChange={setEmployeeModalOpen}
        onEmployeeClick={handleEmployeeClick}
      />
    </div>
  )
}
