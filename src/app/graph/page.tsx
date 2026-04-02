"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, type NodeId } from "@/components/GraphCanvas";
import { edges, levelData, dijkstra } from "@/app/graphData";

export default function GraphPage() {
  const allNodeIds = useMemo(() => {
    const ids = new Set<NodeId>();
    for (const edge of edges) {
      ids.add(edge.from);
      ids.add(edge.to);
    }
    return Array.from(ids);
  }, []);
  const [start, setStart] = useState<NodeId>(allNodeIds[0] ?? "1");
  const [end, setEnd] = useState<NodeId>(allNodeIds[1] ?? "2");

  const shortest = useMemo(() => {
    if (!start || !end) return { path: [] as NodeId[], distance: 0 };
    return dijkstra(edges, start, end);
  }, [start, end]);

  const levelNodesMap = useMemo(() => {
    const map = new Map<keyof typeof levelData, Set<NodeId>>();
    (Object.keys(levelData) as Array<keyof typeof levelData>).forEach((key) => {
      map.set(key, new Set(levelData[key].nodes.map((n) => n.id)));
    });
    return map;
  }, []);

  const levelsInPath = useMemo(() => {
    const levels: Array<keyof typeof levelData> = [];
    if (!shortest.path.length) return levels;
    for (const levelKey of Object.keys(levelData) as Array<keyof typeof levelData>) {
      const nodeSet = levelNodesMap.get(levelKey)!;
      if (shortest.path.some((id) => nodeSet.has(id))) levels.push(levelKey);
    }
    return levels;
  }, [shortest.path, levelNodesMap]);

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
        <label>
          From
          <select value={start} onChange={(e) => setStart(e.target.value)} style={{ marginLeft: 8 }}>
            {allNodeIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label>
          To
          <select value={end} onChange={(e) => setEnd(e.target.value)} style={{ marginLeft: 8 }}>
            {allNodeIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <div style={{ alignSelf: "center" }}>
          Distance: {Number.isFinite(shortest.distance) ? shortest.distance : "N/A"}
        </div>
      </div>
      {shortest.path.length === 0 && <div>No path found.</div>}
      {shortest.path.length > 0 &&
        levelsInPath.map((levelKey) => {
          const levelInfo = levelData[levelKey];
          const nodeSet = levelNodesMap.get(levelKey)!;
          const levelEdges = edges.filter((edge) => nodeSet.has(edge.from) && nodeSet.has(edge.to));
          const levelPath = shortest.path.filter((id) => nodeSet.has(id));
          return (
            <section key={levelKey} style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 8 }}>{levelKey}</div>
              <GraphCanvas
                nodes={levelInfo.nodes}
                edges={levelEdges}
                shortestPath={levelPath.length ? levelPath : levelInfo.shortestPath}
                mapSrc={levelInfo.src}
                width={800}
                height={600}
                showAllEdges={false}
                showAllNodes={false}
              />
            </section>
          );
        })}
    </main>
  );
}
