import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UploadNotes.css';

const UploadNotes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [subjects, setSubjects] = useState([
    { id: 'CSE101', name: 'Introduction to Computer Science' },
    { id: 'CSE201', name: 'Data Structures' },
    { id: 'CSE301', name: 'Database Systems' },
    { id: 'ECE101', name: 'Basic Electronics' },
    { id: 'ME101', name: 'Engineering Mechanics' },
    { id: 'MATH101', name: 'Calculus' }
  ]);
  const [semesters, setSemesters] = useState([
    '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'
  ]);
  const [teacherProfile, setTeacherProfile] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    semester: '',
    isPublic: true,
    tags: [],
    file: null
  });
  
  // Bulk upload state
  const [bulkData, setBulkData] = useState({
    subject: '',
    semester: '',
    isPublic: true,
    files: []
  });
  
  // Tag input state
  const [tagInput, setTagInput] = useState('');
  useEffect(() => {
    fetchTeacherProfile();
  }, []);
  
  const fetchTeacherProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/teacher/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeacherProfile(data);
      } else {
        toast.error('Failed to fetch teacher profile');
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      toast.error('Error fetching teacher profile');
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleBulkInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBulkData({
      ...bulkData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type based on active tab
      const fileType = file.type;
      let isValid = false;
      
      if (activeTab === 'pdf' && fileType === 'application/pdf') {
        isValid = true;
      } else if (activeTab === 'video' && fileType.startsWith('video/')) {
        isValid = true;
      } else if (activeTab === 'image' && fileType.startsWith('image/')) {
        isValid = true;
      }
      
      if (isValid) {
        setFormData({
          ...formData,
          file
        });
      } else {
        toast.error(`Invalid file type for ${activeTab} upload`);
        e.target.value = null;
      }
    }
  };
  const handleBulkFileChange = (e) => {
    const files = Array.from(e.target.files);
    setBulkData({
      ...bulkData,
      files
    });
  };
  
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject || !formData.semester || !formData.file) {
      toast.error('Please fill all required fields and select a file');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      // Add form fields to FormData
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('subject', formData.subject);
      data.append('semester', formData.semester);
      data.append('isPublic', formData.isPublic);
      data.append('tags', JSON.stringify(formData.tags));
      data.append('file', formData.file);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      const response = await fetch('https://smartstudy-server.onrender.com/api/upload/file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      
      clearInterval(progressInterval);
      
      if (response.ok) {
        setUploadProgress(100);
        const result = await response.json();
        toast.success('File uploaded successfully!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          subject: '',
          semester: '',
          isPublic: true,
          tags: [],
          file: null
        });
        
        // Reset file input
        document.getElementById('fileInput').value = '';
        
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 1000);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Upload failed');
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    if (!bulkData.subject || !bulkData.semester || bulkData.files.length === 0) {
      toast.error('Please select subject, semester, and files');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    try {
        const token = localStorage.getItem('token');
        const data = new FormData();
        
        // Add form fields to FormData
        data.append('subject', bulkData.subject);
        data.append('semester', bulkData.semester);
        data.append('isPublic', bulkData.isPublic);
        
        // Add all files
        bulkData.files.forEach(file => {
          data.append('files', file);
        });
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = prev + 3;
            return newProgress > 90 ? 90 : newProgress;
          });
        }, 300);
        
        const response = await fetch('https://smartstudy-server.onrender.com/api/upload/bulk', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: data
        });
        
        clearInterval(progressInterval);
        
        if (response.ok) {
          setUploadProgress(100);
          const result = await response.json();
          toast.success(`${result.results.filter(r => r.status === 'success').length} files uploaded successfully!`);
          
          // Reset form
          setBulkData({
            subject: '',
            semester: '',
            isPublic: true,
            files: []
          });
          
          // Reset file input
          document.getElementById('bulkFileInput').value = '';
          
          setTimeout(() => {
            setUploadProgress(0);
            setIsUploading(false);
          }, 1000);
        } else {
          const error = await response.json();
          toast.error(error.message || 'Bulk upload failed');
          setIsUploading(false);
          setUploadProgress(0);
        }
      } catch (error) {
        console.error('Error with bulk upload:', error);
        toast.error('Error with bulk upload');
        setIsUploading(false);
        setUploadProgress(0);
      }
    };
    return (
        <div className="upload-notes-container">
          <ToastContainer />
          
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Upload Teaching Materials</h4>
            </div>
            
            <div className="card-body">
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'pdf' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pdf')}
                  >
                    <i className="bi bi-file-earmark-pdf me-2"></i>
                    PDF Documents
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'video' ? 'active' : ''}`}
                    onClick={() => setActiveTab('video')}
                  >
                    <i className="bi bi-camera-video me-2"></i>
                    Video Lectures
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'image' ? 'active' : ''}`}
                    onClick={() => setActiveTab('image')}
                  >
                    <i className="bi bi-image me-2"></i>
                    Images/Diagrams
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'bulk' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bulk')}
                  >
                    <i className="bi bi-upload me-2"></i>
                    Bulk Upload
                  </button>
                </li>
              </ul>
              
              {activeTab !== 'bulk' ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder={`Enter ${activeTab === 'pdf' ? 'document' : activeTab === 'video' ? 'video' : 'image'} title`}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter a brief description of the content"
                    ></textarea>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="subject" className="form-label">Subject <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="semester" className="form-label">Semester <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="semester"
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Semester</option>
                        {semesters.map(semester => (
                          <option key={semester} value={semester}>{semester} Semester</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="tags" className="form-label">Tags</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Add tags to help students find your content"
                        value={tagInput}
                        onChange={handleTagInputChange}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline-primary"
                        onClick={handleAddTag}
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="badge bg-primary me-2 mb-2 p-2">
                      {tag}
                      <i 
                        className="bi bi-x ms-1" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRemoveTag(tag)}
                      ></i>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="fileInput" className="form-label">
                  Upload {activeTab === 'pdf' ? 'PDF' : activeTab === 'video' ? 'Video' : 'Image'} <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="fileInput"
                  onChange={handleFileChange}
                  accept={
                    activeTab === 'pdf' 
                      ? '.pdf' 
                      : activeTab === 'video' 
                        ? 'video/*' 
                        : 'image/*'
                  }
                  required
                />
              </div>
              
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="isPublic">
                  Make this content available to all students
                </label>
              </div>
              
              {isUploading && (
                <div className="mb-3">
                  <div className="progress">
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style={{ width: `${uploadProgress}%` }}
                      aria-valuenow={uploadProgress} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-upload me-2"></i>
                    Upload {activeTab === 'pdf' ? 'Document' : activeTab === 'video' ? 'Video' : 'Image'}
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleBulkSubmit}>
              <div className="alert alert-info">
                <i className="bi bi-info-circle-fill me-2"></i>
                Bulk upload allows you to upload multiple files at once with the same subject and semester.
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="bulkSubject" className="form-label">Subject <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    id="bulkSubject"
                    name="subject"
                    value={bulkData.subject}
                    onChange={handleBulkInputChange}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="bulkSemester" className="form-label">Semester <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    id="bulkSemester"
                    name="semester"
                    value={bulkData.semester}
                    onChange={handleBulkInputChange}
                    required
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>{semester} Semester</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="bulkFileInput" className="form-label">
                  Select Multiple Files <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="bulkFileInput"
                  onChange={handleBulkFileChange}
                  multiple
                  required
                />
                <div className="form-text">
                  {bulkData.files.length > 0 ? (
                    `${bulkData.files.length} files selected`
                  ) : (
                    'You can select multiple files by holding Ctrl (or Cmd on Mac) while selecting'
                  )}
                </div>
              </div>
              
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="bulkIsPublic"
                  name="isPublic"
                  checked={bulkData.isPublic}
                  onChange={handleBulkInputChange}
                />
                <label className="form-check-label" htmlFor="bulkIsPublic">
                  Make all content available to all students
                </label>
              </div>
              
              {isUploading && (
                <div className="mb-3">
                  <div className="progress">
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style={{ width: `${uploadProgress}%` }}
                      aria-valuenow={uploadProgress} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-upload me-2"></i>
                    Upload Files
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadNotes;

    