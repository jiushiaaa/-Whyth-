// lib/llm.ts
import OpenAI from 'openai'
import { buildGeneratePrompt, buildExpandPrompt } from './prompts'
import { GenerateResponse, ExpandResponse } from '@/types/tree'

// 支持 OpenAI 兼容格式（如 MiniMax）
// 通过环境变量 OPENAI_BASE_URL 切换 API 地址
// MiniMax: OPENAI_BASE_URL=https://api.minimaxi.com/v1
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL, // 未设置时使用 OpenAI 默认地址
})

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o'

/**
 * 从 LLM 原始输出中提取干净的 JSON 字符串。
 *
 * 兼容两类模型的输出格式：
 *
 * 普通模型（gpt-4o 等）：直接输出 JSON，response_format json_object 生效，无需处理。
 *
 * 思考模型（MiniMax M2.x、DeepSeek-R1 等）：会忽略 json_object 参数，输出：
 *   - <think>...</think> 包裹的思维链（可能在 JSON 前后都有）
 *   - JSON 正文被包裹在 ```json ... ``` 或 ``` ... ``` markdown 代码块中
 *   - 极少数情况直接输出裸 JSON（无代码块）
 *
 * 提取策略（按优先级）：
 *   1. 剥离所有 <think>...</think> 块
 *   2. 若存在 markdown 代码块，取最后一个代码块内容（思维链后的才是答案）
 *   3. 若无代码块，找第一个 { 到最后一个 } 之间的内容（容错裸 JSON）
 */
function extractJSON(raw: string): string {
  // 1. 剥离所有 <think> 思维链标签
  let text = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

  // 2. 提取 markdown 代码块（取最后一个，因为思考模型常把答案放在思维后）
  const fences = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/g)]
  if (fences.length > 0) {
    return fences[fences.length - 1][1].trim()
  }

  // 3. 容错：直接找第一个 { 到最后一个 } 的内容（裸 JSON）
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1).trim()
  }

  // 4. 都没匹配到，原样返回，让 JSON.parse 报错暴露原始内容
  return text
}

function tryParseJSON(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    const repaired = text
      .replace(/:\s*([^"\[\]{},\s][^,\}\]]*?)(\s*[,\}\]])/g, (_, val, tail) => {
        const trimmed = val.trim()
        if (/^(true|false|null|-?\d+(\.\d+)?)$/.test(trimmed)) return `: ${trimmed}${tail}`
        return `: "${trimmed}"${tail}`
      })
    return JSON.parse(repaired)
  }
}

export async function generateTree(input: string): Promise<GenerateResponse> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: buildGeneratePrompt(input) }],
    temperature: 0.7, // 初始树：稳定性优先（MiniMax 要求 > 0）
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0].message.content
  if (!raw) throw new Error('Empty response from LLM')
  const content = extractJSON(raw)

  const parsed = tryParseJSON(content) as GenerateResponse
  if (!parsed.rootLabel || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
    throw new Error('LLM response missing required fields')
  }
  return parsed
}

export async function expandNode(
  nodeLabel: string,
  parentContext: string,
  rootInput: string,
  depth: number
): Promise<ExpandResponse> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: buildExpandPrompt(nodeLabel, parentContext, rootInput, depth) }],
    temperature: 0.8, // 深层追问：略高创意度，避免重复（MiniMax 要求 <= 1.0）
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0].message.content
  if (!raw) throw new Error('Empty response from LLM')
  const content = extractJSON(raw)

  const parsed = tryParseJSON(content) as ExpandResponse
  if (!Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
    throw new Error('LLM expand response missing nodes')
  }
  return parsed
}
