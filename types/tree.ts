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

export interface ExpandResponse {
  nodes: Omit<TreeNode, 'depth' | 'status' | 'children' | 'x' | 'y' | 'parentId'>[]
}
