// components/Landing/BlurText.tsx
// Adapted from ReactBits (https://www.reactbits.dev/text-animations/blur-text)
// License: MIT
'use client'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface BlurTextProps {
  text: string
  className?: string
  /** delay between each word in ms, default 80 */
  delay?: number
  /** initial y offset (px), default -20 */
  offsetY?: number
}

export function BlurText({ text, className = '', delay = 80, offsetY = -20 }: BlurTextProps) {
  const words = useMemo(() => text.split(' '), [text])

  return (
    <span className={`inline-flex flex-wrap justify-center gap-x-[0.25em] ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ filter: 'blur(8px)', opacity: 0, y: offsetY }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: i * (delay / 1000),
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}
