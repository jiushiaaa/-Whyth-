// lib/utils.ts
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10)

export function generateId(): string {
  return nanoid()
}

export function getNodeColor(depth: number): string {
  const colors: Record<number, string> = {
    0: '#FFFFFF',
    1: '#F5C842',
    2: '#4DFFC3',
  }
  return colors[depth] ?? '#7B61FF'
}

export function getNodeGlow(depth: number): string {
  const glows: Record<number, string> = {
    0: 'rgba(255,255,255,0.3)',
    1: 'rgba(245,200,66,0.25)',
    2: 'rgba(77,255,195,0.2)',
  }
  return glows[depth] ?? 'rgba(123,97,255,0.2)'
}

export function getNodeRadius(depth: number): number {
  const radii: Record<number, number> = {
    0: 16,
    1: 12,
    2: 10,
  }
  return radii[depth] ?? 8
}
