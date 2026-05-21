import React from 'react';
import '../styles/Header.css';

const Header = ({ entryCount, onTabChange, activeTab }) => {
  return (
    <>
      <header>
        <a
          href="https://pc-service-manager-app.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <div className="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            PC Service Manager
          </div>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="header-badge">{entryCount} entries</div>
        </div>
      </header>

      <div className="nav-bar">
        <button 
          className={`nav-tab ${activeTab === 'new' ? 'active' : ''}`} 
          onClick={() => onTabChange('new')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New Service Call
        </button>
        <button 
          className={`nav-tab ${activeTab === 'list' ? 'active' : ''}`} 
          onClick={() => onTabChange('list')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
          All Entries <span className="count-badge">{entryCount}</span>
        </button>
      </div>
    </>
  );
};

export default Header;
