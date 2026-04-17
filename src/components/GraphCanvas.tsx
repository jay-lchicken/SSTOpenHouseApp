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
  startNodeId?: NodeId;
  endNodeId?: NodeId;
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
    startNodeId,
    endNodeId,
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
        // Draw all edges in gray (debug/graph view)
        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        for (const edge of edges) {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) continue;
          ctx.beginPath();
          ctx.moveTo(sx(from.x as number), sy(from.y as number));
          ctx.lineTo(sx(to.x as number), sy(to.y as number));
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      // Draw path edges
      if (shortestPath.length > 1) {
        // Outer glow effect on path
        ctx.strokeStyle = "rgba(37,99,235,0.25)";
        ctx.lineWidth = 9;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let i = 0; i < shortestPath.length - 1; i++) {
          const from = nodeMap.get(shortestPath[i]);
          const to = nodeMap.get(shortestPath[i + 1]);
          if (!from || !to) continue;
          ctx.moveTo(sx(from.x as number), sy(from.y as number));
          ctx.lineTo(sx(to.x as number), sy(to.y as number));
        }
        ctx.stroke();

        // Solid path line
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let i = 0; i < shortestPath.length - 1; i++) {
          const from = nodeMap.get(shortestPath[i]);
          const to = nodeMap.get(shortestPath[i + 1]);
          if (!from || !to) continue;
          ctx.moveTo(sx(from.x as number), sy(from.y as number));
          ctx.lineTo(sx(to.x as number), sy(to.y as number));
        }
        ctx.stroke();

        // Directional arrows at midpoints of each path segment
        const arrowSize = 11;
        const arrowAngle = Math.PI / 5;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        for (let i = 0; i < shortestPath.length - 1; i++) {
          const from = nodeMap.get(shortestPath[i]);
          const to = nodeMap.get(shortestPath[i + 1]);
          if (!from || !to) continue;
          const fx = sx(from.x as number), fy = sy(from.y as number);
          const tx = sx(to.x as number), ty = sy(to.y as number);
          const segLen = Math.sqrt((tx - fx) ** 2 + (ty - fy) ** 2);
          // Only draw arrow if segment is long enough
          if (segLen < 20) continue;
          const angle = Math.atan2(ty - fy, tx - fx);
          // Place arrow tip at 60% along the segment
          const mx = fx + (tx - fx) * 0.6;
          const my = fy + (ty - fy) * 0.6;
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(mx - arrowSize * Math.cos(angle - arrowAngle), my - arrowSize * Math.sin(angle - arrowAngle));
          ctx.moveTo(mx, my);
          ctx.lineTo(mx - arrowSize * Math.cos(angle + arrowAngle), my - arrowSize * Math.sin(angle + arrowAngle));
          ctx.stroke();
        }
      }

      // Draw nodes (debug mode) or just start/end markers
      if (showAllNodes && pathNodeSet.size === 0) {
        // Debug: show all nodes as small dots
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        for (const node of layoutNodes) {
          const nx = sx(node.x as number);
          const ny = sy(node.y as number);
          ctx.fillStyle = "#6b7280";
          ctx.beginPath();
          ctx.arc(nx, ny, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw start and end markers
      if (startNodeId || endNodeId) {
        const drawPin = (nodeId: NodeId, isStart: boolean) => {
          const node = nodeMap.get(nodeId);
          if (!node) return;
          const nx = sx(node.x as number);
          const ny = sy(node.y as number);
          const color = isStart ? "#16a34a" : "#dc2626";
          const label = isStart ? "Start" : "End";

          // Drop shadow
          ctx.shadowColor = "rgba(0,0,0,0.3)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;

          // Outer ring
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(nx, ny, 13, 0, Math.PI * 2);
          ctx.fill();

          // Colored circle
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(nx, ny, 10, 0, Math.PI * 2);
          ctx.fill();

          // Inner dot
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(nx, ny, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;

          // Label pill
          ctx.font = "bold 12px sans-serif";
          const textW = ctx.measureText(label).width;
          const pad = 6;
          const pillW = textW + pad * 2;
          const pillH = 20;
          const lx = nx - pillW / 2;
          const ly = ny - 32;

          // Pill shadow
          ctx.shadowColor = "rgba(0,0,0,0.2)";
          ctx.shadowBlur = 6;

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(lx, ly, pillW, pillH, 6);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.shadowColor = "transparent";

          ctx.fillStyle = "#ffffff";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(label, nx, ly + pillH / 2);
          ctx.textAlign = "left";
        };

        if (startNodeId) drawPin(startNodeId, true);
        if (endNodeId) drawPin(endNodeId, false);
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
  }, [edges, layoutNodes, nodeMap, pathEdgeSet, pathNodeSet, shortestPath, mapSrc, canvasWidth, canvasHeight, startNodeId, endNodeId, showAllEdges, showAllNodes]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{ border: "1px solid #e5e7eb" }}
    />
  );
}
