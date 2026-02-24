'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapLocationDot,
  faArrowRight,
  faXmark,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import booths from './booths.json';
import schedule from './schedule.json';

interface Booth {
  id: number;
  name: string;
  venue: string;
  description: string;
  image: string;
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
      <div className="event-details">
        <p className="event-description">{booth.description}</p>
      </div>
    </div>
  );
}

interface ScheduleItem {
  id: number;
  time: string;
  event: string;
  venue: string;
}

function formatTime(time: string): string {
  const hour = time.slice(0, 2);
  const minute = time.slice(2);
  return `${hour}:${minute}`;
}

export default function Home() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [isEventsPopupOpen, setIsEventsPopupOpen] = useState(false);
  const [isSchedulePopupOpen, setIsSchedulePopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('1040');
  const [carouselScrollState, setCarouselScrollState] = useState({
    hasPrev: false,
    hasNext: true,
  });

  const handleCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtStart = target.scrollLeft <= 0;
    const isAtEnd =
      target.scrollLeft + target.clientWidth >= target.scrollWidth - 1;
    setCarouselScrollState({ hasPrev: !isAtStart, hasNext: !isAtEnd });
  };

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
            <div className="map-placeholder">
              <p>Interactive map coming soon...</p>
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
