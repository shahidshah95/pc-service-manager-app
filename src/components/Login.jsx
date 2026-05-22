import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabase';
import '../styles/Login.css';

const getSwalConfig = (error) => {
  if (/rate limit/i.test(error.message)) {
    return { icon: 'warning', title: 'Limit Reached', text: 'Only a few emails per hour allowed. Please wait at least 60 minutes before trying again.' };
  }
  return { icon: 'error', title: 'Login Failed', text: error.message };
};

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('suhelfitness@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please enter both email and password.',
        confirmButtonColor: 'var(--primary)'
      });
    }

    setLoading(true);
    
    // First, try to login
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Simple Auto-registration workaround for the main admin if it doesn't exist
    // Note: If you disable signups in Supabase, this auto-signup will fail gracefully as intended.
    if (error && error.message.includes('Invalid login credentials') && email === 'suhelfitness@gmail.com') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (!signUpError && signUpData.user) {
           data = signUpData;
           error = null;
        }
    }

    setLoading(false);

    if (error) {
      const cfg = getSwalConfig(error);
      Swal.fire({ icon: cfg.icon, title: cfg.title, text: cfg.text, confirmButtonColor: cfg.icon === 'warning' ? 'var(--primary)' : '#dc2626' });
    } else {
      onLoginSuccess(data.session);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      return Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text: 'Please enter your email address to reset your password.',
        confirmButtonColor: 'var(--primary)'
      });
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);

    if (error) {
      const cfg = getSwalConfig(error);
      Swal.fire({ icon: cfg.icon, title: cfg.title === 'Login Failed' ? 'Error' : cfg.title, text: cfg.text, confirmButtonColor: cfg.icon === 'warning' ? 'var(--primary)' : '#dc2626' });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Email Sent',
        text: 'A password reset link has been sent to your email address.',
        confirmButtonColor: '#10b981'
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
          </svg>
          <h1>Admin Login</h1>
          <p>Sign in to manage service entries</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="field-group">
            <label>Email Address</label>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@example.com"
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ paddingRight: '40px' }}
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
            <button
              type="button"
              className="forgot-password-link"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          PC Service Manager restricted access.
        </div>
      </div>
    </div>
  );
};

export default Login;
