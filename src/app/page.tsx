'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
    <div className="app-domain">
      <header>
        <h2>Open House 2026</h2>
        <div className="buttons">
          <button className="header-button">
            <FontAwesomeIcon icon={faMap} />
          </button>
        </div>
      </header>
      <main></main>
    </div>
  );
}

