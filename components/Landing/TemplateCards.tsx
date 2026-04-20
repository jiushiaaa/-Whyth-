// components/Landing/TemplateCards.tsx
'use client'
import { motion } from 'framer-motion'

const TEMPLATES = [
  { text: '我最近感觉很空', type: '情绪探索', color: '#C8702A' },
  { text: '我总是在最后一刻放弃', type: '决策分析', color: '#4A7C3F' },
  { text: '为什么越努力越焦虑', type: '知识拆解', color: '#2D6B4F' },
]

interface TemplateCardsProps {
  onSelect: (text: string) => void
}

export function TemplateCards({ onSelect }: TemplateCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mt-6 w-full">
      {TEMPLATES.map((t, i) => (
        <motion.button
          key={t.type}
          onClick={() => onSelect(t.text)}
          className="rounded-xl border cursor-pointer transition-all text-center py-3 px-2"
          style={{
            borderColor: 'rgba(107,79,44,0.18)',
            backgroundColor: 'rgba(237,230,216,0.7)',
          }}
          whileHover={{ borderColor: t.color + '66', backgroundColor: t.color + '14', scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 + 0.3 }}
        >
          <div
            className="text-xs mb-1.5 font-semibold tracking-wide"
            style={{ color: t.color }}
          >
            {t.type}
          </div>
          <div
            className="text-xs leading-snug"
            style={{ color: '#2C2416', fontWeight: 500 }}
          >
            {t.text}
          </div>
        </motion.button>
      ))}
    </div>
  )
}
