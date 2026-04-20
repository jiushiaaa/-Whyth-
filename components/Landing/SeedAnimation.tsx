// components/Landing/SeedAnimation.tsx
'use client'
import { motion } from 'framer-motion'

export function SeedAnimation() {
  return (
    <div className="flex items-center justify-center w-24 h-24 mb-10">
      <motion.div
        className="relative flex items-center justify-center"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* 外层光晕 */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 64, height: 64, background: 'radial-gradient(circle, rgba(107,79,44,0.12) 0%, transparent 70%)' }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* 种子 SVG */}
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
          <motion.path
            d="M16 38 C16 38 4 28 4 16 C4 9 9.4 4 16 4 C22.6 4 28 9 28 16 C28 28 16 38 16 38Z"
            stroke="#6B4F2C"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          <motion.line
            x1="16" y1="38" x2="16" y2="2"
            stroke="#8B6914"
            strokeWidth="1"
            strokeDasharray="2 3"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>
      </motion.div>
    </div>
  )
}
