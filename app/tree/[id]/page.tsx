'use client'
import { useEffect, useCallback, useState } from 'react'
import { useTreeStore } from '@/lib/tree-store'
import { GrowthAnimation } from '@/components/Loading/GrowthAnimation'
import { TreeCanvas } from '@/components/Tree/TreeCanvas'
import { DetailDrawer } from '@/components/Tree/DetailDrawer'
import { SpotlightGuide } from '@/components/Onboarding/SpotlightGuide'
import { TreeToolbar } from '@/components/Tree/TreeToolbar'
import { useRouter } from 'next/navigation'

export default function TreePage() {
  const { root, isLoading } = useTreeStore()
  const router = useRouter()
  const [resetZoomFn, setResetZoomFn] = useState<(() => void) | null>(null)

  useEffect(() => {
    if (!root && !isLoading) {
      router.replace('/')
    }
  }, [root, isLoading, router])

  const handleResetZoomReady = useCallback((fn: () => void) => {
    setResetZoomFn(() => fn)
  }, [])

  if (isLoading || !root) {
    return <GrowthAnimation />
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <TreeCanvas onResetZoomReady={handleResetZoomReady} />
      <TreeToolbar onResetZoom={resetZoomFn ?? undefined} />
      <DetailDrawer />
      <SpotlightGuide />
    </div>
  )
}
