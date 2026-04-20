// app/api/expand/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { expandNode } from '@/lib/llm'

export async function POST(req: NextRequest) {
  try {
    const { nodeLabel, parentContext, rootInput, depth } = await req.json()
    if (!nodeLabel || typeof nodeLabel !== 'string') {
      return NextResponse.json({ error: '参数缺失：nodeLabel' }, { status: 400 })
    }
    if (!rootInput || typeof rootInput !== 'string') {
      return NextResponse.json({ error: '参数缺失：rootInput' }, { status: 400 })
    }
    const safeDepth = typeof depth === 'number' && depth >= 1 ? Math.min(depth, 20) : 1
    const safeParentContext = typeof parentContext === 'string' ? parentContext : ''

    const result = await expandNode(nodeLabel, safeParentContext, rootInput, safeDepth)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[expand]', err)
    return NextResponse.json({ error: '展开失败，请重试' }, { status: 500 })
  }
}
