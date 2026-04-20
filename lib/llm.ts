// lib/llm.ts
import OpenAI from 'openai'
import { buildGeneratePrompt, buildExpandPrompt } from './prompts'
import { GenerateResponse, ExpandResponse } from '@/types/tree'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateTree(input: string): Promise<GenerateResponse> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildGeneratePrompt(input) }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('Empty response from LLM')

  const parsed = JSON.parse(content) as GenerateResponse
  return parsed
}

export async function expandNode(
  nodeLabel: string,
  parentContext: string,
  rootInput: string,
  depth: number
): Promise<ExpandResponse> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildExpandPrompt(nodeLabel, parentContext, rootInput, depth) }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('Empty response from LLM')

  const parsed = JSON.parse(content) as ExpandResponse
  return parsed
}
