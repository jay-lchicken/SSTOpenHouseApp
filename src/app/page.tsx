'use client';

import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapLocationDot,
  faArrowRight,
  faXmark,
  faMagnifyingGlass,
  faRoute,
} from '@fortawesome/free-solid-svg-icons';
import booths from './booths.json';
import schedule from './schedule.json';
import { GraphCanvas } from '@/components/GraphCanvas';
import { edges, levelData, dijkstra, type NodeId } from '@/app/graphData';
import { venueToNode } from '@/app/venueNodes';

interface Booth {
  id: number;
  name: string;
  venue: string;
  description: string;
  image: string;
  events?: Record<string, { name: string; time: string }>;
}

interface EventCardProps {
  booth: Booth;
}

function EventCard({ booth }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`event-card ${isExpanded ? 'expanded' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="event-image-placeholder">
        <img src={booth.image} alt="" />
      </div>
      <h3 className="event-title">{booth.name}</h3>
      <p className="event-location">
        <FontAwesomeIcon icon={faMapLocationDot} />
        {booth.venue}
      </p>
      {!isExpanded && (
          <p className={"ellipsis"}>...</p>
      )}
      <div className="event-details">
        <p className="event-description">{booth.description}</p>
        {booth.events && Object.keys(booth.events).length > 0 && (
          <div className="event-rsvp-list">
            {Object.entries(booth.events).map(([eventId, event]) => (
              <div key={eventId} className="event-rsvp-item">
                <div className="event-rsvp-meta">
                  <p className="event-rsvp-name">{event.name}</p>
                  <p className="event-rsvp-time">{event.time}</p>
                </div>
                <a
                  className="event-rsvp-button"
                  href={`/rsvp/${eventId}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  RSVP
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ScheduleItem {
  id: number;
  time: string;
  event: string;
  venue: string;
  eventId?: string;
}

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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('1040');
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
    (Object.keys(levelData) as Array<keyof typeof levelData>).forEach(
      (key) => {
        map.set(key, new Set(levelData[key].nodes.map((n) => n.id)));
      },
    );
    return map;
  }, []);

  const navLevels = useMemo(() => {
    const levels: Array<keyof typeof levelData> = [];
    if (!navResult.path.length) return levels;
    for (const levelKey of Object.keys(levelData) as Array<
      keyof typeof levelData
    >) {
      const nodeSet = levelNodesMap.get(levelKey)!;
      if (navResult.path.some((id) => nodeSet.has(id))) levels.push(levelKey);
    }
    return levels;
  }, [navResult.path, levelNodesMap]);

  // useEffect(() => {
  //   const getCurrentTime = () => {
  //     const now = new Date();
  //     const hours = now.getHours().toString().padStart(2, '0');
  //     const minutes = now.getMinutes().toString().padStart(2, '0');
  //     return hours + minutes;
  //   };
  //   setCurrentTime(getCurrentTime());
  //   const interval = setInterval(() => setCurrentTime(getCurrentTime()), 60000);
  //   return () => clearInterval(interval);
  // }, []);

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

  const filteredBooths = booths.filter(
    (booth) =>
      booth.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booth.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booth.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );
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
                    (edge) =>
                      nodeSet.has(edge.from) && nodeSet.has(edge.to),
                  );
                  const levelPath = navResult.path.filter((id) =>
                    nodeSet.has(id),
                  );
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
                  <img src="banner1.png" alt="banner 1" />
                </div>
                <div className="carousel-item">
                  <img src="banner1.png" alt="banner 2" />
                </div>
                <div className="carousel-item">
                  <img src="banner1.png" alt="banner 3" />
                </div>
                <div className="carousel-item">
                  <img src="banner1.png" alt="banner 4" />
                </div>
                <div className="carousel-item">
                  <img src="banner1.png" alt="banner 5" />
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
        <p className="credits">Made by Hong Yu & Leung Yin of S304</p>
      </main>
      {isEventsPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header mx">
              <h2>Booths & Programmes</h2>
              <button
                className="popup-close-button"
                onClick={() => setIsEventsPopupOpen(false)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="search-bar-container">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="search-icon"
              />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <div
                className={`search-clear-wrapper ${searchQuery ? 'visible' : ''}`}
              >
                <button
                  className="search-clear-button"
                  onClick={() => setSearchQuery('')}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>
            <div className="popup-body">
              <div className="events-grid">
                {filteredBooths.map((booth) => (
                  <EventCard key={booth.id} booth={booth} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Popup */}
      {isSchedulePopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Event Schedule</h2>
              <button
                className="popup-close-button"
                onClick={() => setIsSchedulePopupOpen(false)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="popup-body">
              <div className="popup-timeline">
                {schedule.map((item, index) => (
                  <div
                    key={item.id}
                    className={`popup-timeline-item ${index === activeIndex ? 'active' : ''}`}
                  >
                    {index === activeIndex && (
                      <span className="popup-ongoing-label">Ongoing</span>
                    )}
                    <h4 className="popup-timeline-time">
                      {formatTime(item.time)}
                    </h4>
                    <div className="popup-timeline-content">
                      <div className="popup-timeline-dot"></div>
                      <h4 className="popup-timeline-event">{item.event}</h4>
                    </div>
                    {item.venue && (
                      <p className="popup-timeline-venue">
                        <FontAwesomeIcon icon={faMapLocationDot} />
                        {item.venue}
                      </p>
                    )}
                    {item.eventId && (
                        <a
                  className="event-rsvp-button"
                  href={`/rsvp/${item.eventId}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  RSVP
                </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
