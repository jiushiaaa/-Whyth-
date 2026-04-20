'use client'
import dynamic from 'next/dynamic'

const Grainient = dynamic(() => import('./Grainient'), { ssr: false })

interface GrainientBgProps {
  variant?: 'default' | 'subtle'
}

export function GrainientBg({ variant = 'default' }: GrainientBgProps) {
  const isSubtle = variant === 'subtle'
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Grainient
        color1="#E8D5B7"
        color2="#C8702A"
        color3="#F2EDE4"
        timeSpeed={0.15}
        contrast={isSubtle ? 0.9 : 1.1}
        saturation={isSubtle ? 0.4 : 0.7}
        grainAmount={0.08}
        warpStrength={0.5}
        rotationAmount={200}
        zoom={1.2}
        warpFrequency={5.0}
        warpSpeed={2.0}
        warpAmplitude={50.0}
        blendAngle={0.0}
        blendSoftness={0.05}
        noiseScale={2.0}
        grainScale={2.0}
        grainAnimated={false}
        gamma={1.0}
        colorBalance={0.0}
        centerX={0.0}
        centerY={0.0}
      />
    </div>
  )
}
