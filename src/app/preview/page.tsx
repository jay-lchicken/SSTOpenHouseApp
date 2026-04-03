'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocationDot, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import schedule from '@/app/schedule.json';

function formatTime(time: string): string {
  const hour = time.slice(0, 2);
  const minute = time.slice(2);
  return `${hour}:${minute}`;
}

const TARGET = new Date('2026-05-30T01:00:00Z');

function getCountdown() {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export default function Preview() {
  const [countdown, setCountdown] = useState(getCountdown);

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isLive = TARGET.getTime() - Date.now() <= 0;

  return (
    <div className="app-domain">
      <main>
        <div className="countdown-hero capsule-body">
          <p className="countdown-eyebrow">SST Open House</p>
          <h1 className="countdown-date">30 May 2026</h1>
          <p className="countdown-sub">9:00 AM · School of Science and Technology</p>

          {isLive ? (
            <div className="countdown-live">
              <span className="live-dot" />
              Live now
            </div>
          ) : (
            <div className="countdown-tiles">
              {[
                { value: countdown.days, label: 'Days' },
                { value: countdown.hours, label: 'Hours' },
                { value: countdown.minutes, label: 'Min' },
                { value: countdown.seconds, label: 'Sec' },
              ].map(({ value, label }) => (
                <div key={label} className="countdown-tile">
                  <span className="countdown-tile-value">
                    {String(value).padStart(2, '0')}
                  </span>
                  <span className="countdown-tile-label">{label}</span>
                </div>
              ))}
            </div>
          )}


        </div>

        <div className="sched-preview capsule-body">
          <h3 className="sched-preview-title">Schedule</h3>
          <div className="sched-preview-list">
            {schedule.map((item) => (
              <div key={item.id} className="sched-preview-item">
                <span className="sched-preview-time">{formatTime(item.time)}</span>
                <div className="sched-preview-divider" />
                <div className="sched-preview-info">
                  <p className="sched-preview-event">{item.event}</p>
                  {item.venue && (
                    <p className="sched-preview-venue">
                      <FontAwesomeIcon icon={faMapLocationDot} />
                      {item.venue}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
