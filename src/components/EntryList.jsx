import React, { useState } from 'react';
import '../styles/EntryList.css';
import '../styles/EntryTable.css';

const EntryList = ({ entries, onEntryClick }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const filtered = entries.filter(e => {
    const s = search.toLowerCase();
    const matchesSearch = (e.customer || '').toLowerCase().includes(s) || 
                          (e.engineer || '').toLowerCase().includes(s);
    const matchesFilter = filter ? e.status === filter : true;
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div id="pageList">
      <div className="search-row" style={{ gap: '12px' }}>
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by customer or engineer..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <select className="filter-select" value={filter} onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">All Status</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Unpaid</option>
        </select>
      </div>

      <div className="table-container">
        <table className="main-table">
          <thead>
            <tr>
              <th className="id-cell">#</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Engineer</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '60px 0' }}>
                   No entries found.
                </td>
              </tr>
            ) : (
              currentItems.map((e, index) => (
                <tr key={e.id} onClick={() => onEntryClick(e)}>
                  <td className="id-cell">{indexOfFirstItem + index + 1}</td>
                  <td className="customer-cell">{e.customer}</td>
                  <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{e.phone || '—'}</td>
                  <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{e.date}</td>
                  <td>{e.engineer || '—'}</td>
                  <td>
                    <span className={`status-pill ${e.status.toLowerCase()}`} style={{ fontSize: '11px', padding: '4px 10px' }}>
                      {e.status}
                    </span>
                  </td>
                  <td className="amount-cell">₹{(parseFloat(e.amount) || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <div className="page-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filtered.length)} of {filtered.length} entries
            </div>
            <div className="page-btns">
              <button 
                className="page-btn" 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                className="page-btn" 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryList;
