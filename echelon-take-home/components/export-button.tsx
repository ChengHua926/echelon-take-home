'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText, Loader2, Image } from 'lucide-react'

interface ExportButtonProps {
  onExportCSV?: () => void | Promise<void>
  onExportExcel?: () => void | Promise<void>
  onExportPDF?: () => void | Promise<void>
  onExportPNG?: () => void | Promise<void>
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function ExportButton({
  onExportCSV,
  onExportExcel,
  onExportPDF,
  onExportPNG,
  label = 'Export',
  variant = 'outline',
  size = 'lg',
  className = '',
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false)
  const [loadingType, setLoadingType] = useState<string | null>(null)

  const handleExport = async (type: string, handler?: () => void | Promise<void>) => {
    if (!handler) return

    setLoading(true)
    setLoadingType(type)
    try {
      await handler()
    } catch (error) {
      console.error(`Error exporting to ${type}:`, error)
      alert(`Failed to export to ${type}. Please try again.`)
    } finally {
      setLoading(false)
      setLoadingType(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          variant={variant}
          className={className}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Download className="h-5 w-5 mr-2" />
          )}
          {loading ? `Exporting...` : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border-2 border-slate-200 shadow-xl">
        <DropdownMenuLabel className="text-slate-700 font-semibold">Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200" />

        {onExportCSV && (
          <DropdownMenuItem
            onClick={() => handleExport('CSV', onExportCSV)}
            disabled={loading}
            className="cursor-pointer hover:bg-slate-50 focus:bg-slate-100 py-2.5 px-3 rounded-md"
          >
            <FileText className="h-4 w-4 mr-2 text-green-600" />
            <span className="font-medium text-slate-700">Export as CSV</span>
            {loadingType === 'CSV' && (
              <Loader2 className="h-3 w-3 ml-auto animate-spin" />
            )}
          </DropdownMenuItem>
        )}

        {onExportExcel && (
          <DropdownMenuItem
            onClick={() => handleExport('Excel', onExportExcel)}
            disabled={loading}
            className="cursor-pointer hover:bg-slate-50 focus:bg-slate-100 py-2.5 px-3 rounded-md"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-700" />
            <span className="font-medium text-slate-700">Export as Excel</span>
            {loadingType === 'Excel' && (
              <Loader2 className="h-3 w-3 ml-auto animate-spin" />
            )}
          </DropdownMenuItem>
        )}

        {onExportPDF && (
          <DropdownMenuItem
            onClick={() => handleExport('PDF', onExportPDF)}
            disabled={loading}
            className="cursor-pointer hover:bg-slate-50 focus:bg-slate-100 py-2.5 px-3 rounded-md"
          >
            <FileText className="h-4 w-4 mr-2 text-red-600" />
            <span className="font-medium text-slate-700">Export as PDF</span>
            {loadingType === 'PDF' && (
              <Loader2 className="h-3 w-3 ml-auto animate-spin" />
            )}
          </DropdownMenuItem>
        )}

        {onExportPNG && (
          <DropdownMenuItem
            onClick={() => handleExport('PNG', onExportPNG)}
            disabled={loading}
            className="cursor-pointer hover:bg-slate-50 focus:bg-slate-100 py-2.5 px-3 rounded-md"
          >
            <Image className="h-4 w-4 mr-2 text-blue-600" />
            <span className="font-medium text-slate-700">Export as PNG</span>
            {loadingType === 'PNG' && (
              <Loader2 className="h-3 w-3 ml-auto animate-spin" />
            )}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
