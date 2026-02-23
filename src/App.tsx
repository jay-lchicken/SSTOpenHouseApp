import React from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap } from '@fortawesome/free-solid-svg-icons';

function App() {
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

export default App;
