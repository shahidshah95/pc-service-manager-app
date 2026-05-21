import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ServiceForm from './components/ServiceForm';
import EntryList from './components/EntryList';
import EntryDetail from './components/EntryDetail';
import './styles/global.css';

function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('id', { ascending: false });

    if (error) console.error('Fetch error:', error);
    else setEntries(data || []);
    setLoading(false);
  };

  const handleSaveEntry = async (fullData) => {
    const { parts, ...entryData } = fullData;
    
    // 1. Save the main entry
    const { data, error: entryError } = await supabase
      .from('entries')
      .upsert({ 
        ...entryData, 
        user_id: '00000000-0000-0000-0000-000000000000' 
      })
      .select();

    if (entryError) {
      Swal.fire('Error', 'Error saving entry: ' + entryError.message, 'error');
      return;
    }

    const entryId = data[0].id;

    // 2. Save parts if any
    if (parts) {
      // For updates, delete old parts first
      if (entryData.id) {
        await supabase.from('parts').delete().eq('entry_id', entryData.id);
      }

      const partsWithId = parts.map(p => ({
        entry_id: entryId,
        name: p.name,
        qty: parseInt(p.qty) || 1,
        cost: parseFloat(p.cost) || 0
      })).filter(p => p.name.trim() !== '');

      if (partsWithId.length > 0) {
        const { error: partsError } = await supabase
          .from('parts')
          .insert(partsWithId);
        
        if (partsError) {
          Swal.fire('Parts Error', 'Entry saved, but parts error: ' + partsError.message, 'warning');
        }
      }
    }

    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Service entry saved successfully.',
      timer: 1500,
      showConfirmButton: false
    });
    fetchEntries();
    setActiveTab('list');
  };

  const handleDeleteEntry = async (entryId) => {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      Swal.fire('Error', 'Error deleting entry: ' + error.message, 'error');
    } else {
      Swal.fire('Deleted!', 'Entry has been removed.', 'success');
      setSelectedEntry(null);
      fetchEntries();
    }
  };

  const handleEditEntry = async (entry) => {
    // Fetch parts first so the form has them
    const { data: partsData } = await supabase
      .from('parts')
      .select('*')
      .eq('entry_id', entry.id);
    
    setSelectedEntry({ ...entry, parts: partsData || [] });
    setActiveTab('new');
  };

  // Removed logout handler as it's no longer needed

  return (
    <div className="App">
      <Header 
        entryCount={entries.length} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <main className="main-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px' }}>
        {activeTab === 'new' ? (
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
