# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js, localhost:3000)
npm run build    # Production build
npm run lint     # ESLint via Next.js
npx tsc --noEmit # Type-check without emitting (run after changes)
```

There are no automated tests.

## Architecture

Next.js 15 App Router app with a single main page (`src/app/page.tsx`). All UI is client-side (`'use client'`).

### Navigation / Pathfinding

The core feature is an in-building navigation system:

- **`src/app/graphData.ts`** — All graph data (nodes, edges as CSV), Dijkstra implementation, and `levelData` (per-floor node coordinates + floor plan image paths). The graph has 5 floors; inter-level edges (weight 100) connect staircase/elevator nodes named with the pattern `LX_Y` (e.g. `L1_7 ↔ L2_7`).
- **`src/app/venueNodes.ts`** — Maps human-readable venue names → node IDs. Not every graph node is a venue.
- **`src/components/GraphCanvas.tsx`** — Canvas renderer. Draws the floor plan image, a path with glow + directional arrow chevrons, and Start/End pin markers. Takes `shortestPath: NodeId[]` in traversal order; uses this order directly for arrow direction (not the edge list).
- **`src/app/page.tsx`** — Orchestrates navigation state. Key memos:
  - `levelNodesMap` — stable Set<NodeId> per level, computed once on mount
  - `levelEdgesMap` — pre-filtered edges per level, stable after mount
  - `connectorNodes` — nodes that appear in cross-level edges; used to skip pure-transit floors in the map display
  - `navLevels` — ordered list of levels the path touches, with transit-only levels filtered out

### UI Structure

The page has a collapsible header (glassmorphism capsule, `border-radius: 35px`) that expands to full-screen for navigation. When collapsed it shows a "Get Directions" CTA button. The rest of the page has a carousel, a quick-look schedule widget, and popup modals for Booths and Schedule.

All styling is in `src/app/globals.css` (one large file, no CSS modules). The design language is glassmorphism: `background: rgba(255,255,255,0.15)`, `backdrop-filter: blur(20px) saturate(180%)`, `border-radius: 35px`, `box-shadow: 0 4px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.4)`. Match this for any new interactive capsule elements.

### Data Files

- `src/app/booths.json` — booth list with `{ id, name, venue, description, image, events? }`
- `src/app/schedule.json` — event list with `{ id, event, time, venue }` where `time` is `"HHMM"` (SGT)
- `public/Level*.png` / `*.avif` — floor plan images and booth images

### Key Constraints

- Venue names in `booths.json` don't all have entries in `venueToNode` — always guard with `venue in venueToNode` before treating a booth as navigable.
- The `getSGTTime` / `parseTime` / `formatTime` helpers in `page.tsx` are module-level functions — don't inline them or add duplicates.
- Canvas drawing in `GraphCanvas` uses the `shortestPath` array order for arrow direction. Do not substitute the edge list for this purpose.
