'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useTreeStore } from '@/lib/tree-store'
import { TreeNode } from '@/types/tree'
import { getNodeColor } from '@/lib/utils'

function findNodeById(root: TreeNode, id: string): TreeNode | null {
  if (root.id === id) return root
  for (const child of root.children) {
    const found = findNodeById(child, id)
    if (found) return found
  }
  return null
}

export function DetailDrawer() {
  const { root, selectedNodeId, selectNode, isDrawerOpen } = useTreeStore()

  const selectedNode = root && selectedNodeId
    ? findNodeById(root, selectedNodeId)
    : null

  return (
    <AnimatePresence>
      {isDrawerOpen && selectedNode && (
        <>
          {/* 半透明遮罩（移动端点击关闭） */}
          <motion.div
            className="absolute inset-0 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => selectNode(null)}
          />

          {/* 抽屉主体 */}
          <motion.aside
            className="absolute right-0 top-0 h-full w-80 flex flex-col overflow-y-auto"
            style={{
              background: '#EDE6D8',
              borderLeft: '1px solid rgba(107,79,44,0.12)',
            }}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            {/* 顶部节点标签 */}
            <div className="px-6 pt-8 pb-4" style={{ borderBottom: '1px solid rgba(107,79,44,0.10)' }}>
              <div
                className="text-xs mb-2 font-medium tracking-widest uppercase"
                style={{ color: getNodeColor(selectedNode.depth) }}
              >
                {selectedNode.depth === 0 ? '起点' : `第 ${selectedNode.depth} 层追问`}
              </div>
              <h2
                className="text-base font-medium leading-relaxed"
                style={{ color: '#1A1208' }}
              >
                {selectedNode.label}
              </h2>
            </div>

            {/* 洞察 */}
            <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(107,79,44,0.10)' }}>
              <div className="text-xs mb-2 uppercase tracking-widest font-medium" style={{ color: '#6B4F2C' }}>这个问题在说什么</div>
              <p className="text-sm leading-relaxed" style={{ color: '#2C2416' }}>
                {selectedNode.insight}
              </p>
            </div>

            {/* 可能原因 */}
            {selectedNode.causes.length > 0 && (
              <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(107,79,44,0.10)' }}>
                <div className="text-xs mb-3 uppercase tracking-widest font-medium" style={{ color: '#6B4F2C' }}>可能的深层原因</div>
                <ul className="space-y-2">
                  {selectedNode.causes.map((cause, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#2C2416' }}>
                      <span
                        className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: getNodeColor(selectedNode.depth) }}
                      />
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 下一步引导 */}
            {selectedNode.nextStep && (
              <div className="px-6 py-5 mt-auto">
                <div className="text-xs mb-2 uppercase tracking-widest font-medium" style={{ color: '#6B4F2C' }}>值得追问的下一步</div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#4A3728' }}>
                  {selectedNode.nextStep}
                </p>
                {selectedNode.status === 'unexplored' && (
                  <motion.button
                    className="w-full py-2.5 rounded-xl text-sm font-light tracking-wider"
                    style={{
                      background: `${getNodeColor(selectedNode.depth)}18`,
                      border: `1px solid ${getNodeColor(selectedNode.depth)}44`,
                      color: getNodeColor(selectedNode.depth),
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const store = useTreeStore.getState()
                      store.selectNode(selectedNode.id)
                    }}
                  >
                    继续探索 →
                  </motion.button>
                )}
              </div>
            )}

            {/* 关闭按钮 */}
            <button
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all"
              style={{ color: '#C4B89A', background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#6B4F2C'
                e.currentTarget.style.background = 'rgba(107,79,44,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#C4B89A'
                e.currentTarget.style.background = 'transparent'
              }}
              onClick={() => selectNode(null)}
            >
              ✕
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
