// app/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TemplateCards } from '@/components/Landing/TemplateCards'
import { InputBox } from '@/components/Landing/InputBox'
import { BlurText } from '@/components/Landing/BlurText'

export default function LandingPage() {
  const [inputValue, setInputValue] = useState('')
  const router = useRouter()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        className="flex flex-col items-center w-full max-w-lg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Logo */}
        <WhythLogo />

        {/* 标题 */}
        <h1 className="text-center mb-1 mt-8">
          <BlurText
            text="你有答案"
            className="text-4xl text-[#1A1208] leading-normal"
            delay={100}
            offsetY={-16}
          />
        </h1>
        <h2 className="text-center mb-4">
          <BlurText
            text="但你找到问题了吗？"
            className="text-2xl text-[#4A3728] leading-normal"
            delay={80}
            offsetY={12}
          />
        </h2>

        <motion.p
          className="text-sm text-center mb-10 font-normal tracking-wide"
          style={{ color: '#6B4F2C' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          输入你的感受、困惑或结论，让 Whyth 帮你逆向追问
        </motion.p>

        <InputBox initialValue={inputValue} />
        <TemplateCards onSelect={setInputValue} />
      </motion.div>

      {/* 右下角帮助按钮 */}
      <motion.button
        className="fixed bottom-6 right-6 w-8 h-8 rounded-full border border-[#C4B89A] bg-[#EDE6D8] text-sm flex items-center justify-center transition-all"
        style={{ color: '#6B4F2C' }}
        title="新手引导"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6B4F2C' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#C4B89A' }}
        onClick={() => {
          localStorage.removeItem('whyth_onboarded')
          router.push('/tree/demo')
        }}
      >
        ?
      </motion.button>
    </main>
  )
}

/* ── Whyth Logo 组件 ─────────────────────────────────────── */
function WhythLogo() {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {/* SVG 图标：一棵从种子向上生长的抽象树 */}
      <svg width="48" height="52" viewBox="0 0 48 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 主干 */}
        <line x1="24" y1="50" x2="24" y2="28" stroke="#6B4F2C" strokeWidth="2" strokeLinecap="round"/>
        {/* 左大枝 */}
        <path d="M24 36 Q16 30 10 24" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        {/* 右大枝 */}
        <path d="M24 36 Q32 30 38 24" stroke="#C8702A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        {/* 中枝 */}
        <path d="M24 30 Q22 22 24 16" stroke="#4A7C3F" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        {/* 左小枝 */}
        <path d="M10 24 Q7 18 8 14" stroke="#8B6914" strokeWidth="1" strokeLinecap="round" fill="none"/>
        {/* 右小枝 */}
        <path d="M38 24 Q41 18 40 14" stroke="#C8702A" strokeWidth="1" strokeLinecap="round" fill="none"/>
        {/* 叶节点 */}
        <circle cx="8"  cy="13" r="2.5" fill="#8B6914"/>
        <circle cx="40" cy="13" r="2.5" fill="#C8702A"/>
        <circle cx="24" cy="15" r="2.5" fill="#4A7C3F"/>
        <circle cx="10" cy="23" r="2"   fill="#8B6914" opacity="0.6"/>
        <circle cx="38" cy="23" r="2"   fill="#C8702A" opacity="0.6"/>
        {/* 种子（根） */}
        <circle cx="24" cy="50" r="3.5" fill="#6B4F2C"/>
        <circle cx="24" cy="50" r="5.5" fill="none" stroke="#6B4F2C" strokeWidth="1" opacity="0.3"/>
      </svg>

      {/* 品牌名 */}
      <div className="flex items-baseline gap-0.5">
        <span
          className="text-xl tracking-widest"
          style={{ color: '#1A1208', fontWeight: 700, letterSpacing: '0.15em' }}
        >
          Whyth
        </span>
      </div>
    </motion.div>
  )
}
