// components/Loading/GrowthAnimation.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const MESSAGES = [
  '正在解析你的困惑…',
  '生长中…',
  '你的问题树正在成形…',
]

export function GrowthAnimation() {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length)
    }, 1400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-end pb-32 overflow-hidden">
      {/* 生长 SVG */}
      <svg
        width="160"
        height="320"
        viewBox="0 0 160 320"
        fill="none"
        className="mb-8"
        style={{ overflow: 'visible' }}
      >
        {/* 主干 */}
        <motion.path
          d="M80 320 C80 280 80 240 80 200 C80 160 70 140 60 120"
          stroke="#6B4F2C"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0.6 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        {/* 左枝 */}
        <motion.path
          d="M60 120 C50 100 30 90 10 80"
          stroke="#C8702A"
          strokeWidth="1.2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.0, ease: 'easeOut' }}
        />
        {/* 右枝 */}
        <motion.path
          d="M60 120 C70 100 100 90 130 85"
          stroke="#4A7C3F"
          strokeWidth="1.2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.1, ease: 'easeOut' }}
        />
        {/* 中枝 */}
        <motion.path
          d="M60 120 C65 95 72 80 75 60"
          stroke="#2D6B4F"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, delay: 1.2, ease: 'easeOut' }}
        />
        {/* 枝端节点 */}
        {[
          { cx: 10, cy: 80, color: '#C8702A', delay: 1.8 },
          { cx: 130, cy: 85, color: '#4A7C3F', delay: 1.9 },
          { cx: 75, cy: 60, color: '#2D6B4F', delay: 2.0 },
        ].map((node, i) => (
          <motion.circle
            key={i}
            cx={node.cx}
            cy={node.cy}
            r={5}
            fill={node.color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: 1 }}
            transition={{ duration: 0.5, delay: node.delay }}
          />
        ))}
        {/* 底部种子 */}
        <motion.circle
          cx={80}
          cy={320}
          r={6}
          fill="#6B4F2C"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>

      {/* 文字 */}
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIdx}
          className="text-sm font-light tracking-widest"
          style={{ color: '#6B4F2C' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
        >
          {MESSAGES[msgIdx]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
