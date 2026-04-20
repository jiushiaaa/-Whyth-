// app/tree/[id]/page.tsx
'use client'
import { useEffect } from 'react'
import { useTreeStore } from '@/lib/tree-store'
import { GrowthAnimation } from '@/components/Loading/GrowthAnimation'
import { TreeCanvas } from '@/components/Tree/TreeCanvas'
import { DetailDrawer } from '@/components/Tree/DetailDrawer'
import { SpotlightGuide } from '@/components/Onboarding/SpotlightGuide'
import { useRouter } from 'next/navigation'

export default function TreePage() {
  const { root, isLoading } = useTreeStore()
  const router = useRouter()

  useEffect(() => {
    if (!root && !isLoading) {
      router.replace('/')
    }
  }, [root, isLoading, router])

  if (isLoading || !root) {
    return <GrowthAnimation />
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <TreeCanvas />
      <DetailDrawer />
      <SpotlightGuide />
    </div>
  )
}
