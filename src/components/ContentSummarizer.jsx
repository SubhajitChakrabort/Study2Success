import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Modal, Spinner, Tab, Tabs, Badge, Alert } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

import './ContentSummarizer.css';

const ContentSummarizer = () => {
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
  const [selectedNote, setSelectedNote] = useState(null);
  const [summaryNotes, setSummaryNotes] = useState({});
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [currentSummary, setCurrentSummary] = useState('');
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryNoteId, setSummaryNoteId] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [transcriptionStatus, setTranscriptionStatus] = useState('');

  useEffect(() => {
    fetchProfileData();
    fetchTeachersNotes();
    fetchSubjectsAndSemesters();
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

  // Fetch summary notes from the server
  const fetchSummaryNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/notes/summaries', {
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
      const response = await fetch('https://smartstudy-server.onrender.com/api/notes/summaries', {
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

  // Handle auto-generating summaries with improved error handling
  const handleAutoGenerateSummary = async (note) => {
    try {
      setGeneratingSummary(true);
      setSummaryError('');
      setSummaryNoteId(note.id);
      
      // Show a loading modal with appropriate message for videos
      if (note.file_type === 'video') {
        setTranscriptionStatus('starting');
        setCurrentSummary('Extracting audio and transcribing video content...\n\nThis process may take several minutes for longer videos.');
      } else {
        setCurrentSummary('Analyzing content and generating summary...\n\nThis may take a minute for large files.');
      }
      
      setShowSummaryModal(true);
      setEditingSummary(false);
      
      console.log(`Requesting summary for note ID: ${note.id}`);
      
      // Update transcription status for videos
      if (note.file_type === 'video') {
        setTranscriptionStatus('extracting');
        setTimeout(() => {
          if (generatingSummary) {
            setTranscriptionStatus('transcribing');
          }
        }, 5000);
        
        setTimeout(() => {
          if (generatingSummary) {
            setTranscriptionStatus('summarizing');
          }
        }, 15000);
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/notes/auto-summary', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ noteId: note.id })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }
      
      // Update the summaries state
      setSummaryNotes({
        ...summaryNotes,
        [note.id]: data.summary
      });
      
      setCurrentSummary(data.summary);
      setEditingSummary(true); // Allow user to edit the auto-generated summary
      setTranscriptionStatus('completed');
      
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummaryError(error.message);
      setTranscriptionStatus('failed');
      
      // Create a fallback summary when auto-generation fails
      const fallbackSummary = `## Summary Generation Failed\n\nUnable to automatically generate a summary for this content.\n\n### Error Details\n${error.message}\n\n---\n\nYou can write your own summary here based on the ${note.file_type} content titled "${note.title}".`;
      
      setCurrentSummary(fallbackSummary);
      setEditingSummary(true);
    } finally {
      setGeneratingSummary(false);
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

  // Render transcription status for videos
   // Render transcription status for videos
   const renderTranscriptionStatus = () => {
    if (!transcriptionStatus || selectedNote?.file_type !== 'video') return null;
    
    let message = '';
    let progress = 0;
    
    switch (transcriptionStatus) {
      case 'starting':
        message = 'Preparing to process video...';
        progress = 10;
        break;
      case 'extracting':
        message = 'Extracting audio from video...';
        progress = 30;
        break;
      case 'transcribing':
        message = 'Transcribing speech to text...';
        progress = 60;
        break;
      case 'summarizing':
        message = 'Generating summary from transcription...';
        progress = 85;
        break;
      case 'completed':
        message = 'Transcription and summarization complete!';
        progress = 100;
        break;
      case 'failed':
        message = 'Transcription process failed';
        progress = 100;
        break;
      default:
        return null;
    }
    
    return (
      <div className="transcription-status mt-3 mb-4">
        <p className="mb-1">{message}</p>
        <div className="progress">
          <div 
            className={`progress-bar ${transcriptionStatus === 'failed' ? 'bg-danger' : 'bg-info'}`} 
            role="progressbar" 
            style={{ width: `${progress}%` }} 
            aria-valuenow={progress} 
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading content for summarization...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="content-summarizer-page">
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
          <div>
            <h2>Content Summarizer</h2>
            <p className="text-muted">Automatically generate summaries for your educational content</p>
          </div>
          <Link to="/dashboard" className="btn btn-outline-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </Link>
        </div>

        <div className="info-card mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-magic me-2"></i>
                How It Works
              </h5>
              <p>
                Our AI-powered content summarizer can analyze your PDFs, images, and videos to generate concise summaries.
                Click the "Auto-Generate" button on any content to create a summary, which you can then edit and save.
              </p>
              <div className="alert alert-info">
                <i className="bi bi-info-circle-fill me-2"></i>
                <strong>Note:</strong> For videos, our system will extract the audio, transcribe it to text, and then generate a summary.
                This process may take several minutes depending on the video length.
              </div>
            </div>
          </div>
        </div>

        <div className="filter-section card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Filter Content</h5>
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

        <Tabs defaultActiveKey="pdf" id="content-tabs" className="mb-4">
          <Tab eventKey="pdf" title="PDF Documents">
            <div className="row">
              {filterNotesByType('pdf').length > 0 ? (
                filterNotesByType('pdf').map(note => (
                  <div key={note.id} className="col-md-4 col-lg-3 mb-4">
                    <Card className="h-100 content-card">
                      {renderFilePreview(note)}
                      <Card.Body>
                        <Card.Title>{note.title}</Card.Title>
                        <p className="text-muted small">
                          {note.subject_name} | {note.semester}
                        </p>
                        <p className="description">{note.description}</p>
                        
                        {/* Show summary preview if available */}
                        {summaryNotes[note.id] && (
                          <div className="summary-preview mt-2">
                            <h6 className="text-primary">
                              <i className="bi bi-journal-text me-1"></i>
                              Summary
                            </h6>
                            <div className="summary-text">
                              {summaryNotes[note.id].includes('##') ? (
                                <ReactMarkdown>
                                  {summaryNotes[note.id].length > 150 
                                    ? summaryNotes[note.id].substring(0, 150) + '...' 
                                    : summaryNotes[note.id]}
                                </ReactMarkdown>
                              ) : (
                                <p>
                                  {summaryNotes[note.id].length > 150 
                                    ? summaryNotes[note.id].substring(0, 150) + '...' 
                                    : summaryNotes[note.id]}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="content-actions mt-3">
                          <Button 
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewNote(note)}
                            className="me-2"
                          >
                            <i className="bi bi-eye me-1"></i>
                            View
                          </Button>
                          
                          {summaryNotes[note.id] ? (
                            <Button 
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleShowSummary(note)}
                            >
                              <i className="bi bi-journal-text me-1"></i>
                              View Summary
                            </Button>
                          ) : (
                            <Button 
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleAutoGenerateSummary(note)}
                              disabled={generatingSummary}
                            >
                              {generatingSummary && summaryNoteId === note.id ? (
                                <>
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-1"
                                  />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-magic me-1"></i>
                                  Auto-Generate
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
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
                    <Card className="h-100 content-card">
                      {renderFilePreview(note)}
                      <Card.Body>
                        <Card.Title>{note.title}</Card.Title>
                        <p className="text-muted small">
                          {note.subject_name} | {note.semester}
                        </p>
                        <p className="description">{note.description}</p>
                        
                        {/* Show summary preview if available */}
                        {summaryNotes[note.id] && (
                          <div className="summary-preview mt-2">
                            <h6 className="text-primary">
                              <i className="bi bi-journal-text me-1"></i>
                              Summary
                            </h6>
                            <div className="summary-text">
                              {summaryNotes[note.id].includes('##') ? (
                                <ReactMarkdown>
                                  {summaryNotes[note.id].length > 150 
                                    ? summaryNotes[note.id].substring(0, 150) + '...' 
                                    : summaryNotes[note.id]}
                                </ReactMarkdown>
                              ) : (
                                <p>
                                  {summaryNotes[note.id].length > 150 
                                    ? summaryNotes[note.id].substring(0, 150) + '...' 
                                    : summaryNotes[note.id]}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="content-actions mt-3">
                          <Button 
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewNote(note)}
                            className="me-2"
                          >
                            <i className="bi bi-eye me-1"></i>
                            View
                          </Button>
                          
                          {summaryNotes[note.id] ? (
                            <Button 
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleShowSummary(note)}
                            >
                              <i className="bi bi-journal-text me-1"></i>
                              View Summary
                            </Button>
                          ) : (
                            <Button 
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleAutoGenerateSummary(note)}
                              disabled={generatingSummary}
                            >
                              {generatingSummary && summaryNoteId === note.id ? (
                                <>
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-1"
                                  />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-magic me-1"></i>
                                  Auto-Generate
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
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
                    <Card className="h-100 content-card">
                      {renderFilePreview(note)}
                      <Card.Body>
                        <Card.Title>{note.title}</Card.Title>
                        <p className="text-muted small">
                          {note.subject_name} | {note.semester}
                        </p>
                        <p className="description">{note.description}</p>
                        
                        {/* Show summary preview if available */}
                        {summaryNotes[note.id] && (
                          <div className="summary-preview mt-2">
                            <h6 className="text-primary">
                              <i className="bi bi-journal-text me-1"></i>
                              Summary
                              </h6>
                            <div className="summary-text">
                              {summaryNotes[note.id].includes('##') ? (
                                <ReactMarkdown>
                                  {summaryNotes[note.id].length > 150 
                                    ? summaryNotes[note.id].substring(0, 150) + '...' 
                                    : summaryNotes[note.id]}
                                </ReactMarkdown>
                              ) : (
                                <p>
                                  {summaryNotes[note.id].length > 150 
                                    ? summaryNotes[note.id].substring(0, 150) + '...' 
                                    : summaryNotes[note.id]}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="content-actions mt-3">
                          <Button 
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewNote(note)}
                            className="me-2"
                          >
                            <i className="bi bi-eye me-1"></i>
                            View
                          </Button>
                          
                          {summaryNotes[note.id] ? (
                            <Button 
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleShowSummary(note)}
                            >
                              <i className="bi bi-journal-text me-1"></i>
                              View Summary
                            </Button>
                          ) : (
                            <Button 
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleAutoGenerateSummary(note)}
                              disabled={generatingSummary}
                            >
                              {generatingSummary && summaryNoteId === note.id ? (
                                <>
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-1"
                                  />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-magic me-1"></i>
                                  Auto-Generate
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
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
              
              {/* Show summary if available */}
              {summaryNotes[selectedNote.id] && (
                <div className="summary-section mt-3">
                  <h5>
                    <i className="bi bi-journal-text me-2"></i>
                    Summary
                  </h5>
                  <div className="summary-content p-3 bg-light rounded">
                    <ReactMarkdown>
                      {summaryNotes[selectedNote.id]}
                    </ReactMarkdown>
                  </div>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      setCurrentSummary(summaryNotes[selectedNote.id]);
                      setSummaryNoteId(selectedNote.id);
                      setShowNoteModal(false);
                      setShowSummaryModal(true);
                      setEditingSummary(true);
                    }}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit Summary
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
            Close
          </Button>
          
          {selectedNote && !summaryNotes[selectedNote.id] && (
            <Button 
              variant="primary" 
              onClick={() => {
                setShowNoteModal(false);
                handleAutoGenerateSummary(selectedNote);
              }}
              disabled={generatingSummary}
            >
              {generatingSummary ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-1"
                  />
                  Generating Summary...
                </>
              ) : (
                <>
                  <i className="bi bi-magic me-1"></i>
                  Generate Summary
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* Summary Modal */}
      <Modal 
        show={showSummaryModal} 
        onHide={() => {
          if (!generatingSummary) {
            setShowSummaryModal(false);
            setTranscriptionStatus('');
          }
        }}
        size="lg"
        centered
        backdrop={generatingSummary ? 'static' : true}
        keyboard={!generatingSummary}
      >
        <Modal.Header closeButton={!generatingSummary}>
          <Modal.Title>
            {generatingSummary ? 'Generating Summary' : (editingSummary ? 'Edit Summary' : 'Content Summary')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {summaryError && (
            <div className="alert alert-danger mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {summaryError}
            </div>
          )}
          
          {generatingSummary && (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">
                {selectedNote?.file_type === 'video' 
                  ? 'Processing video content...' 
                  : 'Analyzing content and generating summary...'}
              </p>
              <p className="text-muted small">
                {selectedNote?.file_type === 'video' 
                  ? 'This may take several minutes for longer videos.' 
                  : 'This may take a minute for large files.'}
              </p>
              
              {/* Show transcription status for videos */}
              {renderTranscriptionStatus()}
            </div>
          )}
          
          {!generatingSummary && (
            <>
              {editingSummary ? (
                <Form.Group>
                  <Form.Label>Edit your summary:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={12}
                    value={currentSummary}
                    onChange={(e) => setCurrentSummary(e.target.value)}
                    className="font-monospace"
                  />
                  <div className="mt-2 text-muted small">
                    <p>
                      <i className="bi bi-info-circle me-1"></i>
                      You can use Markdown formatting in your summary.
                    </p>
                    <p>Examples:</p>
                    <ul>
                      <li><code># Heading 1</code> for main headings</li>
                      <li><code>## Heading 2</code> for subheadings</li>
                      <li><code>**bold text**</code> for <strong>bold text</strong></li>
                      <li><code>*italic text*</code> for <em>italic text</em></li>
                      <li><code>- item</code> for bullet points</li>
                    </ul>
                  </div>
                </Form.Group>
              ) : (
                <div className="summary-preview">
                  <div className="p-3 bg-light rounded">
                    <ReactMarkdown>
                      {currentSummary}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!generatingSummary && (
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowSummaryModal(false);
                setTranscriptionStatus('');
              }}
            >
              {editingSummary ? 'Cancel' : 'Close'}
            </Button>
          )}
          
          {editingSummary && !generatingSummary && (
            <>
              <Button 
                variant="primary" 
                onClick={handleSaveSummary}
              >
                <i className="bi bi-save me-1"></i>
                Save Summary
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => setEditingSummary(false)}
              >
                <i className="bi bi-eye me-1"></i>
                Preview
              </Button>
            </>
          )}
          
          {!editingSummary && !generatingSummary && (
            <Button 
              variant="primary" 
              onClick={() => setEditingSummary(true)}
            >
              <i className="bi bi-pencil me-1"></i>
              Edit
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ContentSummarizer;

