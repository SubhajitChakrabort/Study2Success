import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./Login.css";
import DesktopOnly from "./DesktopOnly";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setIsLoading(true);
  //   try {
  //     const response = await fetch("https://smartstudy-server.onrender.com/api/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(credentials),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       localStorage.setItem("token", data.token);
  //       navigate("/verify-otp");
  //     } else {

  //       setError(data.error || "Login failed. Please try again.");
  //       setIsLoading(false);
  //     }
  //   } catch (error) {
  //     setError("An error occurred. Please try again later.");
  //     console.error("Login failed:", error);
  //     setIsLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("https://smartstudy-server.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast.success("Login successful!");
        navigate("/verify-otp");
      } else {
        setLoginAttempts((prev) => prev + 1);

        if (loginAttempts >= 4) {
          toast.error("Account locked. Too many failed attempts.", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setCredentials({ username: "", password: "" });
        } else {
          toast.warning(
            `Login failed. ${5 - loginAttempts} attempts remaining.`
          );
        }

        setError(data.error || "Login failed. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
      setError("An error occurred. Please try again later.");
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Decode the credential to get user information
      const decodedUser = jwtDecode(credentialResponse.credential);

      // Send the token to your backend
      const response = await fetch(
        "https://smartstudy-server.onrender.com/api/auth/google-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: credentialResponse.credential,
            email: decodedUser.email,
            name: decodedUser.name,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        // For Google login, we might skip OTP verification
        navigate("/dashboard");
      } else {
        setError(data.error || "Google login failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred with Google login. Please try again.");
      console.error("Google login failed:", error);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  // return (
  //   <div className="container mt-5">
  //     <div className="row justify-content-center">
  //       <div className="col-md-6 col-lg-4">
  //         <div className="card shadow-lg">
  //           <div className="card-body p-5">
  //             <h2 className="text-center mb-4">Login</h2>

  //             {error && (
  //               <div className="alert alert-danger" role="alert">
  //                 {error}
  //               </div>
  //             )}

  //             <form onSubmit={handleSubmit}>
  //               <div className="mb-3">
  //                 <input
  //                   type="text"
  //                   className="form-control form-control-lg"
  //                   name="username"
  //                   placeholder="Username or Email"
  //                   value={credentials.username}
  //                   onChange={handleChange}
  //                   required
  //                 />
  //               </div>
  //               <div className="mb-4 position-relative">
  //                 <input
  //                   type={showPassword ? "text" : "password"}
  //                   className="form-control form-control-lg"
  //                   name="password"
  //                   placeholder="Password"
  //                   value={credentials.password}
  //                   onChange={handleChange}
  //                   required
  //                 />
  //                 <button
  //                   type="button"
  //                   className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0"
  //                   onClick={togglePasswordVisibility}
  //                   style={{ zIndex: 10 }}
  //                 >
  //                   <i
  //                     className={`bi ${
  //                       showPassword ? "bi-eye-slash" : "bi-eye"
  //                     }`}
  //                   ></i>
  //                 </button>
  //               </div>
  //               <button
  //                 type="submit"
  //                 className="btn btn-primary btn-lg w-100"
  //                 disabled={isLoading}
  //               >
  //                 {isLoading ? "Logging in..." : "Login"}
  //               </button>

  //               <div className="text-center my-3">
  //                 <p className="text-muted">OR</p>
  //               </div>

  //               <div className="d-flex justify-content-center mb-3">
  //                 <GoogleLogin
  //                   onSuccess={handleGoogleSuccess}
  //                   onError={handleGoogleError}
  //                   useOneTap
  //                   theme="filled_blue"
  //                   text="continue_with"
  //                   shape="pill"
  //                   size="large"
  //                   width="100%"
  //                 />
  //               </div>

  //               <div className="text-center mt-3">
  //                 <Link
  //                   to="/forgot-password"
  //                   className="text-decoration-none d-block mb-2"
  //                 >
  //                   Forgot Password?
  //                 </Link>
  //                 <Link to="/register" className="text-decoration-none">
  //                   Don't have an account? Register
  //                 </Link>
  //               </div>
  //             </form>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <DesktopOnly>
      <ToastContainer />
      <div className="login-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="login-card card shadow-lg">
                <div className="card-header-custom">
                  <div className="logo-container">
                    <img
                      src="/assets/owl.png"
                      alt="JobLMS Logo"
                      className="logo-image"
                    />
                  </div>
                  <h2 className="text-white mb-0">Welcome Back</h2>
                </div>

                <div className="card-body p-5">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label">Username or Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          name="username"
                          placeholder="Enter your username or email"
                          value={credentials.username}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">Password</label>
                      <div className="input-group position-relative">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control border-start-0"
                          name="password"
                          placeholder="Enter your password"
                          value={credentials.password}
                          onChange={handleChange}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn position-absolute end-0 top-50 translate-middle-y me-3"
                          onClick={togglePasswordVisibility}
                          style={{ zIndex: 10 }}
                        >
                          <i
                            className={`bi ${
                              showPassword ? "bi-eye-slash" : "bi-eye"
                            }`}
                          ></i>
                        </button>
                      </div>
                    </div>

                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="divider">
                    <span>or</span>
                  </div>

                  <div className="google-btn-container d-flex justify-content-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      theme="filled_blue"
                      text="continue_with"
                      shape="pill"
                      size="large"
                      width="100%"
                    />
                  </div>

                  <div className="auth-links text-center mt-4">
                    <Link
                      to="/forgot-password"
                      className="text-decoration-none d-block mb-2"
                    >
                      <i className="bi bi-question-circle me-1"></i>
                      Forgot Password?
                    </Link>
                    <Link to="/register" className="text-decoration-none">
                      <i className="bi bi-person-plus me-1"></i>
                      Don't have an account? Register
                    </Link>
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

export default Login;
