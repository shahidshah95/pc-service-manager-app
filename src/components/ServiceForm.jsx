import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/ServiceForm.css';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ServiceForm = ({ onSave, onCancel, editData = null }) => {
  const [formData, setFormData] = useState({
    id: editData?.id || undefined,      // ← required for upsert to UPDATE (not insert)
    customer: editData?.customer || '',
    date: editData?.date || new Date().toISOString().slice(0, 10),
    engineer: editData?.engineer || '',
    pc_count: editData?.pc_count || 1,
    pc_desc: editData?.pc_desc || '',
    work_done: editData?.work_done || '',
    amount: editData?.amount || 0,
    status: editData?.status || 'Paid',
    notes: editData?.notes || '',
    phone: editData?.phone || ''
  });

  const [parts, setParts] = useState(editData?.parts || []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Numeric only for phone
    if (name === 'phone') {
      if (value !== '' && !/^\d+$/.test(value)) return;
      if (value.length > 10) return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addPart = () => {
    setParts([...parts, { name: '', qty: 1, cost: 0 }]);
  };

  const removePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handlePartChange = (index, field, value) => {
    const newParts = [...parts];
    newParts[index][field] = value;
    setParts(newParts);
  };

  const partsTotal = parts.reduce((sum, p) => sum + (parseFloat(p.qty) || 0) * (parseFloat(p.cost) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer) {
      return Swal.fire({
        icon: 'warning',
        title: 'Missing Field',
        text: 'Please enter the customer name.',
        confirmButtonColor: '#2563eb'
      });
    }

    if (!formData.phone || formData.phone.length !== 10) {
      return Swal.fire({
        icon: 'error',
        title: 'Phone Number Required',
        text: 'Please enter a valid 10-digit phone number.',
        confirmButtonColor: '#dc2626'
      });
    }

    onSave({ ...formData, parts });
  };

  return (
    <div id="pageNew">
      {editData && (
        <div id="editBanner" style={{ background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: '10px', padding: '10px 16px', marginBottom: '14px', fontSize: '13px', color: '#e65100', fontWeight: '600' }}>
          ✏️ Editing Entry — please save or cancel changes
          <button onClick={onCancel} style={{ float: 'right', background: 'none', border: 'none', color: '#e65100', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>✕ Cancel</button>
        </div>
      )}

      {/* Customer */}
      <div className="card">
        <div className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Customer Details
        </div>
        <div className="field-row">
          <div className="field-group">
            <label>Customer Name <span className="required">*</span></label>
            <input type="text" name="customer" id="f_customer" value={formData.customer} onChange={handleChange} placeholder="e.g. John Doe, ABC Shop..."/>
          </div>
          <div className="field-group">
            <label>Date <span className="required">*</span></label>
            <DatePicker
              selected={formData.date ? new Date(formData.date) : null}
              onChange={(date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                setFormData(prev => ({ ...prev, date: `${year}-${month}-${day}` }));
              }}
              dateFormat="dd/MM/yyyy"
              className="date-picker-input"
              placeholderText="DD/MM/YYYY"
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field-group">
            <label>Engineer Name</label>
            <input type="text" name="engineer" id="f_engineer" value={formData.engineer} onChange={handleChange} placeholder="e.g. Mike, Alex..."/>
          </div>
          <div className="field-group">
            <label>Phone Number <span className="required">*</span></label>
            <input type="text" name="phone" id="f_phone" value={formData.phone} onChange={handleChange} placeholder="e.g. 9876543210"/>
          </div>
        </div>
      </div>

      {/* PC Details */}
      <div className="card">
        <div className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          PC Details
        </div>
        <div className="field-row">
          <div className="field-group">
            <label>PC Count <span className="required">*</span></label>
            <input type="number" name="pc_count" id="f_pc_count" value={formData.pc_count} onChange={handleChange} min="1"/>
          </div>
          <div className="field-group">
            <label>PC System Description</label>
            <select name="pc_desc" id="f_pc_desc" value={formData.pc_desc} onChange={handleChange}>
              <option value="">-- Select --</option>
              <option>Desktop</option>
              <option>Laptop</option>
              <option>Server</option>
              <option>Mixed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work & Parts */}
      <div className="card">
        <div className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          Work & Parts
        </div>
        <div className="field-row full" style={{ marginBottom: '16px' }}>
          <div className="field-group">
            <label>Work Done <span className="required">*</span></label>
            <textarea name="work_done" id="f_work_done" value={formData.work_done} onChange={handleChange} placeholder="e.g. Windows reinstall, CPU fan replacement..."></textarea>
          </div>
        </div>

        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-600)', display: 'block', marginBottom: '10px' }}>PARTS REPLACED / ADDED</label>
        <div className="parts-wrap">
          <table className="parts-table">
            <thead>
              <tr>
                <th style={{ width: '46%' }}>Part Name</th>
                <th style={{ width: '18%' }}>Qty</th>
                <th style={{ width: '22%' }}>Cost (₹)</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Total</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part, idx) => (
                <tr key={idx}>
                  <td><input type="text" value={part.name} onChange={(e) => handlePartChange(idx, 'name', e.target.value)} placeholder="Part name"/></td>
                  <td><input type="number" value={part.qty} onChange={(e) => handlePartChange(idx, 'qty', e.target.value)} min="1" style={{ width: '70px' }}/></td>
                  <td><input type="number" value={part.cost} onChange={(e) => handlePartChange(idx, 'cost', e.target.value)} min="0"/></td>
                  <td style={{ textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>₹{(part.qty * part.cost).toLocaleString()}</td>
                  <td><button className="btn-icon-del" onClick={() => removePart(idx)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <button className="btn-ghost-blue" onClick={addPart} style={{ color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>+ Add Part</button>
          {partsTotal > 0 && <div className="parts-total">Parts Total: ₹{partsTotal.toLocaleString('en-IN')}</div>}
        </div>
      </div>

      {/* Payment */}
      <div className="card">
        <div className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><path d="M1 10h22"/></svg>
          Payment
        </div>
        <div className="field-row three">
          <div className="field-group">
            <label>Amount (₹) <span className="required">*</span></label>
            <input type="number" name="amount" id="f_amount" value={formData.amount} onChange={handleChange} min="0"/>
          </div>
          <div className="field-group">
            <label>Status</label>
            <select name="status" id="f_status" value={formData.status} onChange={handleChange}>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <div className="field-group">
            <label>Notes</label>
            <input type="text" name="notes" id="f_notes" value={formData.notes} onChange={handleChange} placeholder="any additional info..."/>
          </div>
        </div>
      </div>

      <div className="form-footer">
        <button className="btn btn-primary" onClick={handleSubmit}>Save Entry</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default ServiceForm;
