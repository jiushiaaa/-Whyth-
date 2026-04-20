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

    const defs = d3.select(svg).select<SVGDefsElement>('defs')

    if (defs.select('#bark-texture').empty()) {
      const bark = defs.append('filter').attr('id', 'bark-texture')
        .attr('x', '-10%').attr('y', '-10%').attr('width', '120%').attr('height', '120%')
      bark.append('feTurbulence')
        .attr('type', 'fractalNoise').attr('baseFrequency', '0.04')
        .attr('numOctaves', '3').attr('seed', '2').attr('result', 'noise')
      bark.append('feDisplacementMap')
        .attr('in', 'SourceGraphic').attr('in2', 'noise')
        .attr('scale', '2').attr('xChannelSelector', 'R').attr('yChannelSelector', 'G')
    }

    if (defs.select('#soil-texture').empty()) {
      const soil = defs.append('filter').attr('id', 'soil-texture')
      soil.append('feTurbulence')
        .attr('type', 'turbulence').attr('baseFrequency', '0.08')
        .attr('numOctaves', '2').attr('seed', '5').attr('result', 'noise')
      soil.append('feDisplacementMap')
        .attr('in', 'SourceGraphic').attr('in2', 'noise')
        .attr('scale', '1.5')
    }

    links.forEach((link) => {
      const gradId = `branch-grad-${link.source.id}-${link.target.id}`
      if (defs.select(`#${gradId}`).empty()) {
        const [startColor, endColor] = getBranchGradientColors(link.target.depth)
        const grad = defs.append('linearGradient').attr('id', gradId)
          .attr('gradientUnits', 'userSpaceOnUse')
        grad.append('stop').attr('offset', '0%').attr('stop-color', startColor)
        grad.append('stop').attr('offset', '100%').attr('stop-color', endColor)
      }
    })

    const totalNodes = nodes.length
    const useBarkFilter = totalNodes <= 30

    // ── 枝干层（link layer） ──────────────────────────────────────
    const linkSel = d3.select(linkG)
      .selectAll<SVGPathElement, typeof links[0]>('.link')
      .data(links, d => `${d.source.id}-${d.target.id}`)

    linkSel.enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', d => `url(#branch-grad-${d.source.id}-${d.target.id})`)
      .attr('stroke-opacity', 0.85)
      .attr('stroke-width', d => getBranchWidth(d.target.depth))
      .attr('stroke-linecap', 'round')
      .attr('filter', d => (useBarkFilter && d.target.depth <= 1) ? 'url(#bark-texture)' : null)
      .attr('d', d => {
        const sx = d.source.x ?? 0, sy = d.source.y ?? 0
        const tx = d.target.x ?? 0, ty = d.target.y ?? 0
        const rng = seededRandom(d.source.id + d.target.id)
        const ox = (rng() - 0.5) * 8
        const oy = (rng() - 0.5) * 6
        const mx = (sx + tx) / 2 + ox
        const my = (sy + ty) / 2 + oy
        return `M${sx},${sy} Q${mx},${my} ${tx},${ty}`
      })
      .attr('stroke-dasharray', function() { return (this as SVGPathElement).getTotalLength() })
      .attr('stroke-dashoffset', function() { return (this as SVGPathElement).getTotalLength() })
      .transition().duration(700).ease(d3.easeQuadOut)
      .attr('stroke-dashoffset', 0)

    linkSel.transition().duration(300)
      .attr('d', d => {
        const sx = d.source.x ?? 0, sy = d.source.y ?? 0
        const tx = d.target.x ?? 0, ty = d.target.y ?? 0
        const rng = seededRandom(d.source.id + d.target.id)
        const ox = (rng() - 0.5) * 8
        const oy = (rng() - 0.5) * 6
        const mx = (sx + tx) / 2 + ox
        const my = (sy + ty) / 2 + oy
        return `M${sx},${sy} Q${mx},${my} ${tx},${ty}`
      })

    linkSel.exit().remove()

    // ── 节点层（node layer） ──────────────────────────────────────
    const nodeSel = d3.select(nodeG)
      .selectAll<SVGGElement, TreeNode>('.node')
      .data(nodes, d => d.id)

    const nodeEnter = nodeSel.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
      .attr('cursor', 'pointer')
      .on('click', (_, d) => onNodeClick(d))

    nodeEnter.filter(d => d.depth === 0).each(function(d) {
      const g = d3.select(this)
      g.append('circle')
        .attr('class', 'soil-ring')
        .attr('r', 22)
        .attr('fill', 'none')
        .attr('stroke', '#8B7355')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '4 3')
        .attr('opacity', 0.5)
        .attr('filter', useBarkFilter ? 'url(#soil-texture)' : null)
      g.append('circle')
        .attr('class', 'main')
        .attr('r', 0)
        .attr('fill', getNodeColor(0))
        .attr('stroke', '#5A3E28')
        .attr('stroke-width', 2.5)
        .transition().duration(500).ease(d3.easeBackOut)
        .attr('r', getNodeRadius(0))
    })

    nodeEnter.filter(d => d.depth > 0).each(function(d) {
      const g = d3.select(this)
      const leafCount = getLeafCount(d.depth)
      const color = getNodeColor(d.depth)
      const rng = seededRandom(d.id)
      const r = getNodeRadius(d.depth)

      g.append('circle')
        .attr('r', r * 2.5)
        .attr('fill', getNodeGlow(d.depth))
        .attr('opacity', 0)
        .transition().duration(600).attr('opacity', 1)

      const cluster = g.append('g').attr('class', 'leaf-cluster')
      for (let i = 0; i < leafCount; i++) {
        const angle = (i * (360 / leafCount)) + (rng() - 0.5) * 30
        const dist = r * 0.4
        const leafG = cluster.append('g')
          .attr('transform', `rotate(${angle}) translate(${dist}, 0)`)

        leafG.append('ellipse')
          .attr('rx', d.depth >= 3 ? 5 : 7)
          .attr('ry', d.depth >= 3 ? 3 : 3.5)
          .attr('fill', color)
          .attr('opacity', 0.85)
          .attr('transform', 'scale(0)')
          .transition().delay(300 + i * 80).duration(400)
          .ease(d3.easeBackOut)
          .attr('transform', `scale(1) rotate(${(rng() - 0.5) * 20})`)

        leafG.append('line')
          .attr('x1', d.depth >= 3 ? -4 : -5)
          .attr('y1', 0)
          .attr('x2', d.depth >= 3 ? 4 : 5)
          .attr('y2', 0)
          .attr('stroke', d.depth <= 1 ? '#A05A20' : '#2A5A30')
          .attr('stroke-width', 0.5)
          .attr('opacity', 0)
          .transition().delay(500 + i * 80).duration(300)
          .attr('opacity', 0.5)
      }

      g.append('circle')
        .attr('class', 'main')
        .attr('r', 0)
        .attr('fill', d.status === 'expanded' ? 'none' : color)
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .transition().duration(400).ease(d3.easeBackOut)
        .attr('r', r * 0.5)
    })

    nodeEnter.append('text')
      .attr('class', 'label')
      .attr('dy', d => -getNodeRadius(d.depth) - (d.depth === 0 ? 20 : 14))
      .attr('text-anchor', 'middle')
      .attr('fill', '#2C2416')
      .attr('font-size', d => d.depth === 0 ? '13px' : '11px')
      .attr('font-weight', d => d.depth === 0 ? '400' : '300')
      .attr('letter-spacing', '0.02em')
      .attr('opacity', 0)
      .text(d => {
        const limit = d.depth === 0 ? 18 : 14
        return d.label.length > limit ? d.label.slice(0, limit) + '...' : d.label
      })
      .transition().delay(400).duration(400).attr('opacity', 1)

    nodeSel.transition().duration(400)
      .attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)

    nodeSel.select('.main')
      .attr('stroke-width', d => d.id === selectedNodeId ? 3 : d.depth === 0 ? 2.5 : 1.5)

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
