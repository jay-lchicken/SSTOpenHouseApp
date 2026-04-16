'use client';

import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapLocationDot,
  faArrowRight,
  faXmark,
  faRoute,
} from '@fortawesome/free-solid-svg-icons';
import schedule from './schedule.json';
import { GraphCanvas } from '@/components/GraphCanvas';
import { Schedule } from '@/components/Schedule';
import { Booths } from '@/components/Booths';
import { edges, levelData, dijkstra, type NodeId } from '@/app/graphData';
import { venueToNode } from '@/app/venueNodes';

function formatTime(time: string): string {
  const hour = time.slice(0, 2);
  const minute = time.slice(2);
  return `${hour}:${minute}`;
}

const venueNames = Object.keys(venueToNode).sort();

export default function Home() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [isEventsPopupOpen, setIsEventsPopupOpen] = useState(false);
  const [isSchedulePopupOpen, setIsSchedulePopupOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    const sgtMinutes =
      (now.getUTCHours() * 60 + now.getUTCMinutes() + 8 * 60) % (24 * 60);
    return (
      Math.floor(sgtMinutes / 60)
        .toString()
        .padStart(2, '0') + (sgtMinutes % 60).toString().padStart(2, '0')
    );
  });
  const [navFrom, setNavFrom] = useState(venueNames[0] ?? '');
  const [navTo, setNavTo] = useState(venueNames[1] ?? '');

  const navResult = useMemo(() => {
    const startNode = venueToNode[navFrom];
    const endNode = venueToNode[navTo];
    if (!startNode || !endNode || startNode === endNode)
      return { path: [] as NodeId[], distance: 0 };
    return dijkstra(edges, startNode, endNode);
  }, [navFrom, navTo]);

  const levelNodesMap = useMemo(() => {
    const map = new Map<keyof typeof levelData, Set<NodeId>>();
    (Object.keys(levelData) as Array<keyof typeof levelData>).forEach((key) => {
      map.set(key, new Set(levelData[key].nodes.map((n) => n.id)));
    });
    return map;
  }, []);

  const navLevels = useMemo(() => {
    if (!navResult.path.length) return [] as Array<keyof typeof levelData>;
    const levelKeys = Object.keys(levelData) as Array<keyof typeof levelData>;
    const firstIndex = new Map<keyof typeof levelData, number>();
    for (const levelKey of levelKeys) {
      const nodeSet = levelNodesMap.get(levelKey)!;
      const idx = navResult.path.findIndex((id) => nodeSet.has(id));
      if (idx !== -1) firstIndex.set(levelKey, idx);
    }
    return [...firstIndex.keys()].sort(
      (a, b) => firstIndex.get(a)! - firstIndex.get(b)!,
    );
  }, [navResult.path, levelNodesMap]);

  useEffect(() => {
    const getSGTTime = () => {
      const now = new Date();
      const sgtMinutes =
        (now.getUTCHours() * 60 + now.getUTCMinutes() + 8 * 60) % (24 * 60);
      return (
        Math.floor(sgtMinutes / 60)
          .toString()
          .padStart(2, '0') + (sgtMinutes % 60).toString().padStart(2, '0')
      );
    };
    const interval = setInterval(() => setCurrentTime(getSGTTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  const parseTime = (timeStr: string): number => {
    const hour = parseInt(timeStr.slice(0, 2));
    const minute = parseInt(timeStr.slice(2));
    return hour * 60 + minute;
  };

  const currentTimeMinutes = parseTime(currentTime);

  let activeIndex = schedule.reduce((lastIndex, item, index) => {
    const itemTime = parseTime(item.time);
    return itemTime <= currentTimeMinutes ? index : lastIndex;
  }, 0);

  if (activeIndex === -1) activeIndex = 0;

  const upcomingEvents = schedule.slice(activeIndex, activeIndex + 5);

  return (
    <div className="app-domain">
      <header
        className={`capsule-body header-expandable ${isHeaderExpanded ? 'expanded' : ''}`}
      >
        <div className="header-top">
          <h2>Open House '26</h2>
          <button
            className="header-button"
            onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
          >
            <FontAwesomeIcon
              icon={isHeaderExpanded ? faXmark : faMapLocationDot}
            />
          </button>
        </div>
        <div className="header-expanded-content">
          <div className="map-content">
            <div className="nav-controls">
              <div className="nav-row">
                <FontAwesomeIcon icon={faRoute} className="nav-icon" />
                <div className="nav-selects">
                  <div className="nav-field">
                    <span className="nav-label">From</span>
                    <select
                      className="nav-select"
                      value={navFrom}
                      onChange={(e) => setNavFrom(e.target.value)}
                    >
                      {venueNames.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="nav-field">
                    <span className="nav-label">To</span>
                    <select
                      className="nav-select"
                      value={navTo}
                      onChange={(e) => setNavTo(e.target.value)}
                    >
                      {venueNames.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {navFrom === navTo && (
                <p className="nav-hint">Select different locations</p>
              )}
              {navFrom !== navTo && navResult.path.length === 0 && (
                <p className="nav-hint">No path found</p>
              )}
            </div>
            <div className="nav-maps">
              {navResult.path.length > 0 &&
                navLevels.map((levelKey) => {
                  const levelInfo = levelData[levelKey];
                  const nodeSet = levelNodesMap.get(levelKey)!;
                  const levelEdges = edges.filter(
                    (edge) => nodeSet.has(edge.from) && nodeSet.has(edge.to),
                  );
                  const levelPath = navResult.path.filter((id) =>
                    nodeSet.has(id),
                  );
                  const globalStart = navResult.path[0];
                  const globalEnd = navResult.path[navResult.path.length - 1];
                  return (
                    <div key={levelKey} className="nav-map-section">
                      <h4 className="nav-map-label">{levelKey}</h4>
                      <div className="nav-canvas-wrap">
                        <GraphCanvas
                          nodes={levelInfo.nodes}
                          edges={levelEdges}
                          shortestPath={levelPath}
                          mapSrc={levelInfo.src}
                          width={800}
                          height={600}
                          showAllEdges={false}
                          showAllNodes={false}
                          startNodeId={nodeSet.has(globalStart) ? globalStart : undefined}
                          endNodeId={nodeSet.has(globalEnd) ? globalEnd : undefined}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="carousel-wrapper">
          <button
            className="carousel-button"
            onClick={() => setIsEventsPopupOpen(true)}
          >
            <h3>All Events</h3>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
          <div className="capsule-body carousel">
            <div className="carousel-container">
              <div className="carousel-track">
                <div className="carousel-item">
                  <img src="banner1.avif" alt="banner 1" />
                </div>
                <div className="carousel-item">
                  <img src="banner1.avif" alt="banner 2" />
                </div>
                <div className="carousel-item">
                  <img src="banner1.avif" alt="banner 3" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="quicklook-wrapper">
          <button
            className="schedule-button"
            onClick={() => setIsSchedulePopupOpen(true)}
          >
            <h3>See Schedule</h3>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
          <div className="capsule-body schdl-quick-look">
            <div className="schdl-title">
              <h3>Q.Look Schedule</h3>
            </div>
            <div className="timeline">
              {upcomingEvents.map((item, index) => (
                <div
                  key={item.id}
                  className={`timeline-item ${index === 0 ? 'active' : ''}`}
                >
                  {index === 0 && (
                    <span className="ongoing-label">Ongoing</span>
                  )}
                  <h4 className="timeline-time">{formatTime(item.time)}</h4>
                  <div className="timeline-content">
                    <div className="timeline-dot"></div>
                    <h4 className="timeline-event">{item.event}</h4>
                  </div>
                  {index === 0 && (
                    <p className="popup-timeline-venue">
                      <FontAwesomeIcon icon={faMapLocationDot} />
                      {item.venue}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="credits">
          Made by Hong Yu & Leung Yin of S304 NOT ASSOCIATED WITH SSTINC
        </p>
      </main>
      {isEventsPopupOpen && (
        <Booths onClose={() => setIsEventsPopupOpen(false)} />
      )}

      {isSchedulePopupOpen && (
        <Schedule onClose={() => setIsSchedulePopupOpen(false)} />
      )}
    </div>
  );
}
