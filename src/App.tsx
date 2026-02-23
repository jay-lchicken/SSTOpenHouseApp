import { useState } from 'react';
import './App.css';
import sstInfo from './data/sst-info.json';
import sstProgrammes from './data/sst-programmes.json';
import sstCcas from './data/sst-ccas.json';
import sstContact from './data/sst-contact.json';
import sstAdmissions from './data/sst-admissions.json';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'programmes', label: 'Programmes' },
    { id: 'ccas', label: 'CCAs' },
    { id: 'admissions', label: 'Admissions' },
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
      {/* Background Layer */}
      <div className="background-layer" />
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
            <>
              <section className="content-section">
                <h2>Welcome to {sstInfo.shortName} Open House '26</h2>
                <p>{sstInfo.description}</p>
              </section>
              <section className="content-section">
                <h2>Our Mission</h2>
                <p>{sstInfo.mission}</p>
                <h2 style={{ marginTop: '1.5rem' }}>Our Vision</h2>
                <p>{sstInfo.vision}</p>
              </section>
              <section className="content-section">
                <h2>Our Values</h2>
                {sstInfo.values.map((value, index) => (
                  <div className="value-item" key={value.name}>
                    <div className="value-icon">{value.name.charAt(0)}</div>
                    <div className="value-text">
                      <strong>{value.name}</strong>
                      <br />
                      <span>{value.description}</span>
                    </div>
                  </div>
                ))}
              </section>
              <section className="content-section">
                <h2>Highlights</h2>
                {sstInfo.highlights.map((highlight, index) => (
                  <div className="highlight-item" key={index}>
                    <div className="highlight-bullet" />
                    <span className="highlight-text">{highlight}</span>
                  </div>
                ))}
              </section>
            </>
          )}

          {activeSection === 'programmes' && (
            <>
              <section className="content-section">
                <h2>Academic Programmes</h2>
                <p>{sstProgrammes.overview}</p>
              </section>
              <section className="content-section">
                <h2>Applied Subjects</h2>
                {sstProgrammes.appliedSubjects.map((subject) => (
                  <div className="sub-card" key={subject.name}>
                    <h3>{subject.name}</h3>
                    <p>{subject.description}</p>
                    <ul>
                      {subject.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
              <section className="content-section">
                <h2>Core Subjects</h2>
                <ul>
                  {sstProgrammes.coreSubjects.map((subject, i) => (
                    <li key={i}>{subject}</li>
                  ))}
                </ul>
              </section>
              <section className="content-section">
                <h2>Enrichment Programmes</h2>
                {sstProgrammes.enrichmentProgrammes.map((prog) => (
                  <div className="sub-card" key={prog.name}>
                    <h3>{prog.name}</h3>
                    <p>{prog.description}</p>
                  </div>
                ))}
              </section>
            </>
          )}

          {activeSection === 'ccas' && (
            <>
              <section className="content-section">
                <h2>Co-Curricular Activities</h2>
                <p>{sstCcas.overview}</p>
              </section>
              {sstCcas.categories.map((category) => (
                <section className="content-section" key={category.name}>
                  <h2>{category.name}</h2>
                  {category.ccas.map((cca) => (
                    <div className="sub-card" key={cca.name}>
                      <h3>{cca.name}</h3>
                      <p>{cca.description}</p>
                    </div>
                  ))}
                </section>
              ))}
            </>
          )}

          {activeSection === 'admissions' && (
            <>
              <section className="content-section">
                <h2>Admissions</h2>
                <p>{sstAdmissions.overview}</p>
                <p><strong>Eligibility:</strong> {sstAdmissions.eligibility}</p>
              </section>
              <section className="content-section">
                <h2>DSA Process</h2>
                <p style={{ marginBottom: '1rem' }}>{sstAdmissions.dsaProcess.description}</p>
                {sstAdmissions.dsaProcess.steps.map((step) => (
                  <div className="step-card" key={step.step}>
                    <div className="step-number">{step.step}</div>
                    <div className="step-content">
                      <strong>{step.title}</strong>
                      <br />
                      <span style={{ color: '#666' }}>{step.description}</span>
                    </div>
                  </div>
                ))}
              </section>
              <section className="content-section">
                <h2>DSA Talent Areas</h2>
                <ul>
                  {sstAdmissions.dsaTalentAreas.map((area, i) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </section>
              <section className="content-section">
                <h2>Typical Timeline</h2>
                <p><em>{sstAdmissions.importantDates.note}</em></p>
                <ul>
                  {sstAdmissions.importantDates.typicalTimeline.map((item, i) => (
                    <li key={i}>
                      <strong>{item.period}:</strong> {item.event}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="content-section">
                <h2>School Fees</h2>
                <p>{sstAdmissions.schoolFees.note}</p>
                <p>{sstAdmissions.schoolFees.financialAssistance}</p>
              </section>
            </>
          )}

          {activeSection === 'contact' && (
            <>
              <section className="content-section">
                <h2>Contact Us</h2>
                <p><strong>Address:</strong> {sstContact.address.full}</p>
                <p><strong>Phone:</strong> {sstContact.phone}</p>
                <p><strong>Fax:</strong> {sstContact.fax}</p>
                <p><strong>Email:</strong> {sstContact.email}</p>
                <p>
                  <strong>Website:</strong>{' '}
                  <a href={sstContact.website} target="_blank" rel="noopener noreferrer">
                    {sstContact.website}
                  </a>
                </p>
              </section>
              <section className="content-section">
                <h2>Office Hours</h2>
                <p><strong>School Days:</strong> {sstContact.operatingHours.schoolDays}</p>
                <p><strong>Office Hours:</strong> {sstContact.operatingHours.officeHours}</p>
                <p><strong>Closed on:</strong> {sstContact.operatingHours.closedOn}</p>
              </section>
              <section className="content-section">
                <h2>Getting There</h2>
                <p><strong>Nearest MRT:</strong> {sstContact.gettingThere.nearestMRT}</p>
                <p><strong>Bus Services:</strong> {sstContact.gettingThere.busServices}</p>
                <p>{sstContact.gettingThere.directions}</p>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p><strong>{sstInfo.name}</strong></p>
          <p>{sstContact.address.full}</p>
          <div className="footer-divider" />
          <p className="footer-copyright">
            © 2026 {sstInfo.shortName} Open House. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
