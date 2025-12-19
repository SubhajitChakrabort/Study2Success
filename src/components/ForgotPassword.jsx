import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('https://smartstudy-server.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        setMessage('Password reset link has been sent to your email.');
      } else {
        setMessage(data.error || 'Failed to send reset link. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-lg">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Forgot Password</h2>
              
              {isSuccess ? (
                <div className="text-center">
                  <div className="alert alert-success" role="alert">
                    {message}
                  </div>
                  <Link to="/login" className="btn btn-primary mt-3">
                    Back to Login
                  </Link>
                </div>
              ) : (
                <>
                  {message && (
                    <div className="alert alert-danger mb-3" role="alert">
                      {message}
                    </div>
                  )}
                  <p className="text-center mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg w-100"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    <div className="text-center mt-3">
                      <Link to="/login" className="text-decoration-none">
                        Back to Login
                      </Link>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
