'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTreeStore } from '@/lib/tree-store'
import type { SavedTree } from '@/types/tree'

export function SavedTreeList() {
  const [trees, setTrees] = useState<SavedTree[]>([])
  const { loadTree, deleteSavedTree, getSavedTrees } = useTreeStore()
  const router = useRouter()

  useEffect(() => {
    setTrees(getSavedTrees())
  }, [getSavedTrees])

  const handleLoad = (tree: SavedTree) => {
    loadTree(tree.id)
    router.push(`/tree/${tree.id}`)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteSavedTree(id)
    setTrees(getSavedTrees())
  }

  if (trees.length === 0) return null

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <motion.div
      className="w-full mt-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h3 className="text-sm font-medium mb-3 tracking-wide" style={{ color: '#6B4F2C' }}>
        我的树苗
      </h3>
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {trees.map((tree) => (
            <motion.div
              key={tree.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              onClick={() => handleLoad(tree)}
              className="group relative rounded-xl border cursor-pointer transition-all py-3 px-4"
              style={{ borderColor: 'rgba(107,79,44,0.12)', backgroundColor: 'rgba(237,230,216,0.6)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: '#1A1208' }}>
                    {tree.userInput}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#8A7A64' }}>
                    {tree.nodeCount} 个节点 · {formatTime(tree.updatedAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, tree.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-3 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{ color: '#A8956E', backgroundColor: 'rgba(107,79,44,0.08)' }}
                >
                  x
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
