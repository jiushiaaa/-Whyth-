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
