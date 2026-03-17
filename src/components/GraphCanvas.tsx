"use client";

import { useEffect, useMemo, useRef } from "react";

export type NodeId = string;

export type Node = {
  id: NodeId;
  x?: number;
  y?: number;
};

export type Edge = {
  from: NodeId;
  to: NodeId;
  distance?: number;
};

export type GraphCanvasProps = {
  nodes: Node[];
  edges: Edge[];
  shortestPath: NodeId[];
  mapSrc?: string;
  width?: number;
  height?: number;
  showAllEdges?: boolean;
  showAllNodes?: boolean;
};

function edgeKey(a: NodeId, b: NodeId) {
  const sa = String(a);
  const sb = String(b);
  return sa < sb ? `${sa}__${sb}` : `${sb}__${sa}`;
}

export function GraphCanvas(props: GraphCanvasProps) {
  const {
    nodes,
    edges,
    shortestPath,
    mapSrc,
    width,
    height,
    showAllEdges = true,
    showAllNodes = true,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWidth = width ?? 800;
  const canvasHeight = height ?? 600;

  const layoutNodes = useMemo(() => {
    const ordered: Node[] = [];
    const seen = new Set<NodeId>();
    for (const node of nodes) {
      ordered.push(node);
      seen.add(node.id);
    }
    for (const edge of edges) {
      if (!seen.has(edge.from)) {
        ordered.push({ id: edge.from });
        seen.add(edge.from);
      }
      if (!seen.has(edge.to)) {
        ordered.push({ id: edge.to });
        seen.add(edge.to);
      }
    }

    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) / 2 - 40;
    const count = Math.max(ordered.length, 1);

    return ordered.map((node, index) => {
      const hasX = Number.isFinite(node.x);
      const hasY = Number.isFinite(node.y);
      if (hasX && hasY) return { id: node.id, x: node.x as number, y: node.y as number };
      const angle = (index / count) * Math.PI * 2;
      return {
        id: node.id,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }, [nodes, edges, canvasWidth, canvasHeight]);

  const nodeMap = useMemo(() => {
    const map = new Map<NodeId, Node>();
    for (const node of layoutNodes) {
      map.set(node.id, node);
    }
    return map;
  }, [layoutNodes]);

  const pathNodeSet = useMemo(() => {
    return new Set<NodeId>(shortestPath);
  }, [shortestPath]);

  const pathEdgeSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < shortestPath.length - 1; i += 1) {
      set.add(edgeKey(shortestPath[i], shortestPath[i + 1]));
    }
    return set;
  }, [shortestPath]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;

    const draw = (img?: HTMLImageElement) => {
      if (cancelled) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let scaleX = 1;
      let scaleY = 1;
      if (img) {
        scaleX = canvas.width / img.width;
        scaleY = canvas.height / img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      const sx = (x: number) => x * scaleX;
      const sy = (y: number) => y * scaleY;

      if (showAllEdges) {
        // Draw all edges in gray
        ctx.strokeStyle = "#c0c0c0";
        ctx.lineWidth = 1;
        for (const edge of edges) {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) continue;
          ctx.beginPath();
          ctx.moveTo(sx(from.x as number), sy(from.y as number));
          ctx.lineTo(sx(to.x as number), sy(to.y as number));
          ctx.stroke();
        }
      }

      // Draw path edges on top
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 3;
      for (const edge of edges) {
        const key = edgeKey(edge.from, edge.to);
        if (!pathEdgeSet.has(key)) continue;
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) continue;
        ctx.beginPath();
        ctx.moveTo(sx(from.x as number), sy(from.y as number));
        ctx.lineTo(sx(to.x as number), sy(to.y as number));
        ctx.stroke();
      }

      if (showAllNodes || pathNodeSet.size > 0) {
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        for (const node of layoutNodes) {
          const isPathNode = pathNodeSet.has(node.id);
          if (!showAllNodes && !isPathNode) continue;
          ctx.fillStyle = isPathNode ? "#2563eb" : "#ef4444";
          ctx.beginPath();
          ctx.arc(sx(node.x as number), sy(node.y as number), 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#111827";
          ctx.fillText(String(node.id), sx(node.x as number) + 8, sy(node.y as number));
        }
      }
    };

    if (!mapSrc) {
      draw();
      return;
    }

    const img = new Image();
    img.src = mapSrc;
    img.onload = () => draw(img);
    return () => {
      cancelled = true;
    };
  }, [edges, layoutNodes, nodeMap, pathEdgeSet, pathNodeSet, mapSrc, canvasWidth, canvasHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{ border: "1px solid #e5e7eb" }}
    />
  );
}
