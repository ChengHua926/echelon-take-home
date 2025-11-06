'use client'

import React, { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import OrgChartNode from './org-chart-node'
import { EmployeeNode, transformMultipleRoots, applyDagreLayout } from './utils'

interface OrgChartFlowProps {
  data: EmployeeNode[]
  onEmployeeClick: (employeeId: string) => void
}

// Define custom node types
const nodeTypes = {
  orgChartNode: OrgChartNode,
}

const OrgChartFlow: React.FC<OrgChartFlowProps> = ({ data, onEmployeeClick }) => {
  // Track which nodes are expanded
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // Initially expand all nodes
    const getAllIds = (nodes: EmployeeNode[]): string[] => {
      return nodes.flatMap((node) => [
        node.id,
        ...(node.children ? getAllIds(node.children) : []),
      ])
    }
    return new Set(getAllIds(data))
  })

  // Toggle expand/collapse for a node
  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }, [])

  // Transform data and apply layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    // Transform tree to flow format
    const { nodes, edges } = transformMultipleRoots(
      data,
      expandedNodes,
      handleToggleExpand,
      onEmployeeClick
    )

    // Apply dagre layout
    const positioned = applyDagreLayout(nodes, edges, 'TB')

    return {
      nodes: positioned,
      edges,
    }
  }, [data, expandedNodes, handleToggleExpand, onEmployeeClick])

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

  // Update nodes and edges when layout changes
  React.useEffect(() => {
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges])

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
      >
        {/* Background pattern */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="bg-slate-50"
          color="#cbd5e1"
        />

        {/* Controls (zoom, fit view) */}
        <Controls
          showInteractive={false}
          className="bg-white border border-slate-200 rounded-lg shadow-md"
        />

        {/* Minimap */}
        <MiniMap
          nodeColor={(node) => {
            // Color nodes in minimap based on gradient
            return '#0ea5e9' // cyan-500
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="bg-white border border-slate-200 rounded-lg shadow-md"
        />
      </ReactFlow>
    </div>
  )
}

export default OrgChartFlow
