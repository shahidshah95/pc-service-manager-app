import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/Auth.css';

const Auth = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('IDENTIFY'); // IDENTIFY or VERIFY
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      
      setStep('VERIFY');
      setSuccessMsg('OTP has been sent to your email!');
    } catch (error) {
      setErrorMsg(error.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Primary verification attempt
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'email', // General type for OTP
      });

      if (error) {
        // Fallback for magiclink type which is sometimes used for OTP
        const { data: data2, error: error2 } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp.trim(),
          type: 'magiclink',
        });
        
        if (error2) throw error2;
        if (data2?.session) onAuthSuccess(data2.session.user);
      } else if (data?.session) {
        onAuthSuccess(data.session.user);
      } else {
        throw new Error('Verification failed. Invalid OTP.');
      }
    } catch (error) {
      setErrorMsg(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome</h2>
        <p className="auth-subtitle">
          {step === 'IDENTIFY' ? 'Login or create an account' : 'Verify your email address'}
        </p>

        {errorMsg && (
          <div style={{ 
            padding: '12px', 
            borderRadius: '10px', 
            background: '#fef2f2', 
            color: '#b91c1c',
            fontSize: '13px',
            marginBottom: '20px',
            border: '1px solid #fee2e2'
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ 
            padding: '12px', 
            borderRadius: '10px', 
            background: '#f0fdf4', 
            color: '#15803d',
            fontSize: '13px',
            marginBottom: '20px',
            border: '1px solid #dcfce7'
          }}>
            {successMsg}
          </div>
        )}

        {step === 'IDENTIFY' ? (
          <form className="auth-form" onSubmit={handleSendOTP}>
            <div className="auth-input-group">
              <label>Email Address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOTP}>
            <div className="auth-input-group">
              <label>Verification Code</label>
              <input
                className="auth-input"
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <div className="auth-toggle">
              Changed your mind? <span onClick={() => setStep('IDENTIFY')}>Go back</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
