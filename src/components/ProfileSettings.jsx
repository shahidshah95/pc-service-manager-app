import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabase';
import '../styles/ProfileSettings.css';

const ProfileSettings = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch current user email
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email);
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!email) {
      return Swal.fire('Error', 'Email address cannot be empty', 'error');
    }

    if (!password || password.length < 6) {
      return Swal.fire('Error', 'Please provide a new password (min 6 characters) to sync with your email change.', 'error');
    }

    setLoading(true);

    // Update both email and password simultaneously
    const { error } = await supabase.auth.updateUser({
      email: email,
      password: password
    });

    setLoading(false);

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update failed',
        text: error.message,
        confirmButtonColor: '#dc2626'
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your email and password have been updated successfully! Please note you may need to confirm the new email if email confirmations are enabled.',
        confirmButtonColor: '#2563eb'
      }).then(() => {
        onClose();
      });
    }
  };

  return (
    <div className="profile-settings-overlay">
      <div className="profile-settings-card">
        <div className="profile-settings-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Admin Profile Settings
          </h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form className="settings-form" onSubmit={handleUpdate}>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '10px' }}>
            Update your admin login details. Both email and password must be updated together.
          </div>

          <div className="field-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="field-group">
            <label>New Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter new password (min 6 chars)"
                style={{ paddingRight: '40px' }}
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="settings-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
