import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { supabase, withRetry, onConnectionChange } from './lib/supabase';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ServiceForm from './components/ServiceForm';
import EntryList from './components/EntryList';
import EntryDetail from './components/EntryDetail';
import Login from './components/Login';
import ProfileSettings from './components/ProfileSettings';
import './styles/global.css';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [fetchError, setFetchError] = useState(false);
  const [session, setSession] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  // ─── Fetch Entries (with retry) ──────────────────────────────────────────
  const fetchEntries = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setFetchError(false);

    const result = await withRetry(() =>
      supabase
        .from('entries')
        .select('*')
        .order('id', { ascending: false })
    );

    if (result?.error) {
      console.error('Fetch error after retries:', result.error);
      setFetchError(true);
    } else {
      setEntries(result?.data || []);
    }
    setLoading(false);
  }, []);

  // ─── On mount: fetch + listen for online/offline ──────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchEntries();
      setIsInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchEntries();
    });


    // Native browser events for immediate UI update
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // When Supabase connection is verified restored → silent refetch
    const unsubscribe = onConnectionChange((ok) => {
      setIsOnline(ok);
      if (ok) fetchEntries(true); // silent refetch
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
      subscription.unsubscribe();
    };
  }, [fetchEntries]);

  // ─── Save Entry (with retry) ─────────────────────────────────────────────
  const handleSaveEntry = async (fullData) => {
    const { parts, ...entryData } = fullData;

    const result = await withRetry(() =>
      supabase
        .from('entries')
        .upsert({ ...entryData, user_id: '00000000-0000-0000-0000-000000000000' })
        .select()
    );

    if (result?.error) {
      Swal.fire('Error', 'Error saving entry: ' + result.error.message, 'error');
      return;
    }

    const entryId = result.data[0].id;

    if (parts) {
      if (entryData.id) {
        await withRetry(() =>
          supabase.from('parts').delete().eq('entry_id', entryData.id)
        );
      }

      const partsWithId = parts
        .map(p => ({
          entry_id: entryId,
          name: p.name,
          qty: parseInt(p.qty) || 1,
          cost: parseFloat(p.cost) || 0,
        }))
        .filter(p => p.name.trim() !== '');

      if (partsWithId.length > 0) {
        const partsResult = await withRetry(() =>
          supabase.from('parts').insert(partsWithId)
        );
        if (partsResult?.error) {
          Swal.fire('Parts Warning', 'Entry saved, but parts error: ' + partsResult.error.message, 'warning');
        }
      }
    }

    Swal.fire({
      icon: 'success',
      title: 'Saved!',
      text: 'Service entry saved successfully.',
      timer: 1500,
      showConfirmButton: false,
      confirmButtonColor: 'var(--primary)'
    });
    setSelectedEntry(null);
    fetchEntries();
    setActiveTab('list');
  };

  // ─── Delete Entry (with retry) ───────────────────────────────────────────
  const handleDeleteEntry = async (entryId) => {
    const result = await withRetry(() =>
      supabase.from('entries').delete().eq('id', entryId)
    );

    if (result?.error) {
      Swal.fire('Error', 'Error deleting entry: ' + result.error.message, 'error');
    } else {
      Swal.fire('Deleted!', 'Entry has been removed.', 'success');
      setSelectedEntry(null);
      fetchEntries();
    }
  };

  // ─── Edit Entry (with retry) ─────────────────────────────────────────────
  const handleEditEntry = async (entry) => {
    const result = await withRetry(() =>
      supabase.from('parts').select('*').eq('entry_id', entry.id)
    );
    setSelectedEntry({ ...entry, parts: result?.data || [] });
    setActiveTab('new');
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: "Are you sure you want to end your session?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
      await supabase.auth.signOut();
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (isInitializing) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!session) {
    return <Login onLoginSuccess={setSession} />;
  }

  return (
    <div className="App">
      {showProfile && <ProfileSettings onClose={() => setShowProfile(false)} />}
      {/* ── Connection Banner ── */}
      {!isOnline && (
        <div style={{
          background: 'linear-gradient(90deg, #ef4444, #dc2626)',
          color: '#fff',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          zIndex: 9999,
          position: 'relative',
        }}>
          <span>📴</span> No internet connection — changes will not be saved until you reconnect.
        </div>
      )}
      {fetchError && isOnline && (
        <div style={{
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          color: '#fff',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <span>⚠️</span> Could not load data from server.
          <button
            onClick={() => fetchEntries()}
            style={{
              marginLeft: '12px',
              background: 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.5)',
              color: '#fff',
              borderRadius: '6px',
              padding: '2px 10px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '700',
            }}
          >
            Retry
          </button>
        </div>
      )}

      <Header
        entryCount={entries.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onProfileClick={() => setShowProfile(true)}
        onLogoutClick={handleLogout}
      />

      <main className="main-content">
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            gap: '16px',
            color: 'var(--gray-500)',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--gray-200)',
              borderTop: '3px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Connecting to database...</span>
          </div>
        ) : activeTab === 'new' ? (
          <ServiceForm
            key={selectedEntry?.id || 'new'}
            onSave={handleSaveEntry}
            onCancel={() => { setSelectedEntry(null); setActiveTab('list'); }}
            editData={selectedEntry}
          />
        ) : selectedEntry ? (
          <EntryDetail
            entry={selectedEntry}
            onBack={() => setSelectedEntry(null)}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
          />
        ) : (
          <>
            <Dashboard entries={entries} />
            <EntryList entries={entries} onEntryClick={setSelectedEntry} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
