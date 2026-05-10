"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  const clickMeRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const [showClickMePopup, setShowClickMePopup] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Used only in debug mode (showAllNodes with no path)
  const pathNodeSet = useMemo(() => new Set<NodeId>(shortestPath), [shortestPath]);

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

      if (shortestPath.length > 1) {
        // Pre-compute scaled segment endpoints once for all three draw passes
        const segments: Array<[number, number, number, number]> = [];
        for (let i = 0; i < shortestPath.length - 1; i++) {
          const from = nodeMap.get(shortestPath[i]);
          const to = nodeMap.get(shortestPath[i + 1]);
          if (!from || !to) continue;
          segments.push([sx(from.x as number), sy(from.y as number), sx(to.x as number), sy(to.y as number)]);
        }

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Glow pass
        ctx.strokeStyle = "rgba(37,99,235,0.25)";
        ctx.lineWidth = 9;
        ctx.beginPath();
        for (const [fx, fy, tx, ty] of segments) {
          ctx.moveTo(fx, fy);
          ctx.lineTo(tx, ty);
        }
        ctx.stroke();

        // Solid path
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 6;
        ctx.beginPath();
        for (const [fx, fy, tx, ty] of segments) {
          ctx.moveTo(fx, fy);
          ctx.lineTo(tx, ty);
        }
        ctx.stroke();

        // Directional arrows — white chevrons at 60% along each segment
        const arrowSize = 18;
        const arrowAngle = Math.PI / 5;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        for (const [fx, fy, tx, ty] of segments) {
          const segLen = Math.sqrt((tx - fx) ** 2 + (ty - fy) ** 2);
          if (segLen < 20) continue;
          const angle = Math.atan2(ty - fy, tx - fx);
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

      if (showAllNodes && pathNodeSet.size === 0) {
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        for (const node of layoutNodes) {
          ctx.fillStyle = "#6b7280";
          ctx.beginPath();
          ctx.arc(sx(node.x as number), sy(node.y as number), 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (startNodeId || endNodeId) {
        const drawPin = (nodeId: NodeId, isStart: boolean) => {
          const node = nodeMap.get(nodeId);
          if (!node) return;
          const nx = sx(node.x as number);
          const ny = sy(node.y as number);
          const color = isStart ? "#16a34a" : "#dc2626";
          const label = isStart ? "Start" : "End";

          ctx.shadowColor = "rgba(0,0,0,0.3)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(nx, ny, 13, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(nx, ny, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(nx, ny, 4, 0, Math.PI * 2);
          ctx.fill();

          // Reset before pill (pill uses its own lighter shadow)
          ctx.shadowOffsetY = 0;
          ctx.shadowColor = "rgba(0,0,0,0.2)";
          ctx.shadowBlur = 6;

          ctx.font = "bold 12px sans-serif";
          const textW = ctx.measureText(label).width;
          const pad = 6;
          const pillW = textW + pad * 2;
          const pillH = 20;
          const lx = nx - pillW / 2;
          const ly = ny - 32;

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

      // "Click me" button at node 24 (Level 1 only)
      const node24 = nodeMap.get("24");
      if (node24 && Number.isFinite(node24.x) && Number.isFinite(node24.y)) {
        const nx = sx(node24.x as number);
        const ny = sy(node24.y as number);
        ctx.font = "bold 13px sans-serif";
        const label = "Click me for layout";
        const textW = ctx.measureText(label).width;
        const padX = 12;
        const w = textW + padX * 2;
        const h = 28;
        const x = nx - w / 2;
        const y = ny - h - 14;

        clickMeRectRef.current = { x, y, w, h };

        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 14);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "transparent";

        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(label, nx, y + h / 2);
        ctx.textAlign = "left";

        // Pointer tail down to node
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(nx - 6, y + h);
        ctx.lineTo(nx + 6, y + h);
        ctx.lineTo(nx, y + h + 6);
        ctx.closePath();
        ctx.fill();
      } else {
        clickMeRectRef.current = null;
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
  }, [edges, layoutNodes, nodeMap, pathNodeSet, shortestPath, mapSrc, canvasWidth, canvasHeight, startNodeId, endNodeId, showAllEdges, showAllNodes]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = clickMeRectRef.current;
    const canvas = canvasRef.current;
    if (!rect || !canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const cx = ((e.clientX - bounds.left) / bounds.width) * canvas.width;
    const cy = ((e.clientY - bounds.top) / bounds.height) * canvas.height;
    if (cx >= rect.x && cx <= rect.x + rect.w && cy >= rect.y && cy <= rect.y + rect.h) {
      setShowClickMePopup(true);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleCanvasClick}
        style={{ border: "1px solid #e5e7eb", cursor: "pointer" }}
      />
      {showClickMePopup && mounted && createPortal(
        <div
          onClick={() => setShowClickMePopup(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(14px) saturate(160%)",
            WebkitBackdropFilter: "blur(14px) saturate(160%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            cursor: "zoom-out",
            padding: 24,
            animation: "clickMeFadeIn 220ms ease-out",
          }}
        >
          <style>{`
            @keyframes clickMeFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes clickMePopIn {
              from { opacity: 0; transform: scale(0.94) translateY(8px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              padding: 14,
              borderRadius: 28,
              background: "rgba(255, 255, 255, 0.18)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.35)",
              boxShadow:
                "0 24px 60px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
              maxWidth: "92vw",
              maxHeight: "92vh",
              animation: "clickMePopIn 280ms cubic-bezier(0.22, 1, 0.36, 1)",
              cursor: "default",
            }}
          >
            <button
              onClick={() => setShowClickMePopup(false)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(10px)",
                color: "#0f172a",
                fontSize: 18,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
            <img
              src="/layout.jpg"
              alt="Layout"
              style={{
                display: "block",
                maxWidth: "calc(92vw - 28px)",
                maxHeight: "calc(92vh - 28px)",
                borderRadius: 18,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
