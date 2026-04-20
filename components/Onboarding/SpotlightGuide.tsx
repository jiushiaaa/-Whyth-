// components/Onboarding/SpotlightGuide.tsx
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  {
    title: '这是你的起点',
    desc: '根节点来自你的输入，点击任意节点开始探索',
    position: 'center' as const,
  },
  {
    title: '点击节点，树会生长',
    desc: '每个节点是一个追问，点击它，系统会往更深处挖掘',
    position: 'center' as const,
  },
  {
    title: '右侧是深层分析',
    desc: '点击节点后，这里会展示洞察、原因链和下一步引导',
    position: 'right' as const,
  },
]

export function SpotlightGuide() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onboarded = localStorage.getItem('whyth_onboarded')
    if (!onboarded) {
      setTimeout(() => setVisible(true), 800)
    }
  }, [])

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      localStorage.setItem('whyth_onboarded', '1')
      setVisible(false)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('whyth_onboarded', '1')
    setVisible(false)
  }

  const current = STEPS[step]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 遮罩 */}
          <motion.div
            className="absolute inset-0 bg-black/60 pointer-events-auto"
            onClick={handleNext}
          />

          {/* 引导卡片 */}
          <motion.div
            className="relative z-10 pointer-events-auto max-w-xs w-full mx-6"
            style={{
              marginRight: current.position === 'right' ? '340px' : undefined,
              background: '#111',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
            }}
            key={step}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.3 }}
          >
            {/* 步骤进度条 */}
            <div className="flex gap-1.5 mb-4">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 rounded-full transition-all duration-300"
                  style={{ background: i <= step ? '#4DFFC3' : 'rgba(255,255,255,0.15)' }}
                />
              ))}
            </div>

            <h3 className="text-white text-base font-light mb-2">{current.title}</h3>
            <p className="text-white/50 text-sm font-light leading-relaxed mb-6">{current.desc}</p>

            <div className="flex gap-3 items-center">
              <button
                onClick={handleSkip}
                className="text-white/25 text-sm hover:text-white/45 transition-colors"
              >
                跳过
              </button>
              <motion.button
                onClick={handleNext}
                className="ml-auto px-5 py-2 rounded-xl text-sm font-light"
                style={{ background: '#4DFFC322', border: '1px solid #4DFFC344', color: '#4DFFC3' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {step < STEPS.length - 1 ? '下一步 →' : '开始探索'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
