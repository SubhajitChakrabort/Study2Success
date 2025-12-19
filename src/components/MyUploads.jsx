import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Tab, Tabs } from 'react-bootstrap';
import './MyUploads.css';

const MyUploads = () => {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [userEmail, setUserEmail] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUpload, setCurrentUpload] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    subject: '',
    semester: '',
    isPublic: true
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchProfileData();
    fetchUploads();
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
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/upload/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch uploads');
      }
      
      const data = await response.json();
      setUploads(data);
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

  const handleEditClick = (upload) => {
    setCurrentUpload(upload);
    setEditForm({
      title: upload.title,
      description: upload.description || '',
      subject: upload.subject,
      semester: upload.semester,
      isPublic: upload.is_public === 1
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/upload/${currentUpload.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update upload');
      }
      
      // Update the local state
      setUploads(uploads.map(upload => 
        upload.id === currentUpload.id 
          ? { 
              ...upload, 
              title: editForm.title,
              description: editForm.description,
              subject: editForm.subject,
              semester: editForm.semester,
              is_public: editForm.isPublic ? 1 : 0
            } 
          : upload
      ));
      
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating upload:', error);
      alert('Failed to update upload. Please try again.');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/upload/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete upload');
      }
      
      // Update the local state
      setUploads(uploads.filter(upload => upload.id !== deleteId));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting upload:', error);
      alert('Failed to delete upload. Please try again.');
    }
  };

  const renderFilePreview = (upload) => {
    const fileUrl = `https://smartstudy-server.onrender.com${upload.file_path}`;
    
    switch (upload.file_type) {
      case 'pdf':
        return (
          <div className="file-preview pdf-preview">
            <i className="bi bi-file-earmark-pdf"></i>
            <span>{upload.title}</span>
          </div>
        );
      case 'image':
        return (
          <div className="file-preview image-preview">
            <img src={fileUrl} alt={upload.title} />
          </div>
        );
      case 'video':
        return (
          <div className="file-preview video-preview">
            <i className="bi bi-file-earmark-play"></i>
            <span>{upload.title}</span>
          </div>
        );
      default:
        return (
          <div className="file-preview">
            <i className="bi bi-file-earmark"></i>
            <span>{upload.title}</span>
          </div>
        );
    }
  };

  const filterUploadsByType = (type) => {
    return uploads.filter(upload => upload.file_type === type);
  };

  if (loading) {
    return <div className="loading">Loading your uploads...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="my-uploads-page">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/dashboard">
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
          <h2>My Uploads</h2>
          <Link to="/upload-notes" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Upload New
          </Link>
        </div>

        <Tabs defaultActiveKey="pdf" id="uploads-tabs" className="mb-4">
          <Tab eventKey="pdf" title="PDF Documents">
            <div className="row">
              {filterUploadsByType('pdf').length > 0 ? (
                filterUploadsByType('pdf').map(upload => (
                  <div key={upload.id} className="col-md-4 col-lg-3 mb-4">
                    <div className="upload-card">
                      {renderFilePreview(upload)}
                      <div className="upload-info">
                        <h5>{upload.title}</h5>
                        <p className="text-muted small">
                          {upload.subject_name} | {upload.semester}
                        </p>
                        <p className="description">{upload.description}</p>
                        <div className="upload-actions">
                          <a 
                            href={`https://smartstudy-server.onrender.com${upload.file_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-eye"></i>
                          </a>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEditClick(upload)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteClick(upload.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-info">
                    You haven't uploaded any PDF documents yet.
                  </div>
                </div>
              )}
            </div>
          </Tab>
          
          <Tab eventKey="image" title="Images">
            <div className="row">
              {filterUploadsByType('image').length > 0 ? (
                filterUploadsByType('image').map(upload => (
                  <div key={upload.id} className="col-md-4 col-lg-3 mb-4">
                    <div className="upload-card">
                      {renderFilePreview(upload)}
                      <div className="upload-info">
                        <h5>{upload.title}</h5>
                        <p className="text-muted small">
                          {upload.subject_name} | {upload.semester}
                        </p>
                        <p className="description">{upload.description}</p>
                        <div className="upload-actions">
                          <a 
                            href={`https://smartstudy-server.onrender.com${upload.file_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-eye"></i>
                          </a>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEditClick(upload)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteClick(upload.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-info">
                    You haven't uploaded any images yet.
                  </div>
                </div>
              )}
            </div>
          </Tab>
          
          <Tab eventKey="video" title="Videos">
            <div className="row">
              {filterUploadsByType('video').length > 0 ? (
                filterUploadsByType('video').map(upload => (
                  <div key={upload.id} className="col-md-4 col-lg-3 mb-4">
                    <div className="upload-card">
                      {renderFilePreview(upload)}
                      <div className="upload-info">
                        <h5>{upload.title}</h5>
                        <p className="text-muted small">
                          {upload.subject_name} | {upload.semester}
                        </p>
                        <p className="description">{upload.description}</p>
                        <div className="upload-actions">
                          <a 
                            href={`https://smartstudy-server.onrender.com${upload.file_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-eye"></i>
                          </a>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEditClick(upload)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                                handleDeleteClick(upload.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12">
                        <div className="alert alert-info">
                          You haven't uploaded any videos yet.
                        </div>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </div>
      
            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Edit Upload</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleEditSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditFormChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={editForm.description}
                      onChange={handleEditFormChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={editForm.subject}
                      onChange={handleEditFormChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Semester</Form.Label>
                    <Form.Select
                      name="semester"
                      value={editForm.semester}
                      onChange={handleEditFormChange}
                      required
                    >
                      <option value="">Select Semester</option>
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                      <option value="3rd">3rd Semester</option>
                      <option value="4th">4th Semester</option>
                      <option value="5th">5th Semester</option>
                      <option value="6th">6th Semester</option>
                      <option value="7th">7th Semester</option>
                      <option value="8th">8th Semester</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Make this upload public"
                      name="isPublic"
                      checked={editForm.isPublic}
                      onChange={handleEditFormChange}
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>
      
            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete this upload? This action cannot be undone.
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        );
      };
      
      export default MyUploads;
      