import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import './ImportantNotice.css';

const ImportantNotice = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({});
  const [userEmail, setUserEmail] = useState("");
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    fetchProfileData();
    fetchNotices();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://smartstudy-server.onrender.com/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setProfileData(data || {});
      setUserEmail(data?.email || "");
      
      // Redirect if not a student
      if (data?.role === 'teacher') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/notices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notices');
      }
      
      const data = await response.json();
      setNotices(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleViewNotice = (notice) => {
    setSelectedNotice(notice);
    setShowModal(true);
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <i className="bi bi-file-earmark-pdf text-danger"></i>;
      case 'doc':
      case 'docx':
        return <i className="bi bi-file-earmark-word text-primary"></i>;
      case 'image':
        return <i className="bi bi-file-earmark-image text-success"></i>;
      default:
        return <i className="bi bi-file-earmark-text"></i>;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderFilePreview = (notice) => {
    switch (notice.file_type) {
      case 'pdf':
        return (
          <iframe
            src={`https://smartstudy-server.onrender.com${notice.file_path}`}
            title={notice.title}
            width="100%"
            height="500px"
            className="notice-preview"
          ></iframe>
        );
      case 'image':
        return (
          <img
            src={`https://smartstudy-server.onrender.com${notice.file_path}`}
            alt={notice.title}
            className="img-fluid notice-preview"
          />
        );
      case 'doc':
      case 'docx':
      case 'text':
      default:
        return (
          <div className="text-center p-5">
            <div className="display-1 mb-3">
              {getFileIcon(notice.file_type)}
            </div>
            <p>This file type cannot be previewed directly.</p>
            <a 
              href={`https://smartstudy-server.onrender.com${notice.file_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Download File
            </a>
          </div>
        );
    }
  };

  return (
    <div className="important-notice-page">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/dashboard">
                               <img src="/assets/owl.png" alt="JobLMS Logo" className="navbar-logo" />
                               SmartStudy
                             </Link>
          <div className="dropdown">
            <button
              className="btn btn-link dropdown-toggle d-flex align-items-center text-white text-decoration-none"
              type="button"
              id="userDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {profileData?.photoUrl ? (
                <img
                  src={`https://smartstudy-server.onrender.com${profileData.photoUrl}`}
                  alt="Profile"
                  className="profile-image me-2"
                />
              ) : (
                <i className="bi bi-person-circle fs-4 me-2"></i>
              )}
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="userDropdown"
            >
              <li>
                <span className="dropdown-item-text">{userEmail}</span>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <Link className="dropdown-item" to="/profile">
                  Update Profile
                </Link>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Important Notices</h2>
          <Link to="/dashboard" className="btn btn-outline-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading notices...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : notices.length === 0 ? (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            No important notices available at this time.
          </div>
        ) : (
          <div className="row">
            {notices.map(notice => (
              <div key={notice.id} className="col-md-6 col-lg-4 mb-4">
                <div className="notice-card">
                  <div className="notice-header">
                    <div className="notice-icon">
                      {getFileIcon(notice.file_type)}
                    </div>
                    <div className="notice-meta">
                      <span className="notice-date">{formatDate(notice.created_at)}</span>
                      <span className="notice-teacher">{notice.teacher_name || 'Teacher'}</span>
                    </div>
                  </div>
                  <div className="notice-body">
                    <h5 className="notice-title">{notice.title}</h5>
                    {notice.description && (
                      <p className="notice-description">{notice.description}</p>
                    )}
                  </div>
                  <div className="notice-footer">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleViewNotice(notice)}
                    >
                      <i className="bi bi-eye me-2"></i>
                      View Notice
                    </button>
                    <a 
                      href={`https://smartstudy-server.onrender.com${notice.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-secondary"
                    >
                      <i className="bi bi-download me-2"></i>
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notice View Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedNotice?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotice && (
            <div>
              {renderFilePreview(selectedNotice)}
              
              {selectedNotice.description && (
                <div className="mt-4">
                  <h5>Description</h5>
                  <p>{selectedNotice.description}</p>
                </div>
              )}
              
              <div className="notice-details mt-4">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Posted by:</strong> {selectedNotice.teacher_name || 'Teacher'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Date:</strong> {formatDate(selectedNotice.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <a 
            href={`https://smartstudy-server.onrender.com${selectedNotice?.file_path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <i className="bi bi-download me-2"></i>
            Download
          </a>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ImportantNotice;
