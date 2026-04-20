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
            className="absolute right-0 top-0 h-full w-80 flex flex-col border-l border-white/[0.06] overflow-y-auto"
            style={{ background: '#0E0E0E' }}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            {/* 顶部节点标签 */}
            <div className="px-6 pt-8 pb-4 border-b border-white/[0.06]">
              <div
                className="text-xs mb-2 font-light tracking-widest uppercase"
                style={{ color: getNodeColor(selectedNode.depth) + 'AA' }}
              >
                {selectedNode.depth === 0 ? '起点' : `第 ${selectedNode.depth} 层追问`}
              </div>
              <h2
                className="text-base font-light leading-relaxed"
                style={{ color: getNodeColor(selectedNode.depth) }}
              >
                {selectedNode.label}
              </h2>
            </div>

            {/* 洞察 */}
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <div className="text-white/30 text-xs mb-2 uppercase tracking-widest">这个问题在说什么</div>
              <p className="text-white/70 text-sm font-light leading-relaxed">
                {selectedNode.insight}
              </p>
            </div>

            {/* 可能原因 */}
            {selectedNode.causes.length > 0 && (
              <div className="px-6 py-5 border-b border-white/[0.06]">
                <div className="text-white/30 text-xs mb-3 uppercase tracking-widest">可能的深层原因</div>
                <ul className="space-y-2">
                  {selectedNode.causes.map((cause, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/60 font-light">
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
                <div className="text-white/30 text-xs mb-2 uppercase tracking-widest">值得追问的下一步</div>
                <p className="text-white/50 text-sm font-light leading-relaxed mb-4">
                  {selectedNode.nextStep}
                </p>
                {selectedNode.status === 'unexplored' && (
                  <motion.button
                    className="w-full py-2.5 rounded-xl text-sm font-light tracking-wider"
                    style={{
                      background: `linear-gradient(135deg, ${getNodeColor(selectedNode.depth)}22, ${getNodeColor(selectedNode.depth)}11)`,
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
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/[0.05] transition-all text-sm"
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
