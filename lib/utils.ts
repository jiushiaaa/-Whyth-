// lib/utils.ts
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10)

export function generateId(): string {
  return nanoid()
}

/**
 * 节点样式由深度（depth）决定，颜色随深度模拟树木生长：
 * depth 0 = 深棕树干（根）
 * depth 1 = 橡木金（低枝）
 * depth 2 = 森林绿（中层叶）
 * depth 3+ = 苔藓深绿（深层）
 */
export function getNodeColor(depth: number): string {
  const colors: Record<number, string> = {
    0: '#6B4F2C',  // 深棕 — 树干/根
    1: '#C8702A',  // 暖橙棕 — 低枝
    2: '#4A7C3F',  // 森林绿 — 中层叶
  }
  return colors[depth] ?? '#2D6B4F'  // 苔藓深绿 — 深层
}

export function getNodeGlow(depth: number): string {
  const glows: Record<number, string> = {
    0: 'rgba(107, 79, 44, 0.18)',
    1: 'rgba(200, 112, 42, 0.15)',
    2: 'rgba(74, 124, 63, 0.15)',
  }
  return glows[depth] ?? 'rgba(45, 107, 79, 0.15)'
}

export function getNodeRadius(depth: number): number {
  const radii: Record<number, number> = {
    0: 16,
    1: 12,
    2: 10,
  }
  return radii[depth] ?? 8
}

export function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b)
    h = (h ^ (h >>> 16)) >>> 0
    return (h & 0x7fffffff) / 0x7fffffff
  }
}

export function getBranchWidth(depth: number): number {
  const widths: Record<number, number> = { 0: 5, 1: 3.5, 2: 2.5 }
  return widths[depth] ?? 1.5
}

export function getBranchEndWidth(depth: number): number {
  const widths: Record<number, number> = { 0: 3.5, 1: 2.5, 2: 1.5 }
  return widths[depth] ?? 1
}

export function getLeafCount(depth: number): number {
  if (depth === 0) return 0
  if (depth === 1) return 3
  if (depth === 2) return 4
  return 2
}

export function getBranchGradientColors(depth: number): [string, string] {
  const map: Record<number, [string, string]> = {
    0: ['#5A3E28', '#6B4F2C'],
    1: ['#6B4F2C', '#8B6914'],
    2: ['#6B5A3C', '#4A7C3F'],
  }
  return map[depth] ?? ['#4A6B3F', '#2D6B4F']
}
