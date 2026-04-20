// components/Landing/InputBox.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTreeStore } from '@/lib/tree-store'
import { useRouter } from 'next/navigation'
import { generateId } from '@/lib/utils'

const PLACEHOLDERS = [
  '我总是选错人…',
  '我发现我越来越沉默…',
  '为什么努力没有回报…',
  '我知道答案，但不知道问题…',
]

interface InputBoxProps {
  initialValue?: string
}

export function InputBox({ initialValue = '' }: InputBoxProps) {
  const [value, setValue] = useState(initialValue)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { initTree, setLoading } = useTreeStore()
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialValue) setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async () => {
    if (!value.trim() || isSubmitting) return
    setError('')
    setIsSubmitting(true)
    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: value.trim() }),
      })
      if (!res.ok) throw new Error('生成失败')
      const data = await res.json()
      initTree(data.rootLabel, data.rootType, data.nodes, value.trim())
      const treeId = generateId()
      router.push(`/tree/${treeId}`)
    } catch {
      setError('生成失败，请检查网络或 API Key 后重试')
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-xl">
      <div className="relative">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.div
              key={placeholderIdx}
              className="absolute left-4 top-4 text-white/30 font-light pointer-events-none text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {PLACEHOLDERS[placeholderIdx]}
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-4 text-white font-light text-sm resize-none outline-none transition-all focus:border-white/30 focus:bg-white/[0.06] placeholder-transparent"
          style={{ caretColor: '#4DFFC3' }}
        />
      </div>

      {error && (
        <p className="text-red-400/80 text-xs mt-2 text-center">{error}</p>
      )}

      <motion.button
        onClick={handleSubmit}
        disabled={!value.trim() || isSubmitting}
        className="mt-4 w-full py-3 rounded-xl text-sm font-light tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #4DFFC3 0%, #7B61FF 100%)', color: '#080808' }}
        whileHover={value.trim() && !isSubmitting ? { scale: 1.01, opacity: 0.9 } : {}}
        whileTap={value.trim() && !isSubmitting ? { scale: 0.98 } : {}}
      >
        {isSubmitting ? '生长中…' : '让它生长'}
      </motion.button>
    </div>
  )
}
