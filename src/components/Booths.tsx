'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapLocationDot,
  faXmark,
  faMagnifyingGlass,
  faRoute,
} from '@fortawesome/free-solid-svg-icons';
import booths from '@/app/booths.json';
import { venueToNode } from '@/app/venueNodes';

interface Booth {
  id: number;
  name: string;
  venue: string;
  description: string;
  image: string;
  events?: Record<string, { name: string; time: string }>;
}

interface BoothDetailProps {
  booth: Booth;
  onClose: () => void;
  onNavigate: (venue: string) => void;
}

function BoothDetail({ booth, onClose, onNavigate }: BoothDetailProps) {
  const isNavigable = booth.venue in venueToNode;
  const [closing, setClosing] = useState(false);
  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 360);
  };
  return (
    <div
      className={`booth-detail-overlay ${closing ? 'closing' : ''}`}
      onClick={requestClose}
    >
      <div className="booth-detail-card" onClick={(e) => e.stopPropagation()}>
        <div className="booth-detail-image-wrap">
          <img className="booth-detail-image" src={booth.image} alt={booth.name} />
          <button className="booth-detail-close" onClick={requestClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="booth-detail-body">
          <div className="booth-detail-title-row">
            <h3 className="booth-detail-title">{booth.name}</h3>
            {isNavigable && (
              <button
                className="booth-navigate-btn"
                onClick={() => onNavigate(booth.venue)}
              >
                <FontAwesomeIcon icon={faRoute} />
                Navigate
              </button>
            )}
          </div>
          <p className="booth-detail-venue">
            <FontAwesomeIcon icon={faMapLocationDot} />
            {booth.venue}
          </p>
          <p className="booth-detail-description">{booth.description}</p>
          {booth.events && Object.keys(booth.events).length > 0 && (
            <div className="event-rsvp-list">
              {Object.entries(booth.events).map(([eventId, event]) => (
                <div key={eventId} className="event-rsvp-item">
                  <div className="event-rsvp-meta">
                    <p className="event-rsvp-name">{event.name}</p>
                    <p className="event-rsvp-time">{event.time}</p>
                  </div>
                  <a className="event-rsvp-button" href={`/rsvp/${eventId}`}>
                    RSVP
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface BoothsProps {
  onClose: () => void;
  onNavigate: (venue: string) => void;
}

export function Booths({ onClose, onNavigate }: BoothsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterId, setEasterId] = useState('');
  const [closing, setClosing] = useState(false);
  const [easterClosing, setEasterClosing] = useState(false);

  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 360);
  };

  const closeEaster = () => {
    if (easterClosing) return;
    setEasterClosing(true);
    setTimeout(() => {
      setShowEasterEgg(false);
      setEasterClosing(false);
    }, 360);
  };

  useEffect(() => {
    if (searchQuery.trim().toLowerCase() === 'johari') {
      setShowEasterEgg(true);
      setEasterId('johari.png');
    }
    if (searchQuery.trim().toLowerCase() === 'chok') {
      setShowEasterEgg(true);
      setEasterId('chok.png');
    }
    if (searchQuery.trim().toLowerCase() === 'wan') {
      setShowEasterEgg(true);
      setEasterId('wan.jpg');
    }
  }, [searchQuery]);

  const filteredBooths = booths.filter(
    (booth) =>
      booth.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booth.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booth.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div className={`popup-overlay ${closing ? 'closing' : ''}`}>
        <div className="popup-content">
          <div className="popup-header mx">
            <h2>Booths & Programmes</h2>
            <button className="popup-close-button" onClick={requestClose}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          <div className="search-bar-container">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <div className={`search-clear-wrapper ${searchQuery ? 'visible' : ''}`}>
              <button className="search-clear-button" onClick={() => setSearchQuery('')}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          </div>
          <div className="popup-body">
            <div className="events-grid">
              {filteredBooths.map((booth) => (
                <div
                  key={booth.id}
                  className="event-card"
                  onClick={() => setSelectedBooth(booth)}
                >
                  <div className="event-image-placeholder">
                    <img src={booth.image} alt="" />
                  </div>
                  <h3 className="event-title">{booth.name}</h3>
                  <p className="event-location">
                    <FontAwesomeIcon icon={faMapLocationDot} />
                    {booth.venue}
                  </p>
                  <p className="ellipsis ">Click to learn more</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedBooth && (
        <BoothDetail booth={selectedBooth} onClose={() => setSelectedBooth(null)} onNavigate={onNavigate} />
      )}

      {showEasterEgg && (
        <div
          className={`booth-detail-overlay johari-easter-egg-overlay ${easterClosing ? 'closing' : ''}`}
          onClick={closeEaster}
        >
          <img
            src={easterId}
            alt="Johari"
            className="johari-easter-egg-image"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="booth-detail-close johari-easter-egg-close"
            onClick={closeEaster}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

    </>
  );
}
