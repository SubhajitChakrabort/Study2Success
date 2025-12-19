import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Card, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './StudyFolder.css';

const TeacherStudyFolder = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderNotes, setFolderNotes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [availableNotes, setAvailableNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [addNoteError, setAddNoteError] = useState('');
  const [addNoteSuccess, setAddNoteSuccess] = useState('');

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/study-folders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }
      
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      alert('Failed to load study folders');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderNotes = async (folderId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/study-folders/${folderId}/notes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch folder notes');
      }
      
      const data = await response.json();
      setFolderNotes(data);
      setSelectedFolder(folders.find(folder => folder.id === parseInt(folderId)));
    } catch (error) {
      console.error('Error fetching folder notes:', error);
      alert('Failed to load notes from this folder');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableNotes = async () => {
    try {
      setLoading(true);
      setAddNoteError('');
      const token = localStorage.getItem('token');
      
      console.log('Fetching available notes...');
      
      const response = await fetch('https://smartstudy-server.onrender.com/api/teacher-uploads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', response.status, errorData);
        throw new Error(`Failed to fetch available notes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.length} available notes`);
      
      setAvailableNotes(data);
      if (data.length > 0) {
        setSelectedNoteId(data[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching available notes:', error);
      setAddNoteError(`Failed to load available notes: ${error.message}`);
      throw error; // Re-throw to allow fallback
    } finally {
      setLoading(false);
    }
  };

  // Add this function to your component
  const fetchAllNotes = async () => {
    try {
      setLoading(true);
      setAddNoteError('');
      const token = localStorage.getItem('token');
      
      console.log('Fetching all notes from alternative endpoint...');
      
      // Try an alternative endpoint that might contain your notes
      const response = await fetch('https://smartstudy-server.onrender.com/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.length} notes from alternative endpoint`);
      
      setAvailableNotes(data);
      if (data.length > 0) {
        setSelectedNoteId(data[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching notes from alternative endpoint:', error);
      setAddNoteError(`Failed to load notes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Modify handleShowAddNoteModal to try both endpoints
  const handleShowAddNoteModal = () => {
    setAddNoteError('');
    setAddNoteSuccess('');
    setShowAddNoteModal(true);
    
    fetchAvailableNotes().catch(() => {
      console.log('Falling back to alternative notes endpoint');
      fetchAllNotes();
    });
  };

  const handleCreateFolder = async () => {
    try {
      if (!newFolderName.trim()) {
        alert('Please enter a folder name');
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/study-folders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newFolderName.trim() })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create folder');
      }
      
      // Reset and close modal
      setNewFolderName('');
      setShowCreateModal(false);
      
      // Refresh folders
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder');
    }
  };

  const handleDeleteFolder = async () => {
    try {
      if (!folderToDelete) return;
      
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/study-folders/${folderToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }
      
      // Reset and close modal
      setFolderToDelete(null);
      setShowDeleteModal(false);
      
      // If the deleted folder was selected, clear selection
      if (selectedFolder && selectedFolder.id === folderToDelete.id) {
        setSelectedFolder(null);
        setFolderNotes([]);
      }
      
      // Refresh folders
      fetchFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Failed to delete folder');
    }
  };

  const confirmDeleteFolder = (folder) => {
    setFolderToDelete(folder);
    setShowDeleteModal(true);
  };

  // Update the handleAddNoteToFolder function
  const handleAddNoteToFolder = async () => {
    if (!selectedNoteId || !selectedFolder) {
      setAddNoteError('Please select a note to add');
      return;
    }

    try {
      setLoading(true);
      setAddNoteError('');
      setAddNoteSuccess('');
      
      const token = localStorage.getItem('token');
      console.log('Sending request with:', { folderId: selectedFolder.id, noteId: parseInt(selectedNoteId) });
      
      const response = await fetch('https://smartstudy-server.onrender.com/api/study-folders/add-note', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          folderId: selectedFolder.id,
          noteId: parseInt(selectedNoteId)
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.details) {
          throw new Error(`${data.error}: ${data.details}`);
        } else {
          throw new Error(data.error || 'Failed to add note to folder');
        }
      }
      
      setAddNoteSuccess('Note added to folder successfully!');
      // Refresh folder notes
      fetchFolderNotes(selectedFolder.id);
      
      setTimeout(() => {
        setShowAddNoteModal(false);
      }, 1500);
    } catch (error) {
      console.error('Error adding note to folder:', error);
      setAddNoteError(error.message || 'Failed to add note to folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-folder me-2"></i>
          Study Folders
        </h2>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-folder-plus me-2"></i>
          Create New Folder
        </Button>
      </div>

      {loading && !selectedFolder ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your study folders...</p>
        </div>
      ) : (
        <div className="row">
          {!selectedFolder ? (
            <>
              {folders.length === 0 ? (
                <div className="col-12">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    You don't have any study folders yet. Create one to organize your saved notes!
                  </div>
                </div>
              ) : (
                folders.map(folder => (
                  <div className="col-md-4 mb-4" key={folder.id}>
                    <Card className="h-100 folder-card">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="folder-icon">
                            <i className="bi bi-folder-fill text-warning"></i>
                          </div>
                          <div className="dropdown">
                            <button className="btn btn-sm btn-light" type="button" id={`dropdown-${folder.id}`} data-bs-toggle="dropdown" aria-expanded="false">
                              <i className="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul className="dropdown-menu" aria-labelledby={`dropdown-${folder.id}`}>
                              <li>
                                <button className="dropdown-item text-danger" onClick={() => confirmDeleteFolder(folder)}>
                                  <i className="bi bi-trash me-2"></i>
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <Card.Title className="mt-3">{folder.name}</Card.Title>
                        <Card.Text className="text-muted">
                          Created: {new Date(folder.created_at).toLocaleDateString()}
                        </Card.Text>
                        <Button 
                          variant="outline-primary" 
                          className="w-100 mt-2"
                          onClick={() => fetchFolderNotes(folder.id)}
                        >
                          <i className="bi bi-folder-symlink me-2"></i>
                          Open Folder
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                ))
              )}
            </>
          ) : (
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <button 
                    className="btn btn-outline-secondary mb-3"
                    onClick={() => {
                      setSelectedFolder(null);
                      setFolderNotes([]);
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Folders
                  </button>
                  <h3>
                    <i className="bi bi-folder-fill text-warning me-2"></i>
                    {selectedFolder.name}
                  </h3>
                </div>
                <div>
                  <Button 
                    variant="primary" 
                    className="me-2"
                    onClick={handleShowAddNoteModal}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Note
                  </Button>
                  <Button 
                    variant="outline-danger"
                    onClick={() => confirmDeleteFolder(selectedFolder)}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Delete Folder
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading notes...</p>
                </div>
              ) : (
                <>
                  {folderNotes.length === 0 ? (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      This folder is empty. Click the "Add Note" button to add notes to this folder.
                    </div>
                  ) : (
                    <Row>
                      {folderNotes.map(note => (
                        <Col md={4} className="mb-4" key={note.id}>
                          <Card className="h-100 note-card">
                            <Card.Body>
                              <div className="note-type-icon">
                                {note.file_type === 'pdf' && <i className="bi bi-file-earmark-pdf text-danger"></i>}
                                {note.file_type === 'doc' && <i className="bi bi-file-earmark-word text-primary"></i>}
                                {note.file_type === 'ppt' && <i className="bi bi-file-earmark-slides text-warning"></i>}
                                {note.file_type === 'image' && <i className="bi bi-file-earmark-image text-success"></i>}
                                {note.file_type === 'video' && <i className="bi bi-file-earmark-play text-info"></i>}
                                {!note.file_type && <i className="bi bi-file-earmark-text"></i>}
                              </div>
                              <Card.Title>{note.title}</Card.Title>
                              <div className="mb-2">
                                <Badge bg="primary" className="me-1">{note.subject}</Badge>
                                <Badge bg="secondary">{note.semester}</Badge>
                              </div>
                              <Card.Text className="note-description">
                                {note.description || 'No description provided'}
                              </Card.Text>
                              <div className="mt-3">
                                <a 
                                  href={`https://smartstudy-server.onrender.com${note.file_path}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  View
                                </a>
                              </div>
                            </Card.Body>
                            <Card.Footer className="text-muted">
                              <small>Uploaded: {new Date(note.created_at).toLocaleDateString()}</small>
                            </Card.Footer>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Folder Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Folder Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateFolder}>
            Create Folder
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the folder "{folderToDelete?.name}"?</p>
          <p className="text-danger">This action cannot be undone and all notes saved in this folder will be removed from the folder.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteFolder}>
            Delete Folder
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Note to Folder Modal */}
      <Modal show={showAddNoteModal} onHide={() => setShowAddNoteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Note to Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {addNoteError && <div className="alert alert-danger">{addNoteError}</div>}
          {addNoteSuccess && <div className="alert alert-success">{addNoteSuccess}</div>}
          
          {loading ? (
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading available notes...</p>
            </div>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Select Note to Add</Form.Label>
                {availableNotes.length === 0 ? (
                  <div className="alert alert-info">
                    No notes available to add. Please upload some notes first.
                  </div>
                ) : (
                  <Form.Select 
                    value={selectedNoteId} 
                    onChange={(e) => setSelectedNoteId(e.target.value)}
                  >
                    <option value="">Select a note</option>
                    {availableNotes.map(note => (
                      <option key={note.id} value={note.id}>
                        {note.title} ({note.subject})
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            </Form>
          )}
          
          {addNoteError && (
            <div className="mt-3">
              <details>
                <summary className="text-muted">Troubleshooting Information</summary>
                <div className="mt-2 small">
                  <p>If you're seeing errors loading notes, please try the following:</p>
                  <ol>
                    <li>Refresh the page and try again</li>
                    <li>Check that you have uploaded notes previously</li>
                    <li>Contact support if the issue persists</li>
                  </ol>
                  <p className="text-muted">Error details: {addNoteError}</p>
                </div>
              </details>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddNoteModal(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddNoteToFolder} 
            disabled={loading || availableNotes.length === 0 || !selectedNoteId}
          >
            {loading ? 'Adding...' : 'Add to Folder'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TeacherStudyFolder;

