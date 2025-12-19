import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tab, Tabs, Form, Button, Modal, Card } from 'react-bootstrap';
import SpeechButton from './SpeechButton';
import './TeachersNotes.css';
import NoteDetail from './NoteDetail';

const TeachersNotes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [userEmail, setUserEmail] = useState("");
  const [filters, setFilters] = useState({
    subject: '',
    semester: '',
    search: ''
  });
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showNoteDetailModal, setShowNoteDetailModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveToFolder, setSaveToFolder] = useState('');
  const [folders, setFolders] = useState([]);
  const [newFolder, setNewFolder] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [summaryNotes, setSummaryNotes] = useState({});
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [currentSummary, setCurrentSummary] = useState('');
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryNoteId, setSummaryNoteId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const getToggleButtonStyle = () => {
    // Get the current window width
    const windowWidth = window.innerWidth;
    
    // Base styles
    const style = {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '0.25rem 0.75rem',
      zIndex: 1030
    };
    
    // Adjust left position for smaller screens
    if (windowWidth <= 480) {
      style.left = '2px';
      style.padding = '0.25rem 0.3rem';
    }
    
    return style;
  };
  
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  

  useEffect(() => {
    fetchProfileData();
    fetchTeachersNotes();
    fetchSubjectsAndSemesters();
    fetchStudyFolders();
    fetchSummaryNotes();
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

  const fetchTeachersNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/notes/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch teachers notes');
      }
      
      const data = await response.json();
      setNotes(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teachers notes:', error);
      setError(error.message);
      setLoading(false);
    }
  };
  
  const fetchSubjectsAndSemesters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/subjects-semesters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch subjects and semesters');
        return;
      }
      
      const data = await response.json();
      setSubjects(data.subjects || []);
      setSemesters(data.semesters || []);
    } catch (error) {
      console.error('Error fetching subjects and semesters:', error);
    }
  };
  
  const fetchStudyFolders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/study-folders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch study folders');
        return;
      }
      
      const data = await response.json();
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching study folders:', error);
    }
  };

  // Fetch summary notes from the server
  const fetchSummaryNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/note-summaries/summaries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch note summaries');
        return;
      }
      
      const data = await response.json();
      
      // Convert array to object with note_id as key
      const summariesObj = {};
      data.forEach(summary => {
        summariesObj[summary.note_id] = summary.content;
      });
      
      setSummaryNotes(summariesObj);
      console.log('Fetched summaries for', Object.keys(summariesObj).length, 'notes');
    } catch (error) {
      console.error('Error fetching note summaries:', error);
    }
  };

  // Save a summary note to the server
  const saveSummaryNote = async (noteId, content) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/note-summaries/summaries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          note_id: noteId,
          content: content
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save summary note');
      }
      
      // Update local state
      setSummaryNotes({
        ...summaryNotes,
        [noteId]: content
      });
      
      return true;
    } catch (error) {
      console.error('Error saving summary note:', error);
      return false;
    }
  };

  // Generate auto-summary for a note
  const generateAutoSummary = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/note-summaries/auto-summary', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ noteId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }
      
      const data = await response.json();
      
      // Update local state
      setSummaryNotes({
        ...summaryNotes,
        [noteId]: data.summary
      });
      
      return data.summary;
    } catch (error) {
      console.error('Error generating auto-summary:', error);
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      subject: '',
      semester: '',
      search: ''
    });
  };

  const filterNotes = (notes) => {
    return notes.filter(note => {
      const matchesSubject = !filters.subject || note.subject === filters.subject;
      const matchesSemester = !filters.semester || note.semester === filters.semester;
      const matchesSearch = !filters.search || 
        (note.title && note.title.toLowerCase().includes(filters.search.toLowerCase())) ||
        (note.description && note.description.toLowerCase().includes(filters.search.toLowerCase())) ||
        (note.subject_name && note.subject_name.toLowerCase().includes(filters.search.toLowerCase()));
      
      return matchesSubject && matchesSemester && matchesSearch;
    });
  };

  const filterNotesByType = (type) => {
    return filterNotes(notes).filter(note => note.file_type === type);
  };

  const handleViewNote = (note) => {
    setSelectedNote(note);
    setShowNoteModal(true);
  };

  const handleViewNoteDetail = (note) => {
    setSelectedNote(note);
    setShowNoteDetailModal(true);
  };

  const handleSaveToFolder = (note) => {
    setSelectedNote(note);
    setShowSaveModal(true);
  };

  const handleSaveSubmit = async () => {
    try {
      let folderToUse = saveToFolder;
      
      // If creating a new folder
      if (showNewFolderInput && newFolder.trim()) {
        const token = localStorage.getItem('token');
        const createFolderResponse = await fetch('https://smartstudy-server.onrender.com/api/study-folders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: newFolder.trim() })
        });
        
        if (!createFolderResponse.ok) {
          throw new Error('Failed to create new folder');
        }
        
        const folderData = await createFolderResponse.json();
        folderToUse = folderData.id;
        
        // Update folders list
        setFolders([...folders, { id: folderData.id, name: newFolder.trim() }]);
      }
      
      // Save note to folder
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/study-folders/add-note', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          folderId: folderToUse,
          noteId: selectedNote.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save note to folder');
      }
      
      // Reset and close modal
      setSaveToFolder('');
      setNewFolder('');
      setShowNewFolderInput(false);
      setShowSaveModal(false);
      
      // Show success message
      alert('Note saved to folder successfully!');
    } catch (error) {
      console.error('Error saving note to folder:', error);
      alert('Failed to save note to folder: ' + error.message);
    }
  };

  // Handle showing the summary modal
  const handleShowSummary = (note) => {
    setCurrentSummary(summaryNotes[note.id] || '');
    setSummaryNoteId(note.id);
    setEditingSummary(false);
    setShowSummaryModal(true);
  };

  // Handle saving the summary
  const handleSaveSummary = async () => {
    if (!summaryNoteId) return;
    
    const success = await saveSummaryNote(summaryNoteId, currentSummary);
    
    if (success) {
      setEditingSummary(false);
      alert('Summary saved successfully!');
    } else {
      alert('Failed to save summary. Please try again.');
    }
  };

  // Handle generating auto-summary
  const handleGenerateAutoSummary = async () => {
    if (!summaryNoteId) return;
    
    setEditingSummary(false);
    const generatedSummary = await generateAutoSummary(summaryNoteId);
    
    if (generatedSummary) {
      setCurrentSummary(generatedSummary);
      alert('Summary generated successfully!');
    } else {
      alert('Failed to generate summary. Please try again or create a manual summary.');
    }
  };
  
  const renderFilePreview = (note) => {
    const fileUrl = `https://smartstudy-server.onrender.com${note.file_path}`;
    
    switch (note.file_type) {
      case 'pdf':
        return (
          <div className="file-preview pdf-preview">
            <i className="bi bi-file-earmark-pdf"></i>
            <span>{note.title}</span>
          </div>
        );
      case 'image':
        return (
          <div className="file-preview image-preview">
            <img src={fileUrl} alt={note.title} />
          </div>
        );
      case 'video':
        return (
          <div className="file-preview video-preview">
            <i className="bi bi-file-earmark-play"></i>
            <span>{note.title}</span>
          </div>
        );
      default:
        return (
          <div className="file-preview">
            <i className="bi bi-file-earmark"></i>
            <span>{note.title}</span>
          </div>
        );
    }
  };

  if (loading) {
    return <div className="loading">Loading teachers' notes...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="teachers-notes-page">
       <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
        <button 
        className="toggle-sidebar d-lg-none" 
        type="button" 
        onClick={toggleSidebar}
        style={getToggleButtonStyle()}
      >
        <i className="bi bi-list"></i>
      </button>
          <Link className="navbar-brand" to="/dashboard">
            <img src="/assets/owl.png" alt="JobLMS Logo" className="navbar-logo" />
            SmartStudy
          </Link>
          {/* Rest of navbar content */}
        </div>
      </nav>

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Teachers' Notes</h2>
          <h2>Total Notes: {notes.length}</h2>
          <Link to="/dashboard" className="btn btn-outline-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </Link>
        </div>

        <div className="filter-section card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Filter Notes</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Subject</Form.Label>
                  <Form.Select
                    name="subject"
                    value={filters.subject}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Semester</Form.Label>
                  <Form.Select
                    name="semester"
                    value={filters.semester}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Semesters</option>
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <Form.Control
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by title, description..."
                  />
                </Form.Group>
              </div>
            </div>
            <div className="mt-3 text-end">
              <Button variant="secondary" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultActiveKey="pdf" id="notes-tabs" className="mb-4">
          <Tab eventKey="pdf" title="PDF Documents">
            <div className="row">
              {filterNotesByType('pdf').length > 0 ? (
                filterNotesByType('pdf').map(note => (
                  <div key={note.id} className="col-md-4 col-lg-3 mb-4">
                    <div className="note-card">
                      {renderFilePreview(note)}
                      <div className="note-info">
                        <h5>{note.title}</h5>
                        <p className="text-muted small">
                          {note.subject_name} | {note.semester}
                        </p>
                        <p className="description">{note.description}</p>
                        <div className="note-actions">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleViewNote(note)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            View
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleSaveToFolder(note)}
                          >
                            <i className="bi bi-folder-plus me-1"></i>
                            Save
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleShowSummary(note)}
                          >
                            <i className="bi bi-file-text me-1"></i>
                            Summary
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-info">
                    No PDF documents found with the selected filters.
                  </div>
                </div>
              )}
            </div>
          </Tab>
          
          <Tab eventKey="image" title="Images">
            <div className="row">
              {filterNotesByType('image').length > 0 ? (
                filterNotesByType('image').map(note => (
                  <div key={note.id} className="col-md-4 col-lg-3 mb-4">
                    <div className="note-card">
                      {renderFilePreview(note)}
                      <div className="note-info">
                        <h5>{note.title}</h5>
                        <p className="text-muted small">
                          {note.subject_name} | {note.semester}
                        </p>
                        <p className="description">{note.description}</p>
                        <div className="note-actions">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleViewNote(note)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            View
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleSaveToFolder(note)}
                          >
                            <i className="bi bi-folder-plus me-1"></i>
                            Save
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleShowSummary(note)}
                          >
                            <i className="bi bi-file-text me-1"></i>
                            Summary
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-info">
                    No images found with the selected filters.
                  </div>
                </div>
              )}
            </div>
          </Tab>
          
          <Tab eventKey="video" title="Videos">
            <div className="row">
              {filterNotesByType('video').length > 0 ? (
                filterNotesByType('video').map(note => (
                  <div key={note.id} className="col-md-4 col-lg-3 mb-4">
                    <div className="note-card">
                      {renderFilePreview(note)}
                      <div className="note-info">
                        <h5>{note.title}</h5>
                        <p className="text-muted small">
                          {note.subject_name} | {note.semester}
                        </p>
                        <p className="description">{note.description}</p>
                        <div className="note-actions">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleViewNote(note)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            View
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleSaveToFolder(note)}
                          >
                            <i className="bi bi-folder-plus me-1"></i>
                            Save
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleShowSummary(note)}
                          >
                            <i className="bi bi-file-text me-1"></i>
                            Summary
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-info">
                    No videos found with the selected filters.
                  </div>
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
      {/* View Note Modal */}
      <Modal 
        show={showNoteModal} 
        onHide={() => setShowNoteModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedNote?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNote && (
            <div className="note-preview">
              {selectedNote.file_type === 'pdf' && (
                <div className="pdf-viewer">
                  <iframe
                    src={`https://smartstudy-server.onrender.com${selectedNote.file_path}`}
                    title={selectedNote.title}
                    width="100%"
                    height="500px"
                  ></iframe>
                </div>
              )}
              
              {selectedNote.file_type === 'image' && (
                <div className="image-viewer text-center">
                  <img
                    src={`https://smartstudy-server.onrender.com${selectedNote.file_path}`}
                    alt={selectedNote.title}
                    className="img-fluid"
                  />
                </div>
              )}
              
              {selectedNote.file_type === 'video' && (
                <div className="video-viewer">
                  <video
                    src={`https://smartstudy-server.onrender.com${selectedNote.file_path}`}
                    controls
                    width="100%"
                    height="auto"
                  ></video>
                </div>
              )}
              
              <div className="note-details mt-4">
                <h5>Details</h5>
                <table className="table">
                  <tbody>
                    <tr>
                      <th>Subject</th>
                      <td>{selectedNote.subject_name}</td>
                    </tr>
                    <tr>
                      <th>Semester</th>
                      <td>{selectedNote.semester}</td>
                    </tr>
                    <tr>
                      <th>Description</th>
                      <td>{selectedNote.description || 'No description provided'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
            Close
          </Button>
          <Button 
            variant="success" 
            onClick={() => {
              setShowNoteModal(false);
              handleSaveToFolder(selectedNote);
            }}
          >
            <i className="bi bi-folder-plus me-1"></i>
            Save to Folder
          </Button>
          <Button 
            variant="info" 
            onClick={() => {
              setShowNoteModal(false);
              handleShowSummary(selectedNote);
            }}
          >
            <i className="bi bi-file-text me-1"></i>
            View/Create Summary
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Note Detail Modal */}
      <Modal 
        show={showNoteDetailModal} 
        onHide={() => setShowNoteDetailModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Note Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNote && <NoteDetail noteId={selectedNote.id} />}
        </Modal.Body>
      </Modal>

      {/* Save to Folder Modal */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Save to Study Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {!showNewFolderInput ? (
              <Form.Group className="mb-3">
                <Form.Label>Select Folder</Form.Label>
                <Form.Select
                  value={saveToFolder}
                  onChange={(e) => setSaveToFolder(e.target.value)}
                >
                  <option value="">Select a folder</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </Form.Select>
                <div className="mt-2">
                  <Button 
                    variant="link" 
                    className="p-0"
                    onClick={() => setShowNewFolderInput(true)}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Create New Folder
                  </Button>
                </div>
              </Form.Group>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>New Folder Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  placeholder="Enter folder name"
                />
                <div className="mt-2">
                  <Button 
                    variant="link" 
                    className="p-0"
                    onClick={() => setShowNewFolderInput(false)}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Existing Folders
                  </Button>
                </div>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveSubmit}
            disabled={(showNewFolderInput && !newFolder.trim()) || (!showNewFolderInput && !saveToFolder)}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Summary Modal */}
      <Modal 
        show={showSummaryModal} 
        onHide={() => setShowSummaryModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Note Summary
            {!editingSummary && currentSummary && (
              <SpeechButton 
                text={currentSummary} 
                buttonVariant="outline-primary"
                buttonSize="sm"
                className="ms-2"
              />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingSummary ? (
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={10}
                value={currentSummary}
                onChange={(e) => setCurrentSummary(e.target.value)}
                placeholder="Enter your summary here..."
              />
            </Form.Group>
          ) : (
            <div className="summary-content">
              {currentSummary ? (
                <Card>
                  <Card.Body>
                    <div className="markdown-content">
                      {/* Use ReactMarkdown component if you have it */}
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {currentSummary}
                      </pre>
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <div className="text-center p-5">
                  <p>No summary available for this note yet.</p>
                  <p>You can create a manual summary or generate one automatically.</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSummaryModal(false)}>
            Close
          </Button>
          
          {editingSummary ? (
            <Button variant="primary" onClick={handleSaveSummary}>
              Save Summary
            </Button>
          ) : (
            <>
              <Button 
                variant="outline-primary" 
                onClick={() => setEditingSummary(true)}
              >
                {currentSummary ? 'Edit Summary' : 'Create Manual Summary'}
              </Button>
              
              <Button 
                variant="primary" 
                onClick={handleGenerateAutoSummary}
              >
                {currentSummary ? 'Regenerate Summary' : 'Generate Auto-Summary'}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TeachersNotes;

