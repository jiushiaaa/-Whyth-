// components/Tree/useTreeD3.ts
import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { TreeNode } from '@/types/tree'
import { getNodeColor, getNodeGlow, getNodeRadius } from '@/lib/utils'

interface UseTreeD3Options {
  root: TreeNode
  selectedNodeId: string | null
  onNodeClick: (node: TreeNode) => void
}

// Hoisted outside hook to avoid recursive useCallback closure issues
function flattenTree(node: TreeNode): TreeNode[] {
  return [node, ...node.children.flatMap(flattenTree)]
}

function getLinks(node: TreeNode): { source: TreeNode; target: TreeNode }[] {
  const links: { source: TreeNode; target: TreeNode }[] = []
  node.children.forEach((child) => {
    links.push({ source: node, target: child })
    links.push(...getLinks(child))
  })
  return links
}

export function useTreeD3({ root, selectedNodeId, onNodeClick }: UseTreeD3Options) {
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement | null>(null)

  const computeLayout = useCallback((rootNode: TreeNode, width: number, height: number) => {
    const hierarchy = d3.hierarchy(rootNode, (d) => d.children)
    const treeLayout = d3.tree<TreeNode>()
      .size([width * 0.8, height * 0.6])
      .separation((a, b) => (a.parent === b.parent ? 1.4 : 2))

    const laid = treeLayout(hierarchy)

    const offsetX = width / 2
    const offsetY = height * 0.75

    laid.each((d) => {
      d.data.x = d.x + offsetX - width * 0.4
      d.data.y = offsetY - d.y  // y 轴翻转，让树向上生长
    })
  }, [])

  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg || !root) return

    const width = svg.clientWidth
    const height = svg.clientHeight

    computeLayout(root, width, height)

    const g = gRef.current!
    const nodes = flattenTree(root)
    const links = getLinks(root)

    // 定义发光滤镜
    const defs = d3.select(svg).select<SVGDefsElement>('defs')

    nodes.forEach((node) => {
      const filterId = `glow-${node.depth}`
      if (defs.select(`#${filterId}`).empty()) {
        const filter = defs.append('filter').attr('id', filterId)
        filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')
        const feMerge = filter.append('feMerge')
        feMerge.append('feMergeNode').attr('in', 'coloredBlur')
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic')
      }
    })

    // 绘制枝干
    const linkSel = d3.select(g).selectAll<SVGPathElement, (typeof links)[0]>('.link')
      .data(links, (d) => `${d.source.id}-${d.target.id}`)

    linkSel.enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', (d) => getNodeColor(d.target.depth))
      .attr('stroke-opacity', 0.35)
      .attr('stroke-width', (d) => Math.max(1, 2.5 - d.target.depth * 0.5))
      .attr('d', (d) => {
        const sx = d.source.x ?? 0, sy = d.source.y ?? 0
        const tx = d.target.x ?? 0, ty = d.target.y ?? 0
        return `M${sx},${sy} C${sx},${(sy + ty) / 2} ${tx},${(sy + ty) / 2} ${tx},${ty}`
      })
      .attr('stroke-dasharray', function() { return (this as SVGPathElement).getTotalLength() })
      .attr('stroke-dashoffset', function() { return (this as SVGPathElement).getTotalLength() })
      .transition().duration(600).ease(d3.easeQuadOut)
      .attr('stroke-dashoffset', 0)

    linkSel
      .transition().duration(300)
      .attr('d', (d) => {
        const sx = d.source.x ?? 0, sy = d.source.y ?? 0
        const tx = d.target.x ?? 0, ty = d.target.y ?? 0
        return `M${sx},${sy} C${sx},${(sy + ty) / 2} ${tx},${(sy + ty) / 2} ${tx},${ty}`
      })

    linkSel.exit().remove()

    // 绘制节点
    const nodeSel = d3.select(g).selectAll<SVGGElement, TreeNode>('.node')
      .data(nodes, (d) => d.id)

    const nodeEnter = nodeSel.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
      .attr('cursor', 'pointer')
      .on('click', (_, d) => onNodeClick(d))

    // 光晕圆
    nodeEnter.append('circle')
      .attr('class', 'glow')
      .attr('r', (d) => getNodeRadius(d.depth) * 2.5)
      .attr('fill', (d) => getNodeGlow(d.depth))
      .attr('opacity', 0)
      .transition().duration(600).attr('opacity', 1)

    // 主圆
    nodeEnter.append('circle')
      .attr('class', 'main')
      .attr('r', 0)
      .attr('fill', (d) => d.status === 'expanded' ? 'none' : getNodeColor(d.depth))
      .attr('stroke', (d) => getNodeColor(d.depth))
      .attr('stroke-width', 1.5)
      .attr('filter', (d) => `url(#glow-${d.depth})`)
      .transition().duration(500).ease(d3.easeBackOut)
      .attr('r', (d) => getNodeRadius(d.depth))

    // 脉动圆（未探索节点）
    nodeEnter.append('circle')
      .attr('class', 'pulse')
      .attr('r', (d) => getNodeRadius(d.depth))
      .attr('fill', 'none')
      .attr('stroke', (d) => getNodeColor(d.depth))
      .attr('stroke-width', 1)
      .attr('opacity', 0.5)

    // 标签
    nodeEnter.append('text')
      .attr('class', 'label')
      .attr('dy', (d) => -getNodeRadius(d.depth) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255,255,255,0.75)')
      .attr('font-size', '11px')
      .attr('font-weight', '300')
      .attr('opacity', 0)
      .text((d) => d.depth === 0 ? d.label : (d.label.length > 14 ? d.label.slice(0, 14) + '…' : d.label))
      .transition().delay(300).duration(400).attr('opacity', 1)

    // 更新已有节点
    nodeSel.transition().duration(400)
      .attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)

    nodeSel.select('.main')
      .attr('fill', (d) => d.status === 'expanded' ? 'none' : getNodeColor(d.depth))
      .attr('stroke-width', (d) => d.id === selectedNodeId ? 2.5 : 1.5)

    nodeSel.select('.glow')
      .attr('r', (d) => d.id === selectedNodeId
        ? getNodeRadius(d.depth) * 4
        : getNodeRadius(d.depth) * 2.5)

    nodeSel.exit().remove()
  }, [root, selectedNodeId, computeLayout, onNodeClick])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const svgSel = d3.select(svg)
    svgSel.selectAll('defs').data([null]).join('defs')
    const g = svgSel.selectAll<SVGGElement, null>('g.tree-root')
      .data([null])
      .join('g')
      .attr('class', 'tree-root')
    gRef.current = g.node()

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svgSel.call(zoom)
    render()

    const handleResize = () => render()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [render])

  useEffect(() => {
    render()
  }, [root, selectedNodeId, render])

  return { svgRef }
}
