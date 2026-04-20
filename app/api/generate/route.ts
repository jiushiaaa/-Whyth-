// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateTree } from '@/lib/llm'

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json()
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json({ error: '请输入内容' }, { status: 400 })
    }

    const result = await generateTree(input.trim())
    return NextResponse.json(result)
  } catch (err) {
    console.error('[generate]', err)
    return NextResponse.json({ error: '生成失败，请重试' }, { status: 500 })
  }
}
