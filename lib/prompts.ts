// lib/prompts.ts
export function buildGeneratePrompt(input: string): string {
  return `你是一个反向思维引擎。用户输入了一个结论、感受或现象。

你需要：
1. 识别输入类型：emotion（情绪探索）/ decision（决策分析）/ knowledge（知识拆解）
2. 生成3-4个"为什么"问题节点，每个节点是对用户输入的一个深层追问
3. 同时提供一个简化后的根节点标签（rootLabel，对用户输入的归纳，不超过20字）

每个节点包含：
- id: 唯一字符串（如 "node_1"）
- label: 问题文本，以"为什么"或"是什么"开头，不超过20字
- insight: 洞察说明，30字以内
- causes: 数组，2-3条可能原因，每条15字以内
- nextStep: 引导用户继续探索的一句话，20字以内

用户输入：${input}

严格以如下 JSON 格式返回，不要有任何多余文字或 markdown：
{
  "rootLabel": "...",
  "rootType": "emotion|decision|knowledge",
  "nodes": [
    {
      "id": "node_1",
      "label": "...",
      "insight": "...",
      "causes": ["...", "..."],
      "nextStep": "...",
      "type": "emotion|decision|knowledge"
    }
  ]
}`
}

export function buildExpandPrompt(
  nodeLabel: string,
  parentContext: string,
  rootInput: string,
  depth: number
): string {
  return `你是一个反向思维引擎。用户正在深度探索一棵问题树。

原始输入：${rootInput}
父节点问题：${parentContext}
当前节点问题：${nodeLabel}
当前追问深度：第 ${depth} 层

请生成2-3个更深层的追问节点，要求：
- 比当前节点更具体、更接近根本原因
- 避免重复已有的追问方向
- 保持与原始输入的逻辑关联

每个节点包含：
- id: 唯一字符串（如 "exp_1"）
- label: 问题文本，不超过20字
- insight: 洞察说明，30字以内
- causes: 数组，2-3条可能原因，每条15字以内
- nextStep: 引导语，20字以内

严格以如下 JSON 格式返回，不要有任何多余文字或 markdown：
{
  "nodes": [
    {
      "id": "exp_1",
      "label": "...",
      "insight": "...",
      "causes": ["...", "..."],
      "nextStep": "..."
    }
  ]
}`
}
