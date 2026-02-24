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
        <div className="capsule-body"></div>
      </main>
    </div>
  );
}
