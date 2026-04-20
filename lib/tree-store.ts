// lib/tree-store.ts
import { create } from 'zustand'
import { TreeNode, NodeType } from '@/types/tree'
import { generateId } from '@/lib/utils'

interface TreeStore {
  root: TreeNode | null
  selectedNodeId: string | null
  userInput: string
  isLoading: boolean
  isDrawerOpen: boolean

  // actions
  setUserInput: (input: string) => void
  setLoading: (v: boolean) => void
  initTree: (rootLabel: string, rootType: NodeType, rawNodes: Omit<TreeNode, 'depth' | 'status' | 'children' | 'x' | 'y'>[], userInput: string) => void
  expandNode: (parentId: string, rawNodes: Omit<TreeNode, 'depth' | 'status' | 'children' | 'x' | 'y' | 'parentId'>[]) => void
  selectNode: (nodeId: string | null) => void
  setNodeStatus: (nodeId: string, status: TreeNode['status']) => void
  resetTree: () => void
}

function findNode(root: TreeNode, id: string): TreeNode | null {
  if (root.id === id) return root
  for (const child of root.children) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}

function getDepth(root: TreeNode, id: string, depth = 0): number {
  if (root.id === id) return depth
  for (const child of root.children) {
    const d = getDepth(child, id, depth + 1)
    if (d !== -1) return d
  }
  return -1
}

export const useTreeStore = create<TreeStore>((set, get) => ({
  root: null,
  selectedNodeId: null,
  userInput: '',
  isLoading: false,
  isDrawerOpen: false,

  setUserInput: (input) => set({ userInput: input }),
  setLoading: (v) => set({ isLoading: v }),

  initTree: (rootLabel, rootType, rawNodes, userInput) => {
    const rootId = generateId()
    const children: TreeNode[] = rawNodes.map((n) => ({
      ...n,
      parentId: rootId,
      depth: 1,
      status: 'unexplored',
      children: [],
    }))

    const root: TreeNode = {
      id: rootId,
      label: rootLabel,
      insight: userInput,
      causes: [],
      nextStep: '点击任意节点开始探索',
      type: rootType,
      depth: 0,
      status: 'expanded',
      children,
      parentId: null,
    }
    set({ root, userInput, selectedNodeId: null, isDrawerOpen: false })
  },

  expandNode: (parentId, rawNodes) => {
    const { root } = get()
    if (!root) return

    const newRoot = JSON.parse(JSON.stringify(root)) as TreeNode
    const parent = findNode(newRoot, parentId)
    if (!parent) return

    const parentDepth = getDepth(newRoot, parentId)
    const newChildren: TreeNode[] = rawNodes.map((n) => ({
      ...n,
      id: generateId(),
      parentId,
      depth: parentDepth + 1,
      status: 'unexplored' as const,
      children: [],
    }))

    parent.children = newChildren
    parent.status = 'expanded'
    set({ root: newRoot })
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId, isDrawerOpen: nodeId !== null }),

  setNodeStatus: (nodeId, status) => {
    const { root } = get()
    if (!root) return
    const newRoot = JSON.parse(JSON.stringify(root)) as TreeNode
    const node = findNode(newRoot, nodeId)
    if (node) node.status = status
    set({ root: newRoot })
  },

  resetTree: () => set({ root: null, selectedNodeId: null, userInput: '', isLoading: false, isDrawerOpen: false }),
}))
