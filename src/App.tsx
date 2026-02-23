import { useState } from 'react';
import './App.css';
import backgroundImage from './background.png';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <div className="app">
      {/* Background Layer - Edit this section */}
      <div className="background-layer">
        <img src={backgroundImage} alt="Background" />
      </div>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>Open House '26</h1>
          </div>
          <nav className={`nav-dropdown ${isMenuOpen ? 'open' : ''}`}>
            <ul className="nav-list">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <button
            className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      {/* Main Body Area */}
      <main className="main-body">
        <div className="content-wrapper">
          {activeSection === 'home' && (
            <section className="content-section">
              <h2>Welcome Home</h2>
              <p>
                This is the home section of your mobile-first responsive app.
              </p>
            </section>
          )}

          {activeSection === 'about' && (
            <section className="content-section">
              <h2>About Us</h2>
              <p>This is the about section. Add your content here.</p>
            </section>
          )}

          {activeSection === 'services' && (
            <section className="content-section">
              <h2>Our Services</h2>
              <p>This is the services section. Add your content here.</p>
            </section>
          )}

          {activeSection === 'contact' && (
            <section className="content-section">
              <h2>Contact Us</h2>
              <p>This is the contact section. Add your content here.</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
