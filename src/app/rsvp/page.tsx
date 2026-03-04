import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function rsvp() {
  return (
    <div className="app-domain rsvp-page">
      <div className="texts">
        <h1>
          <span>RSVP</span> for SST Open House 2026!
        </h1>
        <h3>
          Get ready for immersive experiences to help decide if SST is the
          school for you!
        </h3>
        <div className="but-cont">
          <button className="rsvp-button">
            <h3>RSVP NOW!</h3>
          </button>
        </div>
      </div>
    </div>
  );
}
