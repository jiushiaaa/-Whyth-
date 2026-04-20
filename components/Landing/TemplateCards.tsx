// components/Landing/TemplateCards.tsx
'use client'
import { motion } from 'framer-motion'

const TEMPLATES = [
  { text: '我最近感觉很空', type: '情绪探索', color: '#F5C842' },
  { text: '我总是在最后一刻放弃', type: '决策分析', color: '#4DFFC3' },
  { text: '为什么越努力越焦虑', type: '知识拆解', color: '#7B61FF' },
]

interface TemplateCardsProps {
  onSelect: (text: string) => void
}

export function TemplateCards({ onSelect }: TemplateCardsProps) {
  return (
    <div className="flex gap-3 mt-8 flex-wrap justify-center">
      {TEMPLATES.map((t, i) => (
        <motion.button
          key={t.type}
          onClick={() => onSelect(t.text)}
          className="px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-left cursor-pointer transition-all"
          style={{ minWidth: 160 }}
          whileHover={{ borderColor: t.color + '66', backgroundColor: t.color + '0D', scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 + 0.3 }}
        >
          <div className="text-xs mb-1" style={{ color: t.color + 'CC' }}>{t.type}</div>
          <div className="text-sm text-white/80 font-light">{t.text}</div>
        </motion.button>
      ))}
    </div>
  )
}
