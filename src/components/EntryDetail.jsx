import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabase';
import '../styles/EntryDetail.css';

const EntryDetail = ({ entry, onBack, onEdit, onDelete }) => {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    fetchParts();
  }, [entry.id]);

  const fetchParts = async () => {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('entry_id', entry.id);
    
    if (!error) setParts(data || []);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const statusClass = entry.status.toLowerCase();

  return (
    <div className="detail-container">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          Back to List
        </button>
        <div className="detail-actions">
          <button className="btn-edit" onClick={() => onEdit(entry)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            Edit
          </button>
          <button className="btn-delete" onClick={() => {
            Swal.fire({
              title: 'Are you sure?',
              text: "You won't be able to revert this!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#dc2626',
              cancelButtonColor: 'var(--gray-400)',
              confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
              if (result.isConfirmed) {
                onDelete(entry.id);
              }
            });
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>
            Delete
          </button>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-banner">
          <div className="detail-avatar-lg">{getInitials(entry.customer)}</div>
          <div className="detail-banner-info">
            <h2>{entry.customer}</h2>
            <div className="detail-meta">
              Saved: {new Date(entry.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className={`status-pill ${statusClass}`} style={{ padding: '6px 16px' }}>{entry.status}</span>
          </div>
        </div>

        <div className="detail-body">
          <div className="info-grid">
            <div className="info-item">
              <label>Customer Name</label>
              <p>{entry.customer}</p>
            </div>
            <div className="info-item">
              <label>Phone Number</label>
              <p>{entry.phone || '—'}</p>
            </div>
            <div className="info-item">
              <label>Date</label>
              <p>{formatDate(entry.date)}</p>
            </div>
            <div className="info-item">
              <label>Engineer</label>
              <p>{entry.engineer || '—'}</p>
            </div>
            <div className="info-item">
              <label>PC Count</label>
              <p>{entry.pc_count} PC {entry.pc_desc ? `(${entry.pc_desc})` : ''}</p>
            </div>
            <div className="info-item">
              <label>Notes</label>
              <p>{entry.notes || '—'}</p>
            </div>
          </div>

          <label className="section-label">Work Done</label>
          <div className="work-content">
            {entry.work_done}
          </div>

          {parts.length > 0 && (
            <>
              <label className="section-label">Parts Replaced / Added</label>
              <div className="parts-table-wrap">
                <table className="parts-table">
                  <thead>
                    <tr>
                      <th>Part Name</th>
                      <th>Qty</th>
                      <th>Cost</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((p, i) => (
                      <tr key={i}>
                        <td>{p.name}</td>
                        <td>{p.qty}</td>
                        <td>₹{p.cost.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>₹{(p.qty * p.cost).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="payment-card">
        <div>
          <div className="payment-label">Total Amount</div>
          <div className="payment-amount-lg">₹{entry.amount.toLocaleString('en-IN')}</div>
        </div>
        <div className={`status-pill ${statusClass}`} style={{ padding: '8px 24px', fontSize: '15px' }}>
          {entry.status}
        </div>
      </div>
    </div>
  );
};

export default EntryDetail;
