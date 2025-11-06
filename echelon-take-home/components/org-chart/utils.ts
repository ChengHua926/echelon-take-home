import dagre from 'dagre'
import { Node, Edge } from '@xyflow/react'
import { OrgChartNodeData } from './org-chart-node'

export interface EmployeeNode {
  id: string
  firstName: string
  lastName: string
  title: string
  department: string
  children?: EmployeeNode[]
}

// Convert hierarchical tree data to ReactFlow nodes and edges
export function transformTreeToFlow(
  employee: EmployeeNode,
  expandedNodes: Set<string>,
  onToggleExpand: (id: string) => void,
  onClick: (id: string) => void,
  parentId?: string
): { nodes: Node<OrgChartNodeData>[]; edges: Edge[] } {
  const nodes: Node<OrgChartNodeData>[] = []
  const edges: Edge[] = []

  // Add current node
  const hasChildren = (employee.children?.length || 0) > 0
  const isExpanded = expandedNodes.has(employee.id)

  nodes.push({
    id: employee.id,
    type: 'orgChartNode',
    position: { x: 0, y: 0 }, // Will be calculated by dagre
    data: {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      title: employee.title,
      department: employee.department,
      hasChildren,
      isExpanded,
      onToggleExpand: () => onToggleExpand(employee.id),
      onClick: () => onClick(employee.id),
    },
  })

  // Add edge from parent if exists
  if (parentId) {
    edges.push({
      id: `${parentId}-${employee.id}`,
      source: parentId,
      target: employee.id,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: '#cbd5e1', // slate-300
        strokeWidth: 2,
      },
    })
  }

  // Recursively add children if expanded
  if (hasChildren && isExpanded && employee.children) {
    employee.children.forEach((child) => {
      const childResult = transformTreeToFlow(
        child,
        expandedNodes,
        onToggleExpand,
        onClick,
        employee.id
      )
      nodes.push(...childResult.nodes)
      edges.push(...childResult.edges)
    })
  }

  return { nodes, edges }
}

// Apply dagre layout to nodes
export function applyDagreLayout(
  nodes: Node<OrgChartNodeData>[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): Node<OrgChartNodeData>[] {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  // Configure the graph
  const nodeWidth = 220
  const nodeHeight = 180
  const rankSep = 150 // Vertical spacing
  const nodeSep = 80 // Horizontal spacing

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: rankSep,
    nodesep: nodeSep,
  })

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // Calculate layout
  dagre.layout(dagreGraph)

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)

    // Center the node based on its dimensions
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return layoutedNodes
}

// Transform multiple root employees (if CEO is not unique)
export function transformMultipleRoots(
  employees: EmployeeNode[],
  expandedNodes: Set<string>,
  onToggleExpand: (id: string) => void,
  onClick: (id: string) => void
): { nodes: Node<OrgChartNodeData>[]; edges: Edge[] } {
  if (employees.length === 0) {
    return { nodes: [], edges: [] }
  }

  // If single root, return normally
  if (employees.length === 1) {
    return transformTreeToFlow(
      employees[0],
      expandedNodes,
      onToggleExpand,
      onClick
    )
  }

  // Multiple roots: create a virtual root node
  const virtualRoot: EmployeeNode = {
    id: 'virtual-root',
    firstName: 'Organization',
    lastName: '',
    title: 'Organization Structure',
    department: 'All Departments',
    children: employees,
  }

  return transformTreeToFlow(
    virtualRoot,
    new Set([...expandedNodes, 'virtual-root']), // Always expand virtual root
    onToggleExpand,
    onClick
  )
}
