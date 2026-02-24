'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapLocationDot,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
    <div className="app-domain">
      <header className="capsule-body">
        <h2>Open House '26</h2>
        <div className="buttons">
          <button className="header-button">
            <FontAwesomeIcon icon={faMapLocationDot} />
          </button>
        </div>
      </header>
      <main>
        <div className="carousel-wrapper">
          <button className="carousel-button">
            <h3>Events</h3>
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
            <h3>Full Schedule</h3>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
          <div className="capsule-body schdl-quick-look">
            <div className="schdl-title">
              <h3>One-Look Schedule</h3>
              <span></span>
            </div>
            <div className="capsule-body current-program">
              <h4>Current Program: 9:30am-10am Talk By Principal Nick Chan</h4>
            </div>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-time">9:00am</div>
                <div className="timeline-content">
                  <div className="timeline-dot"></div>
                  <div className="timeline-event">Registration Opens</div>
                </div>
              </div>
              <div className="timeline-item active">
                <div className="timeline-time">9:30am</div>
                <div className="timeline-content">
                  <div className="timeline-dot"></div>
                  <div className="timeline-event">
                    Talk By Principal Nick Chan
                  </div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-time">10:00am</div>
                <div className="timeline-content">
                  <div className="timeline-dot"></div>
                  <div className="timeline-event">School Tour</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-time">11:00am</div>
                <div className="timeline-content">
                  <div className="timeline-dot"></div>
                  <div className="timeline-event">Lab Demonstrations</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-time">12:00pm</div>
                <div className="timeline-content">
                  <div className="timeline-dot"></div>
                  <div className="timeline-event">Lunch Break</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
