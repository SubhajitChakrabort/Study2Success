import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Table, Modal } from 'react-bootstrap';
import './UploadNotice.css';

const UploadNotice = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({});
  const [userEmail, setUserEmail] = useState("");
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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
      
      // Redirect if not a teacher
      if (data?.role !== 'teacher') {
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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title for the notice');
      return;
    }
    
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('file', selectedFile);
      
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/notices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload notice');
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      document.getElementById('noticeFileInput').value = '';
      
      // Refresh notices list
      fetchNotices();
      
      alert('Notice uploaded successfully!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (notice) => {
    setEditId(notice.id);
    setEditTitle(notice.title);
    setEditDescription(notice.description || '');
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editTitle.trim()) {
      alert('Please enter a title for the notice');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/notices/${editId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update notice');
      }
      
      // Close modal and refresh notices
      setShowEditModal(false);
      fetchNotices();
      
      alert('Notice updated successfully!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/notices/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete notice');
      }
      
      // Close modal and refresh notices
      setShowDeleteModal(false);
      fetchNotices();
      
      alert('Notice deleted successfully!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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

  return (
    <div className="upload-notice-page">
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
          <h2>Upload Important Notice</h2>
          <Link to="/dashboard" className="btn btn-outline-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </Link>
        </div>

        <div className="row">
          <div className="col-md-5">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Upload New Notice</h5>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter notice title"
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter notice description (optional)"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>File <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="file"
                      id="noticeFileInput"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      required
                    />
                    <Form.Text className="text-muted">
                      Supported formats: PDF, Word, Images, Text documents
                    </Form.Text>
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Notice'}
                  </Button>
                </Form>
              </div>
            </div>
          </div>
          
          <div className="col-md-7">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Your Notices</h5>
                
                {loading ? (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : notices.length === 0 ? (
                  <div className="alert alert-info">
                    You haven't uploaded any notices yet.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notices.map(notice => (
                          <tr key={notice.id}>
                            <td>
                              <div className="notice-title">
                                {notice.title}
                                {notice.description && (
                                  <span 
                                    className="notice-description-tooltip" 
                                    title={notice.description}
                                  >
                                    <i className="bi bi-info-circle ms-2"></i>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>{formatDate(notice.created_at)}</td>
                            <td>
                              <span className="file-type">
                                {getFileIcon(notice.file_type)} {notice.file_type.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group">
                                <a 
                                  href={`https://smartstudy-server.onrender.com${notice.file_path}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="bi bi-eye"></i>
                                </a>
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleEditClick(notice)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteClick(notice.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Notice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

           {/* Delete Confirmation Modal */}
           <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this notice? This action cannot be undone.
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

export default UploadNotice;

