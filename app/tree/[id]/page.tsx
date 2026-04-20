// app/tree/[id]/page.tsx
'use client'
import { useEffect } from 'react'
import { useTreeStore } from '@/lib/tree-store'
import { GrowthAnimation } from '@/components/Loading/GrowthAnimation'
import { useRouter } from 'next/navigation'

export default function TreePage() {
  const { root, isLoading } = useTreeStore()
  const router = useRouter()

  useEffect(() => {
    // 如果没有树数据且没在加载，回到首页
    if (!root && !isLoading) {
      router.replace('/')
    }
  }, [root, isLoading, router])

  if (isLoading || !root) {
    return <GrowthAnimation />
  }

  // TreeCanvas、DetailDrawer、SpotlightGuide 将在 Task 6-8 完成后集成
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080808] flex items-center justify-center">
      <p className="text-white/30 text-sm font-light">树形视图开发中…</p>
    </div>
  )
}
