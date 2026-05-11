'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocationDot, faXmark } from '@fortawesome/free-solid-svg-icons';
import schedule from '@/app/schedule.json';

function formatTime(time: string): string {
  const hour = time.slice(0, 2);
  const minute = time.slice(2);
  return `${hour}:${minute}`;
}

function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return hours + minutes;
}

function parseTime(timeStr: string): number {
  const hour = parseInt(timeStr.slice(0, 2));
  const minute = parseInt(timeStr.slice(2));
  return hour * 60 + minute;
}

function getActiveIndex(currentTime: string): number {
  const currentTimeMinutes = parseTime(currentTime);
  let activeIndex = schedule.reduce((lastIndex, item, index) => {
    const itemTime = parseTime(item.time);
    return itemTime <= currentTimeMinutes ? index : lastIndex;
  }, 0);
  if (activeIndex === -1) activeIndex = 0;
  return activeIndex;
}

interface ScheduleProps {
  onClose: () => void;
}

export function Schedule({ onClose }: ScheduleProps) {
  const [currentTime, setCurrentTime] = useState(getCurrentTime);
  const [closing, setClosing] = useState(false);
  const activeIndex = getActiveIndex(currentTime);

  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 360);
  };

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(getCurrentTime()), 60000);
    return () => clearInterval(interval);

  }, []);


  return (
    <div className={`popup-overlay ${closing ? 'closing' : ''}`}>
      <div className="popup-content">
        <div className="popup-header">
          <h2>Event Schedule</h2>
          <button
            className="popup-close-button"
            onClick={requestClose}
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
  );
}
