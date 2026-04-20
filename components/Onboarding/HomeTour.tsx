'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { target: 'input', title: '欢迎来到 Whyth', desc: '在这里输入感受、困惑或结论，开始反向追问' },
  { target: 'title', title: '核心理念', desc: '你有答案，但你找到问题了吗？' },
  { target: 'templates', title: '没有灵感？', desc: '选一个模板快速开始体验' },
  { target: 'help', title: '随时重看引导', desc: '点这里可以再次查看引导' },
]

const STORAGE_KEY = 'whyth_home_onboarded'

let triggerTour: (() => void) | null = null

export function requestHomeTour() {
  if (triggerTour) triggerTour()
}

export function HomeTour() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const updateRect = useCallback(() => {
    const el = document.querySelector(`[data-tour="${STEPS[step]?.target}"]`)
    if (el) setRect(el.getBoundingClientRect())
  }, [step])

  useEffect(() => {
    triggerTour = () => { setStep(0); setVisible(true) }
    return () => { triggerTour = null }
  }, [])

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible) return
    updateRect()
    window.addEventListener('resize', updateRect)
    return () => window.removeEventListener('resize', updateRect)
  }, [visible, step, updateRect])

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else finish()
  }

  if (!visible || !rect) return null

  const pad = 8
  const cardW = 280
  const cardH = 160
  const spaceBelow = window.innerHeight - rect.bottom - pad
  const placeAbove = spaceBelow < cardH + 24
  const cardTop = placeAbove ? rect.top - pad - cardH - 12 : rect.bottom + pad + 12
  const cardRight = window.innerWidth - rect.right
  const nearRight = cardRight < cardW
  const cardLeft = nearRight ? window.innerWidth - cardW - 40 : Math.max(16, rect.left)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <svg className="absolute inset-0 w-full h-full" onClick={handleNext}>
            <defs>
              <mask id="tour-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={rect.left - pad}
                  y={rect.top - pad}
                  width={rect.width + pad * 2}
                  height={rect.height + pad * 2}
                  rx="12"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%" height="100%"
              fill="rgba(44,36,22,0.35)"
              mask="url(#tour-mask)"
            />
          </svg>

          <motion.div
            key={step}
            className="fixed z-10 max-w-xs w-full"
            style={{
              top: cardTop,
              left: cardLeft,
              background: '#EDE6D8',
              border: '1px solid rgba(107,79,44,0.18)',
              borderRadius: '16px',
              padding: '20px',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="flex gap-1.5 mb-3">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 rounded-full transition-all duration-300"
                  style={{ background: i <= step ? '#C8702A' : 'rgba(107,79,44,0.18)' }}
                />
              ))}
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: '#2C2416' }}>
              {STEPS[step].title}
            </h3>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#4A3728' }}>
              {STEPS[step].desc}
            </p>
            <div className="flex gap-3 items-center">
              <button onClick={finish} className="text-xs transition-colors" style={{ color: '#C4B89A' }}>
                跳过
              </button>
              <motion.button
                onClick={handleNext}
                className="ml-auto px-4 py-1.5 rounded-lg text-xs"
                style={{
                  background: 'rgba(200,112,42,0.12)',
                  border: '1px solid rgba(200,112,42,0.35)',
                  color: '#C8702A',
                }}
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
