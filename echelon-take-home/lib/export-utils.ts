import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'

// Employee data type
interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  title: string
  department: string
  hireDate: string
  salary: number | null
  status: string
  manager?: {
    firstName: string
    lastName: string
  } | null
}

// Team data type
interface Team {
  id: string
  name: string
  description: string | null
  memberCount: number
  teamLead?: {
    firstName: string
    lastName: string
  } | null
  parentTeam?: {
    name: string
  } | null
}

// Org Chart data type
interface OrgChartNode {
  id: string
  firstName: string
  lastName: string
  title: string
  department: string
  children?: OrgChartNode[]
}

/**
 * Export employees to CSV
 */
export function exportEmployeesToCSV(employees: Employee[], filename = 'employees') {
  const data = employees.map((emp) => ({
    'First Name': emp.firstName,
    'Last Name': emp.lastName,
    'Email': emp.email,
    'Phone': emp.phone || '',
    'Title': emp.title,
    'Department': emp.department,
    'Hire Date': new Date(emp.hireDate).toLocaleDateString(),
    'Salary': emp.salary ? `$${emp.salary.toLocaleString()}` : '',
    'Status': emp.status,
    'Manager': emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : 'None',
  }))

  const csv = Papa.unparse(data)
  downloadFile(csv, `${filename}.csv`, 'text/csv')
}

/**
 * Export employees to Excel
 */
export function exportEmployeesToExcel(employees: Employee[], filename = 'employees') {
  const wb = XLSX.utils.book_new()

  // Main employee sheet
  const employeeData = employees.map((emp) => ({
    'First Name': emp.firstName,
    'Last Name': emp.lastName,
    'Email': emp.email,
    'Phone': emp.phone || '',
    'Title': emp.title,
    'Department': emp.department,
    'Hire Date': new Date(emp.hireDate).toLocaleDateString(),
    'Salary': emp.salary || '',
    'Status': emp.status,
    'Manager': emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : 'None',
  }))

  const ws = XLSX.utils.json_to_sheet(employeeData)
  XLSX.utils.book_append_sheet(wb, ws, 'Employees')

  // Department summary sheet
  const deptSummary = employees.reduce((acc, emp) => {
    if (!acc[emp.department]) {
      acc[emp.department] = { count: 0, totalSalary: 0 }
    }
    acc[emp.department].count++
    if (emp.salary) {
      acc[emp.department].totalSalary += Number(emp.salary)
    }
    return acc
  }, {} as Record<string, { count: number; totalSalary: number }>)

  const deptData = Object.entries(deptSummary).map(([dept, stats]) => ({
    'Department': dept,
    'Employee Count': stats.count,
    'Total Salary': stats.totalSalary,
    'Average Salary': stats.totalSalary / stats.count,
  }))

  const ws2 = XLSX.utils.json_to_sheet(deptData)
  XLSX.utils.book_append_sheet(wb, ws2, 'Department Summary')

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Export employees to PDF
 */
export function exportEmployeesToPDF(employees: Employee[], filename = 'employees') {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text('Employee Directory', 14, 20)

  // Add metadata
  doc.setFontSize(10)
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28)
  doc.text(`Total Employees: ${employees.length}`, 14, 34)

  // Prepare table data
  const tableData = employees.map((emp) => [
    `${emp.firstName} ${emp.lastName}`,
    emp.title,
    emp.department,
    emp.email,
    new Date(emp.hireDate).toLocaleDateString(),
    emp.status,
  ])

  // Add table
  autoTable(doc, {
    startY: 40,
    head: [['Name', 'Title', 'Department', 'Email', 'Hire Date', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  })

  doc.save(`${filename}.pdf`)
}

/**
 * Export teams to CSV
 */
export function exportTeamsToCSV(teams: Team[], filename = 'teams') {
  const data = teams.map((team) => ({
    'Team Name': team.name,
    'Description': team.description || '',
    'Member Count': team.memberCount,
    'Team Lead': team.teamLead ? `${team.teamLead.firstName} ${team.teamLead.lastName}` : 'None',
    'Parent Team': team.parentTeam?.name || 'None',
  }))

  const csv = Papa.unparse(data)
  downloadFile(csv, `${filename}.csv`, 'text/csv')
}

/**
 * Export teams to Excel
 */
export function exportTeamsToExcel(teams: Team[], filename = 'teams') {
  const wb = XLSX.utils.book_new()

  const data = teams.map((team) => ({
    'Team Name': team.name,
    'Description': team.description || '',
    'Member Count': team.memberCount,
    'Team Lead': team.teamLead ? `${team.teamLead.firstName} ${team.teamLead.lastName}` : 'None',
    'Parent Team': team.parentTeam?.name || 'None',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, 'Teams')

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Export teams to PDF
 */
export function exportTeamsToPDF(teams: Team[], filename = 'teams') {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Team Directory', 14, 20)

  doc.setFontSize(10)
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28)
  doc.text(`Total Teams: ${teams.length}`, 14, 34)

  const tableData = teams.map((team) => [
    team.name,
    team.description || '',
    team.memberCount.toString(),
    team.teamLead ? `${team.teamLead.firstName} ${team.teamLead.lastName}` : 'None',
    team.parentTeam?.name || 'None',
  ])

  autoTable(doc, {
    startY: 40,
    head: [['Team Name', 'Description', 'Members', 'Team Lead', 'Parent Team']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  })

  doc.save(`${filename}.pdf`)
}

/**
 * Export org chart to CSV (hierarchical format)
 */
export function exportOrgChartToCSV(nodes: OrgChartNode[], filename = 'org-chart') {
  const flattenedData: any[] = []

  function flatten(node: OrgChartNode, level = 0, managerName = '') {
    flattenedData.push({
      'Level': level,
      'Employee': `${node.firstName} ${node.lastName}`,
      'Title': node.title,
      'Department': node.department,
      'Manager': managerName || 'None',
    })

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        flatten(child, level + 1, `${node.firstName} ${node.lastName}`)
      })
    }
  }

  nodes.forEach((node) => flatten(node))

  const csv = Papa.unparse(flattenedData)
  downloadFile(csv, `${filename}.csv`, 'text/csv')
}

/**
 * Export org chart visual to PDF (screenshot)
 */
export async function exportOrgChartToPDF(elementId: string, filename = 'org-chart') {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Org chart element not found')
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (element) => {
        // Ignore elements that might cause issues
        return element.tagName === 'IFRAME'
      },
      onclone: (clonedDoc) => {
        // Replace oklch colors with rgb equivalents in the cloned document
        const style = clonedDoc.createElement('style')
        style.textContent = `
          * {
            color: rgb(15 23 42) !important;
            background-color: white !important;
            border-color: rgb(203 213 225) !important;
          }
          [class*="bg-cyan"] { background-color: rgb(6 182 212) !important; }
          [class*="bg-blue"] { background-color: rgb(59 130 246) !important; }
          [class*="bg-indigo"] { background-color: rgb(99 102 241) !important; }
          [class*="bg-slate"] { background-color: rgb(241 245 249) !important; }
          [class*="text-white"] { color: white !important; }
          [class*="text-slate"] { color: rgb(100 116 139) !important; }
          [class*="border-slate"] { border-color: rgb(226 232 240) !important; }
        `
        clonedDoc.head.appendChild(style)
      },
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    })

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Error exporting org chart to PDF:', error)
    throw error
  }
}

/**
 * Export org chart visual to PNG (screenshot)
 */
export async function exportOrgChartToPNG(elementId: string, filename = 'org-chart') {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Org chart element not found')
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (element) => {
        // Ignore elements that might cause issues
        return element.tagName === 'IFRAME'
      },
      onclone: (clonedDoc) => {
        // Replace oklch colors with rgb equivalents in the cloned document
        const style = clonedDoc.createElement('style')
        style.textContent = `
          * {
            color: rgb(15 23 42) !important;
            background-color: white !important;
            border-color: rgb(203 213 225) !important;
          }
          [class*="bg-cyan"] { background-color: rgb(6 182 212) !important; }
          [class*="bg-blue"] { background-color: rgb(59 130 246) !important; }
          [class*="bg-indigo"] { background-color: rgb(99 102 241) !important; }
          [class*="bg-slate"] { background-color: rgb(241 245 249) !important; }
          [class*="text-white"] { color: white !important; }
          [class*="text-slate"] { color: rgb(100 116 139) !important; }
          [class*="border-slate"] { border-color: rgb(226 232 240) !important; }
        `
        clonedDoc.head.appendChild(style)
      },
    })

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    })
  } catch (error) {
    console.error('Error exporting org chart to PNG:', error)
    throw error
  }
}

/**
 * Helper function to download file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
