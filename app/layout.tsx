import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { GrainientBg } from '@/components/Background/GrainientBg'

export const metadata: Metadata = {
  title: 'Whyth — 你有答案，但你找到问题了吗？',
  description: '反向思维树引擎，从结论逆向追问真正的问题',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh">
      <body className="text-[#1A1208] min-h-screen">
        <GrainientBg />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}
