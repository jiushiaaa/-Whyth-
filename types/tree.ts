// types/tree.ts
export type NodeType = 'emotion' | 'decision' | 'knowledge'
export type NodeStatus = 'unexplored' | 'expanded' | 'selected'

export interface TreeNode {
  id: string
  label: string
  insight: string
  causes: string[]
  nextStep: string
  type: NodeType
  depth: number
  status: NodeStatus
  children: TreeNode[]
  parentId: string | null
  x?: number
  y?: number
}

export interface GenerateResponse {
  rootLabel: string
  rootType: NodeType
  nodes: Omit<TreeNode, 'depth' | 'status' | 'children' | 'x' | 'y'>[]
}

/**
 * ExpandResponse — LLM expand API 返回的节点数据
 * parentId 由调用层（tree-store.expandNode）注入，此处不返回
 * depth 和 status 也由 store 根据树结构自动计算
 */
export interface ExpandResponse {
  nodes: Omit<TreeNode, 'depth' | 'status' | 'children' | 'x' | 'y' | 'parentId'>[]
}
