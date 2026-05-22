import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabase';
import '../styles/Login.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('suhelfitness@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please enter both email and password.',
        confirmButtonColor: '#2563eb'
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
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message,
        confirmButtonColor: '#dc2626'
      });
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
        confirmButtonColor: '#2563eb'
      });
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#dc2626'
      });
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@example.com"
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
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
