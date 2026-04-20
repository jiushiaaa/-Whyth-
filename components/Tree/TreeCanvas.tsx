// components/Tree/TreeCanvas.tsx
'use client'
import { useCallback } from 'react'
import { useTreeStore } from '@/lib/tree-store'
import { useTreeD3 } from './useTreeD3'
import { TreeNode } from '@/types/tree'
import { motion } from 'framer-motion'

function findParent(root: TreeNode, targetId: string): TreeNode | null {
  for (const child of root.children) {
    if (child.id === targetId) return root
    const found = findParent(child, targetId)
    if (found) return found
  }
  return null
}

export function TreeCanvas() {
  const { root, selectedNodeId, selectNode, expandNode, userInput, isLoading, setLoading } = useTreeStore()

  const handleNodeClick = useCallback(async (node: TreeNode) => {
    selectNode(node.id)

    if (node.status === 'unexplored') {
      useTreeStore.getState().setNodeStatus(node.id, 'selected')
      setLoading(true)

      try {
        const parent = root ? findParent(root, node.id) : null
        const res = await fetch('/api/expand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodeLabel: node.label,
            parentContext: parent?.label ?? '',
            rootInput: userInput,
            depth: node.depth,
          }),
        })
        if (!res.ok) throw new Error('展开失败')
        const data = await res.json()
        expandNode(node.id, data.nodes)
      } catch {
        useTreeStore.getState().setNodeStatus(node.id, 'unexplored')
      } finally {
        setLoading(false)
      }
    }
  }, [root, selectNode, expandNode, userInput, setLoading])

  const { svgRef } = useTreeD3({
    root: root!,
    selectedNodeId,
    onNodeClick: handleNodeClick,
  })

  return (
    <motion.div
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      />
      {isLoading && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-xs font-light tracking-widest">
          生长中…
        </div>
      )}
    </motion.div>
  )
}
