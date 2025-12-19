import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AddToFolderModal = ({ show, handleClose, noteId }) => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (show) {
      fetchFolders();
    }
  }, [show]);

  useEffect(() => {
    // Reset error and success messages when modal is opened/closed
    if (show) {
      setError('');
      setSuccess('');
    }
  }, [show]);

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
      // Set the first folder as selected by default if available
      if (data.length > 0) {
        setSelectedFolder(data[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      setError('Failed to load study folders');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFolder = async () => {
    if (!selectedFolder) {
      setError('Please select a folder');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      console.log('Sending request with:', { folderId: parseInt(selectedFolder), noteId });
      
      const response = await fetch('https://smartstudy-server.onrender.com/api/study-folders/add-note', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          folderId: parseInt(selectedFolder),
          noteId: noteId
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
      
      setSuccess('Note added to folder successfully!');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error adding note to folder:', error);
      setError(error.message || 'Failed to add note to folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add to Study Folder</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        {loading ? (
          <div className="text-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Folder</Form.Label>
              {folders.length === 0 ? (
                <div className="alert alert-info">
                  You don't have any study folders yet. Please create a folder first.
                </div>
              ) : (
                <Form.Select 
                  value={selectedFolder} 
                  onChange={(e) => setSelectedFolder(e.target.value)}
                >
                  <option value="">Select a folder</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAddToFolder} 
          disabled={loading || folders.length === 0 || !selectedFolder}
        >
          {loading ? 'Adding...' : 'Add to Folder'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddToFolderModal;
