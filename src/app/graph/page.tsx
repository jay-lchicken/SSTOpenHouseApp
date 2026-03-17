"use client";

import { useMemo, useState } from "react";
import { GraphCanvas, type Edge, type Node, type NodeId } from "@/components/GraphCanvas";

const edgeCsv = `NodeA,NodeB,Distance
1,2,20
2,27,5
2,L1_4,5
2,3,5
27,23,40
23,24,15
24,26,15
26,25,15
24,25,15
25,L1_28,10
L1_4,27,5
L1_4,5,8
5,6,35
6,A,3
A,22,5
A,21,4
A,L1_20,15
A,L1_7,3
L1_7,L1_B,5
L1_B,8,5
L1_B,C,4
C,18,5
C,17,7
C,14,5
15,L1_16,6
L1_16,17,10
17,18,10
14,15,10
8,9,3
9,19,5
9,11,3
9,10,5
9,12,8
10,L1_13,10
12,L1_13,6
11,L1_13,12
9,L1_19,3
23,22,5
L1_7,L2_7,100
L1_16,L2_16,100
L1_19,L2_19,100
L1_13,L2_13,100
L1_B,L2_B,100
29,L2_16,15
16,30,15
30,29,15
30,31,10
29,L2_B,15
31,L2_B,10
L2_19,31,10
L2_19,32,10
L2_19,33,20
32,33,18
32,L2_13,15
L1_28,L4_28,300
L4_28,34,2
34,37,5
37,35,20
35,36,5
36,38,5
L1_4,L4_4,300
L4_4,38,3
L4_28,L5_28,100
L5_28,39,30
39,40,5
40,41,5
L4_4,L5_4,100
L5_4,41,3
L2_16,L3_16,100
L2_7,L3_7,100
L2_16,L3_16,100
L2_19,L3_19,100
L2_13,L3_13,100
L2_B,L3_B,100
L3_7,42,3
42,L3_B,5
L3_B,47,8
47,L3_13,15
L3_B,45,5
45,L3_19,5
L3_B,43,10
43,48,10
43,44,5
43,45,7
43,L3_16,7
48,L3_16,5
L3_19,46,5
L4_4,L5_4,100`;

const edges: Edge[] = edgeCsv
  .trim()
  .split("\n")
  .slice(1)
  .map((line) => {
    const [from, to, distance] = line.split(",");
    return { from, to, distance: Number(distance) };
  });

function parseNodes(raw: string): Node[] {
  return raw
    .trim()
    .split("\n")
    .map((line) => line.replace(/\t+/g, " ").trim())
    .filter(Boolean)
    .map((line) => {
      const [id, coord] = line.split(/\s+/);
      const [x, y] = coord.split(",").map((v) => Number(v));
      return { id, x, y };
    });
}

const levelData = {
  "Level 1": {
    src: "/Level 1.png",
    nodes: parseNodes(`
1 1069,521
2 847,540
3 875,482
L1_4 812,556
5 809,429
6 477,433
A 443,426
L1_7 443,389
27 809,606
23 437,608
24 300,651
25 206,666
L1_28 176,628
26 274,781
22 439,458
21 345,468
L1_20 209,441
L1_B 434,321
C 350,305
14 251,300
15 57,286
L1_16 44,133
17 268,134
18 408,143
8 509,149
9 626,217
L1_19 649,135
11 679,281
12 732,203
10 760,157
L1_13 973,173
    `),
    shortestPath: ["1", "2", "27", "23", "22"] as NodeId[],
  },
  "Level 2 Block C": {
    src: "/Level 2 Block C.png",
    nodes: parseNodes(`
L2_7 664,510
L2_13 1303,300
L2_16 161,140
L2_B 586,372
L2_19 767,138
32 825,356
33 1204,132
29 260,372
30 368,134
31 563,145
    `),
    shortestPath: [] as NodeId[],
  },
  "Level 3 Block C": {
    src: "/Level 3 Block C.png",
    nodes: parseNodes(`
L3_7 799,518
L3_13 1278,277
L3_16 233,148
L3_B 701,338
L3_19 855,148
44 407,144
45 665,153
46 1094,133
47 966,331
43 442,335
48 235,316
42 703,508
    `),
    shortestPath: [] as NodeId[],
  },
  "Level 4 Block A": {
    src: "/Level 4 Block A.png",
    nodes: parseNodes(`
L4_28 1346,117
34 1351,249
37 1131,257
35 457,277
36 298,272
38 325,455
L4_4 415,471
    `),
    shortestPath: [] as NodeId[],
  },
  "Level 5 Block A": {
    src: "/Level 5 Block A.png",
    nodes: parseNodes(`
L5_28 1292,134
39 441,278
40 245,296
41 297,449
L5_4 364,462
    `),
    shortestPath: [] as NodeId[],
  },
};

type DijkstraResult = {
  path: NodeId[];
  distance: number;
};

function dijkstra(edges: Edge[], start: NodeId, goal: NodeId): DijkstraResult {
  if (start === goal) return { path: [start], distance: 0 };

  const adj = new Map<NodeId, Array<{ id: NodeId; w: number }>>();
  for (const edge of edges) {
    const w = Number.isFinite(edge.distance) ? (edge.distance as number) : 1;
    if (!adj.has(edge.from)) adj.set(edge.from, []);
    if (!adj.has(edge.to)) adj.set(edge.to, []);
    adj.get(edge.from)!.push({ id: edge.to, w });
    adj.get(edge.to)!.push({ id: edge.from, w });
  }

  const dist = new Map<NodeId, number>();
  const prev = new Map<NodeId, NodeId | null>();
  const visited = new Set<NodeId>();
  const nodes = new Set<NodeId>();

  for (const edge of edges) {
    nodes.add(edge.from);
    nodes.add(edge.to);
  }

  for (const n of nodes) {
    dist.set(n, Number.POSITIVE_INFINITY);
    prev.set(n, null);
  }
  dist.set(start, 0);

  while (visited.size < nodes.size) {
    let current: NodeId | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const n of nodes) {
      if (visited.has(n)) continue;
      const d = dist.get(n) ?? Number.POSITIVE_INFINITY;
      if (d < best) {
        best = d;
        current = n;
      }
    }

    if (current === null || best === Number.POSITIVE_INFINITY) break;
    if (current === goal) break;

    visited.add(current);
    const neighbors = adj.get(current) ?? [];
    for (const { id, w } of neighbors) {
      if (visited.has(id)) continue;
      const alt = best + w;
      if (alt < (dist.get(id) ?? Number.POSITIVE_INFINITY)) {
        dist.set(id, alt);
        prev.set(id, current);
      }
    }
  }

  if (!prev.has(goal) && start !== goal) return { path: [], distance: Number.POSITIVE_INFINITY };

  const path: NodeId[] = [];
  let cur: NodeId | null = goal;
  while (cur) {
    path.unshift(cur);
    cur = prev.get(cur) ?? null;
  }
  if (path[0] !== start) return { path: [], distance: Number.POSITIVE_INFINITY };
  return { path, distance: dist.get(goal) ?? Number.POSITIVE_INFINITY };
}

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
