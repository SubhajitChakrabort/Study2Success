import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./ResetPassword.css"; // We'll create this file next
import DesktopOnly from "./DesktopOnly";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Verify token validity when component mounts
    const verifyToken = async () => {
      try {
        const response = await fetch(
          `https://smartstudy-server.onrender.com/api/auth/verify-reset-token/${token}`
        );
        if (!response.ok) {
          setIsValidToken(false);
          setMessage("Invalid or expired password reset link.");
        }
      } catch (error) {
        console.error("Token verification error:", error);
        setIsValidToken(false);
        setMessage("An error occurred. Please try again later.");
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate passwords
    if (passwords.password !== passwords.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (passwords.password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    // Check for at least one letter, one number, and one special character
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(passwords.password)) {
      setMessage(
        "Password must include at least one letter, one number, and one special character."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://smartstudy-server.onrender.com/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            password: passwords.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage("Your password has been reset successfully.");
      } else {
        setMessage(data.error || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <DesktopOnly>
      <div className="reset-password-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="reset-card card shadow-lg">
                <div className="card-header-custom">
                  <div className="logo-container">
                    <img
                      src="/assets/owl.png"
                      alt="JobLMS Logo"
                      className="logo-image"
                    />
                  </div>
                  <h2 className="text-white mb-0">Invalid Reset Link</h2>
                </div>
                <div className="card-body p-5 text-center">
                  <div className="error-icon mb-4">
                    <i className="bi bi-exclamation-circle"></i>
                  </div>
                  <div className="alert alert-danger" role="alert">
                    {message}
                  </div>
                  <Link to="/forgot-password" className="btn btn-primary mt-3">
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Request New Reset Link
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </DesktopOnly>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="reset-card card shadow-lg">
              <div className="card-header-custom">
                <div className="logo-container">
                  <img
                    src="/assets/owl.png"
                    alt="JobLMS Logo"
                    className="logo-image"
                  />
                </div>
                <h2 className="text-white mb-0">Reset Password</h2>
              </div>

              <div className="card-body p-5">
                {isSuccess ? (
                  <div className="text-center">
                    <div className="success-icon mb-4">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <div className="alert alert-success" role="alert">
                      {message}
                    </div>
                    <Link to="/login" className="btn btn-primary mt-3">
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Go to Login
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <div className="reset-icon">
                        <i className="bi bi-shield-lock"></i>
                      </div>
                      <p className="reset-description">
                        Create a new password for your account. Password must be
                        at least 8 characters and include a letter, a number,
                        and a special character.
                      </p>
                    </div>

                    {message && (
                      <div className="alert alert-danger mb-4" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {message}
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label htmlFor="password" className="form-label">
                          New Password
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="bi bi-lock"></i>
                          </span>
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control border-start-0"
                            id="password"
                            name="password"
                            placeholder="Enter new password"
                            value={passwords.password}
                            onChange={handleChange}
                            required
                          />
                          <div className="input-group-append">
                            <button
                              type="button"
                              className="btn btn-outline-secondary border-start-0"
                              onClick={togglePasswordVisibility}
                            >
                              <i
                                className={`bi ${
                                  showPassword ? "bi-eye-slash" : "bi-eye"
                                }`}
                              ></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirm Password
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="bi bi-lock-fill"></i>
                          </span>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="form-control border-start-0"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={passwords.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                          <div className="input-group-append">
                            <button
                              type="button"
                              className="btn btn-outline-secondary border-start-0"
                              onClick={toggleConfirmPasswordVisibility}
                            >
                              <i
                                className={`bi ${
                                  showConfirmPassword
                                    ? "bi-eye-slash"
                                    : "bi-eye"
                                }`}
                              ></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="d-grid">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Resetting Password...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-lg me-2"></i>
                              Reset Password
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-center mt-4">
                        <Link to="/login" className="auth-link">
                          <i className="bi bi-arrow-left me-1"></i>
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
    </div>
  );
};

export default ResetPassword;
