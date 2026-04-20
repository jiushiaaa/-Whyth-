// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'] })

export const metadata: Metadata = {
  title: 'Whyth — 你有答案，但你找到问题了吗？',
  description: '反向思维树引擎，从结论逆向追问真正的问题',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className={`${inter.className} bg-[#080808] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
