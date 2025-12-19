import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OTPVerification.css';
import DesktopOnly from './DesktopOnly';

const OTPVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus on the first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // Set up countdown timer
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleChange = (index, value) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Clear any previous errors
      if (error) setError('');
      
      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus the last input
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp: otpString })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        navigate('/dashboard');
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      setError('Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Reset timer and OTP fields
        setTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setError('');
        
        // Focus on first input
        inputRefs.current[0].focus();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP failed:', error);
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <DesktopOnly>
    <div className="otp-container-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="otp-card card shadow-lg">
              <div className="card-header-custom">
                <div className="logo-container">
                  <img 
                    src="/assets/owl.png" 
                    alt="JobLMS Logo" 
                    className="logo-image" 
                  />
                </div>
                <h2 className="text-white mb-0">Verify Your Account</h2>
              </div>
              
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="otp-icon">
                    <i className="bi bi-shield-lock"></i>
                  </div>
                  <p className="otp-description">
                    We've sent a 6-digit verification code to your email address.
                    Enter the code below to confirm your account.
                  </p>
                </div>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} onPaste={handlePaste}>
                  <div className="otp-container">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="1"
                        value={digit}
                        onChange={e => handleChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        className="otp-input"
                        autoComplete="off"
                      />
                    ))}
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={otp.some(digit => !digit) || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Verifying...
                        </>
                      ) : (
                        "Verify & Continue"
                      )}
                    </button>
                  </div>
                </form>
                
                <div className="text-center mt-4">
                  <p>
                    Didn't receive the code?{' '}
                    {canResend ? (
                      <a 
                        href="#" 
                        className="resend-link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleResendOTP();
                        }}
                      >
                        Resend Code
                      </a>
                    ) : (
                      <span>
                        Resend in <span className="timer">{timer}s</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DesktopOnly>
  );
};

export default OTPVerification;
