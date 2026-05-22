import React from 'react';
import '../styles/Header.css';

const Header = ({ entryCount, onTabChange, activeTab, onProfileClick, onLogoutClick }) => {
  return (
    <>
      <header>
          <div className="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            <span className="logo-text">PC Service Manager</span>
          </div>
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="header-badge">{entryCount} entries</div>
          <button onClick={onProfileClick} style={{ background: 'none', border: 'none', color: 'var(--gray-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '600' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="action-text">Profile</span>
          </button>
          <button onClick={onLogoutClick} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '600' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="action-text">Logout</span>
          </button>
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
