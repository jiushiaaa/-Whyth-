// app/api/expand/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { expandNode } from '@/lib/llm'

export async function POST(req: NextRequest) {
  try {
    const { nodeLabel, parentContext, rootInput, depth } = await req.json()
    if (!nodeLabel || !rootInput) {
      return NextResponse.json({ error: '参数缺失' }, { status: 400 })
    }

    const result = await expandNode(nodeLabel, parentContext ?? '', rootInput, depth ?? 1)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[expand]', err)
    return NextResponse.json({ error: '展开失败，请重试' }, { status: 500 })
  }
}
