'use client'
import { motion } from 'framer-motion'
import BorderGlow from './BorderGlow'

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
    <div data-tour="templates" className="grid grid-cols-3 gap-3 mt-6 w-full">
      {TEMPLATES.map((t, i) => (
        <motion.div
          key={t.type}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 + 0.3 }}
        >
          <BorderGlow
            glowColor="30 70 65"
            colors={['#C8702A', '#E8D5B7', '#4A7C3F']}
            backgroundColor="#EDE6D8"
            borderRadius={16}
            glowRadius={30}
            glowIntensity={0.8}
            coneSpread={20}
            edgeSensitivity={25}
            animated={true}
          >
            <button
              onClick={() => onSelect(t.text)}
              className="w-full cursor-pointer text-center py-3 px-2"
            >
              <div className="text-xs mb-1.5 font-semibold tracking-wide" style={{ color: t.color }}>
                {t.type}
              </div>
              <div className="text-xs leading-snug" style={{ color: '#2C2416', fontWeight: 500 }}>
                {t.text}
              </div>
            </button>
          </BorderGlow>
        </motion.div>
      ))}
    </div>
  )
}
