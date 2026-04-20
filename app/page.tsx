// app/page.tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { SeedAnimation } from '@/components/Landing/SeedAnimation'
import { TemplateCards } from '@/components/Landing/TemplateCards'
import { InputBox } from '@/components/Landing/InputBox'

export default function LandingPage() {
  const [inputValue, setInputValue] = useState('')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        className="flex flex-col items-center w-full max-w-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <SeedAnimation />

        <motion.h1
          className="text-2xl font-light text-white text-center leading-snug mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          你有答案
          <br />
          <span className="text-white/40">但你找到问题了吗？</span>
        </motion.h1>

        <motion.p
          className="text-white/30 text-xs text-center mb-10 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          输入你的感受、困惑或结论，让 Whyth 帮你逆向追问
        </motion.p>

        <InputBox initialValue={inputValue} />
        <TemplateCards onSelect={setInputValue} />
      </motion.div>

      {/* 右下角引导入口 */}
      <motion.button
        className="fixed bottom-6 right-6 w-9 h-9 rounded-full border border-white/10 bg-white/[0.04] text-white/40 text-sm flex items-center justify-center hover:border-white/25 hover:text-white/60 transition-all"
        title="新手引导"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('whyth_onboarded')
            window.location.href = '/tree/demo'
          }
        }}
      >
        ?
      </motion.button>
    </main>
  )
}
