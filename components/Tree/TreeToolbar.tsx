'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTreeStore } from '@/lib/tree-store'

interface TreeToolbarProps {
  onResetZoom?: () => void
}

export function TreeToolbar({ onResetZoom }: TreeToolbarProps) {
  const { userInput, saveTree, treeId, getSavedTrees } = useTreeStore()
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const isSaved = (() => {
    const saved = getSavedTrees()
    return saved.some((t) => t.id === treeId)
  })()

  const handleBack = () => {
    if (isSaved) {
      router.push('/')
    } else {
      setShowConfirm(true)
    }
  }

  const handleSave = () => {
    saveTree()
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleLeaveWithoutSave = () => {
    setShowConfirm(false)
    router.push('/')
  }

  const handleSaveAndLeave = () => {
    saveTree()
    setShowConfirm(false)
    router.push('/')
  }

  const truncated = userInput.length > 24 ? userInput.slice(0, 24) + '...' : userInput

  return (
    <>
      <motion.div
        className="absolute top-4 left-4 right-4 z-20 flex items-center gap-3 rounded-xl px-4 py-2"
        style={{
          background: 'rgba(237,230,216,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(107,79,44,0.12)',
        }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button onClick={handleBack} className="text-sm transition-colors shrink-0" style={{ color: '#6B4F2C' }}>
          ← 返回
        </button>
        <div className="flex-1 text-center text-sm truncate" style={{ color: '#4A3728' }}>
          {truncated}
        </div>
        <button onClick={handleSave} className="text-sm transition-colors shrink-0" style={{ color: '#6B4F2C' }} title="保存树苗">
          保存
        </button>
        {onResetZoom && (
          <button onClick={onResetZoom} className="text-sm transition-colors shrink-0" style={{ color: '#6B4F2C' }} title="重置视角">
            重置
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div className="absolute inset-0 z-30 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(44,36,22,0.35)' }} onClick={() => setShowConfirm(false)} />
            <motion.div className="relative z-10 rounded-2xl p-6 max-w-xs w-full mx-6"
              style={{ background: '#EDE6D8', border: '1px solid rgba(107,79,44,0.18)' }}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className="text-sm font-medium mb-2" style={{ color: '#1A1208' }}>离开将丢失当前探索</h3>
              <p className="text-xs mb-4" style={{ color: '#6B4F2C' }}>是否保存这棵树苗？</p>
              <div className="flex gap-2">
                <button onClick={handleLeaveWithoutSave} className="flex-1 py-2 rounded-lg text-xs"
                  style={{ color: '#8A7A64', border: '1px solid rgba(107,79,44,0.15)' }}>不保存</button>
                <button onClick={handleSaveAndLeave} className="flex-1 py-2 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(200,112,42,0.15)', color: '#C8702A', border: '1px solid rgba(200,112,42,0.3)' }}>保存并离开</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl text-xs"
            style={{ background: 'rgba(74,124,63,0.15)', color: '#4A7C3F', border: '1px solid rgba(74,124,63,0.25)' }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            已保存
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
