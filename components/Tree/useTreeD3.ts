// components/Tree/useTreeD3.ts
import { useEffect, useRef, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import { TreeNode } from '@/types/tree'
import { getNodeColor, getNodeGlow, getNodeRadius, seededRandom, getBranchWidth, getBranchGradientColors, getLeafCount } from '@/lib/utils'

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
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const svgSelRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null)
  // 分两层：link 层在下，node 层在上
  const linkGRef = useRef<SVGGElement | null>(null)
  const nodeGRef = useRef<SVGGElement | null>(null)

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

    const linkG = linkGRef.current!
    const nodeG = nodeGRef.current!
    const nodes = flattenTree(root)
    const links = getLinks(root)

    // 定义发光滤镜
    const defs = d3.select(svg).select<SVGDefsElement>('defs')
    nodes.forEach((node) => {
      const filterId = `glow-${node.depth}`
      if (defs.select(`#${filterId}`).empty()) {
        const filter = defs.append('filter').attr('id', filterId)
        filter.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'coloredBlur')
        const feMerge = filter.append('feMerge')
        feMerge.append('feMergeNode').attr('in', 'coloredBlur')
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic')
      }
    })

    // ── 枝干层（link layer） ──────────────────────────────────────
    const linkSel = d3.select(linkG)
      .selectAll<SVGPathElement, (typeof links)[0]>('.link')
      .data(links, (d) => `${d.source.id}-${d.target.id}`)

    // 新增连线：从 0 长度生长出来
    linkSel.enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', (d) => getNodeColor(d.target.depth))
      .attr('stroke-opacity', 0.7)          // 浅色背景下加深，原来 0.35 太淡
      .attr('stroke-width', (d) => Math.max(1.5, 3 - d.target.depth * 0.6))
      .attr('d', (d) => {
        const sx = d.source.x ?? 0, sy = d.source.y ?? 0
        const tx = d.target.x ?? 0, ty = d.target.y ?? 0
        return `M${sx},${sy} C${sx},${(sy + ty) / 2} ${tx},${(sy + ty) / 2} ${tx},${ty}`
      })
      .attr('stroke-dasharray', function() { return (this as SVGPathElement).getTotalLength() })
      .attr('stroke-dashoffset', function() { return (this as SVGPathElement).getTotalLength() })
      .transition().duration(700).ease(d3.easeQuadOut)
      .attr('stroke-dashoffset', 0)

    // 已有连线：更新路径（节点移动时）
    linkSel
      .transition().duration(300)
      .attr('stroke', (d) => getNodeColor(d.target.depth))
      .attr('stroke-opacity', 0.7)
      .attr('stroke-width', (d) => Math.max(1.5, 3 - d.target.depth * 0.6))
      .attr('d', (d) => {
        const sx = d.source.x ?? 0, sy = d.source.y ?? 0
        const tx = d.target.x ?? 0, ty = d.target.y ?? 0
        return `M${sx},${sy} C${sx},${(sy + ty) / 2} ${tx},${(sy + ty) / 2} ${tx},${ty}`
      })

    linkSel.exit().remove()

    // ── 节点层（node layer） ──────────────────────────────────────
    const nodeSel = d3.select(nodeG)
      .selectAll<SVGGElement, TreeNode>('.node')
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
      .attr('stroke-width', 2)
      .attr('filter', (d) => `url(#glow-${d.depth})`)
      .transition().duration(500).ease(d3.easeBackOut)
      .attr('r', (d) => getNodeRadius(d.depth))

    // 脉动圆（未探索节点）
    nodeEnter.append('circle')
      .attr('class', 'pulse')
      .attr('r', (d) => getNodeRadius(d.depth))
      .attr('fill', 'none')
      .attr('stroke', (d) => getNodeColor(d.depth))
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.4)

    // 标签：字体加深、加粗
    nodeEnter.append('text')
      .attr('class', 'label')
      .attr('dy', (d) => -getNodeRadius(d.depth) - 7)
      .attr('text-anchor', 'middle')
      .attr('fill', '#2C2416')              // 深棕色，清晰可读
      .attr('font-size', (d) => d.depth === 0 ? '13px' : '11px')
      .attr('font-weight', (d) => d.depth === 0 ? '400' : '300')
      .attr('letter-spacing', '0.02em')
      .attr('opacity', 0)
      .text((d) => {
        const limit = d.depth === 0 ? 18 : 14
        return d.label.length > limit ? d.label.slice(0, limit) + '…' : d.label
      })
      .transition().delay(300).duration(400).attr('opacity', 1)

    // 更新已有节点位置
    nodeSel.transition().duration(400)
      .attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)

    nodeSel.select('.main')
      .attr('fill', (d) => d.status === 'expanded' ? 'none' : getNodeColor(d.depth))
      .attr('stroke-width', (d) => d.id === selectedNodeId ? 3 : 2)

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

    // 外层 zoom 容器
    const outerG = svgSel.selectAll<SVGGElement, null>('g.tree-outer')
      .data([null])
      .join('g')
      .attr('class', 'tree-outer')

    // link 层（先 append，在下方）
    const linkG = outerG.selectAll<SVGGElement, null>('g.link-layer')
      .data([null])
      .join('g')
      .attr('class', 'link-layer')
    linkGRef.current = linkG.node()

    // node 层（后 append，在上方）
    const nodeG = outerG.selectAll<SVGGElement, null>('g.node-layer')
      .data([null])
      .join('g')
      .attr('class', 'node-layer')
    nodeGRef.current = nodeG.node()

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        outerG.attr('transform', event.transform)
      })

    zoomRef.current = zoom
    svgSelRef.current = svgSel
    svgSel.call(zoom)
    render()

    const handleResize = () => render()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [render])

  const resetZoom = useCallback(() => {
    if (zoomRef.current && svgSelRef.current) {
      svgSelRef.current.transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity)
    }
  }, [])

  return { svgRef, resetZoom }
}
