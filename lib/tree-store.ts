// lib/tree-store.ts
import { create } from 'zustand'
import { TreeNode, NodeType, SavedTree } from '@/types/tree'
import { generateId } from '@/lib/utils'

const STORAGE_KEY = 'whyth_saved_trees'

function countNodes(node: TreeNode): number {
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0)
}

function readSavedTrees(): SavedTree[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function writeSavedTrees(trees: SavedTree[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trees))
}

interface TreeStore {
  root: TreeNode | null
  selectedNodeId: string | null
  userInput: string
  isLoading: boolean
  isDrawerOpen: boolean
  treeId: string | null

  setUserInput: (input: string) => void
  setLoading: (v: boolean) => void
  initTree: (rootLabel: string, rootType: NodeType, rawNodes: Omit<TreeNode, 'depth' | 'status' | 'children' | 'x' | 'y'>[], userInput: string) => void
  expandNode: (parentId: string, rawNodes: Omit<TreeNode, 'depth' | 'status' | 'children' | 'x' | 'y' | 'parentId'>[]) => void
  selectNode: (nodeId: string | null) => void
  setNodeStatus: (nodeId: string, status: TreeNode['status']) => void
  resetTree: () => void
  saveTree: () => void
  loadTree: (id: string) => void
  deleteSavedTree: (id: string) => void
  getSavedTrees: () => SavedTree[]
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
  treeId: null,

  setUserInput: (input) => set({ userInput: input }),
  setLoading: (v) => set({ isLoading: v }),

  initTree: (rootLabel, rootType, rawNodes, userInput) => {
    const rootId = generateId()
    const treeId = generateId()
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
    set({ root, userInput, selectedNodeId: null, isDrawerOpen: false, treeId })
  },

  expandNode: (parentId, rawNodes) => {
    const { root, treeId } = get()
    if (!root) return

    const newRoot = JSON.parse(JSON.stringify(root)) as TreeNode
    const parent = findNode(newRoot, parentId)
    if (!parent) return

    const parentDepth = getDepth(newRoot, parentId)
    if (parentDepth === -1) return
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

    if (treeId) {
      const trees = readSavedTrees()
      const idx = trees.findIndex((t) => t.id === treeId)
      if (idx !== -1) {
        trees[idx].root = newRoot
        trees[idx].updatedAt = Date.now()
        trees[idx].nodeCount = countNodes(newRoot)
        writeSavedTrees(trees)
      }
    }
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

  resetTree: () => set({ root: null, selectedNodeId: null, userInput: '', isLoading: false, isDrawerOpen: false, treeId: null }),

  saveTree: () => {
    const { root, treeId, userInput } = get()
    if (!root) return
    const trees = readSavedTrees()
    const now = Date.now()
    const nc = countNodes(root)

    if (treeId) {
      const idx = trees.findIndex((t) => t.id === treeId)
      if (idx !== -1) {
        trees[idx].root = root
        trees[idx].updatedAt = now
        trees[idx].nodeCount = nc
        writeSavedTrees(trees)
        return
      }
    }

    const newId = generateId()
    trees.push({ id: newId, userInput, root, createdAt: now, updatedAt: now, nodeCount: nc })
    writeSavedTrees(trees)
    set({ treeId: newId })
  },

  loadTree: (id) => {
    const trees = readSavedTrees()
    const tree = trees.find((t) => t.id === id)
    if (!tree) return
    set({ root: tree.root, userInput: tree.userInput, treeId: tree.id, selectedNodeId: null, isDrawerOpen: false })
  },

  deleteSavedTree: (id) => {
    const trees = readSavedTrees().filter((t) => t.id !== id)
    writeSavedTrees(trees)
  },

  getSavedTrees: () => {
    return readSavedTrees().sort((a, b) => b.updatedAt - a.updatedAt)
  },
}))
