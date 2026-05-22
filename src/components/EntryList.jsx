import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import '../styles/EntryList.css';
import '../styles/EntryTable.css';

const EntryList = ({ entries, onEntryClick }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
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

    let matchesDate = true;
    if (startDate || endDate) {
      const entryDate = new Date(e.date);
      // Reset time to start of day for pure date comparison
      entryDate.setHours(0,0,0,0);
      
      if (startDate) {
         const start = new Date(startDate);
         start.setHours(0,0,0,0);
         if (entryDate < start) matchesDate = false;
      }
      if (endDate && matchesDate) {
         const end = new Date(endDate);
         end.setHours(0,0,0,0);
         if (entryDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesFilter && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToExcel = () => {
    if (filtered.length === 0) return;
    
    const dataToExport = filtered.map(e => ({
      'ID': e.id,
      'Customer': e.customer,
      'Phone': e.phone || '',
      'Date': formatDate(e.date),
      'Engineer': e.engineer || '',
      'Status': e.status,
      'Amount (₹)': parseFloat(e.amount) || 0,
      'PC Count': e.pc_count || 1,
      'Description': e.pc_desc || '',
      'Work Done': e.work_done || '',
      'Notes': e.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Service Entries");
    
    let filename = 'Service_Entries.xlsx';
    if (startDate || endDate) {
      const fromStr = startDate ? startDate.toISOString().split('T')[0] : 'Start';
      const toStr = endDate ? endDate.toISOString().split('T')[0] : 'Now';
      filename = `Service_Entries_${fromStr}_to_${toStr}.xlsx`;
    }

    XLSX.writeFile(workbook, filename);
  };

  return (
    <div id="pageList">
      <div className="search-row" style={{ gap: '12px', flexWrap: 'wrap' }}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by customer or engineer..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="date-filter-group">
          <DatePicker
            selected={startDate}
            onChange={(date) => { setStartDate(date); setCurrentPage(1); }}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="dd/MM/yyyy"
            placeholderText="From Date"
            className="filter-select dt-picker"
          />
          <span style={{ color: 'var(--text-muted)' }}>-</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => { setEndDate(date); setCurrentPage(1); }}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="dd/MM/yyyy"
            placeholderText="To Date"
            className="filter-select dt-picker"
          />
        </div>
        <select className="filter-select" value={filter} onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">All Status</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Unpaid</option>
        </select>
        <button 
          onClick={exportToExcel}
          disabled={filtered.length === 0}
          className="btn btn-primary export-btn"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
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
                  <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{formatDate(e.date)}</td>
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
