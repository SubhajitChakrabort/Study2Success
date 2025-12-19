import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const TeacherSidebar = ({ profileData }) => {
  return (
    <div className="sidebar" id="sidebar">
      <div className="sidebar-profile text-center">
        {profileData?.photoUrl ? (
          <img
            src={`https://smartstudy-server.onrender.com${profileData.photoUrl}`}
            alt="Profile"
            className="sidebar-profile-image"
          />
        ) : (
          <i className="bi bi-person-circle profile-icon"></i>
        )}
        <h6 className="mt-2">{profileData?.name || "Teacher"}</h6>
        <span className="badge bg-primary">Teacher</span>
      </div>

      <ul className="nav flex-column">
        <li className="nav-item">
          <Link to="/dashboard" className="nav-link">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/upload-notes" className="nav-link">
            <i className="bi bi-cloud-upload me-2"></i>
            Upload Notes
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/my-uploads" className="nav-link">
            <i className="bi bi-folder-check me-2"></i>
            View Your Uploads
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/student-progress" className="nav-link">
            <i className="bi bi-graph-up me-2"></i>
            Student Progress
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/commission-report" className="nav-link">
            <i className="bi bi-cash-stack me-2"></i>
            Commission Statement
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/help-support" className="nav-link">
            <i className="bi bi-question-circle me-2"></i>
            Help & Support
          </Link>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="earnings-summary">
          <h6>Monthly Earnings</h6>
          <p className="text-success">₹{profileData?.earnings || '0.00'}</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherSidebar;
