'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapLocationDot,
  faArrowRight,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

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
          <button className="carousel-button">
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
          <button className="schedule-button">
            <h3>See Schedule</h3>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
          <div className="capsule-body schdl-quick-look">
            <div className="schdl-title">
              <h3>Q.Look Schedule</h3>
            </div>
            <div className="capsule-body current-program">
              <h4>Ongoing: Talk By Principal Nick Chan</h4>
              <h4>Location: Block A Level 5 Auditorium</h4>
            </div>
            <div className="timeline">
              <div className="timeline-item">
                <h4 className="timeline-time">9:00am</h4>
                <div className="timeline-content">
                  <div className="timeline-dot"></div>
                  <h4 className="timeline-event">Registration Opens</h4>
                </div>
              </div>
              <div className="timeline-item active">
                <h4 className="timeline-time">9:30am</h4>
                <div className="timeline-content">
                  <div className="timeline-dot"></div>
                  <h4 className="timeline-event">
                    Talk By Principal Nick Chan
                  </h4>
                </div>
              </div>
              <div className="timeline-item">
                <h4 className="timeline-time">10:00am</h4>
                <div className="timeline-content">
                  <div className="timeline-dot"></div>
                  <h4 className="timeline-event">School Tour</h4>
                </div>
              </div>
              <div className="timeline-item">
                <h4 className="timeline-time">11:00am</h4>
                <div className="timeline-content">
                  <div className="timeline-dot"></div>
                  <h4 className="timeline-event">Lab Demonstrations</h4>
                </div>
              </div>
              <div className="timeline-item">
                <h4 className="timeline-time">12:00pm</h4>
                <div className="timeline-content">
                  <div className="timeline-dot"></div>
                  <h4 className="timeline-event">Lunch Break</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
