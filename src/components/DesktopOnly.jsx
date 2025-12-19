import React, { useState, useEffect } from 'react';
import './DesktopOnly.css';

const DesktopOnly = ({ children }) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Function to check if device is mobile
  const checkDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
    const isSmallScreen = window.innerWidth < 768;
    
    setIsMobileDevice(isMobile || isSmallScreen);
  };

  useEffect(() => {
    // Check device type on initial load
    checkDeviceType();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkDeviceType);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  if (isMobileDevice) {
    return (
      <div className="mobile-restriction">
        <div className="container text-center py-5">
          <i className="bi bi-laptop display-1 text-primary mb-4"></i>
          <h2>Desktop Only Application</h2>
          <p className="lead">
            We're sorry, but this application is optimized for desktop and laptop devices only.
          </p>
          <p>
            Please access this application from a desktop or laptop computer for the best experience.
          </p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => setIsMobileDevice(false)}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default DesktopOnly;
