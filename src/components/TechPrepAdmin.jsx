import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TechPrepAdmin.css';

const TechPrepAdmin = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [profileData, setProfileData] = useState({});
  const [skills, setSkills] = useState([]); // Ensure it's always an array
  const [topics, setTopics] = useState([]);
  const [content, setContent] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(''); // Add error state

  // Modal states
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [skillForm, setSkillForm] = useState({
    name: '',
    description: '',
    icon: 'bi-laptop',
    bg_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'primary'
  });

  const [topicForm, setTopicForm] = useState({
    skill_id: '',
    name: '',
    description: ''
  });

  const [contentForm, setContentForm] = useState({
    topic_id: '',
    title: '',
    description: '',
    content_type: 'pdf',
    file: null
  });

  const iconOptions = [
    'bi-laptop', 'bi-server', 'bi-database', 'bi-kanban', 'bi-code-slash',
    'bi-gear', 'bi-tools', 'bi-graph-up', 'bi-shield', 'bi-cloud'
  ];

  const colorOptions = [
    { value: 'primary', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { value: 'success', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { value: 'info', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { value: 'warning', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { value: 'danger', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { value: 'dark', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  ];

  useEffect(() => {
    fetchProfileData();
    fetchSkills();
    fetchStats();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://smartstudy-server.onrender.com/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfileData(data || {});
      setUserEmail(data?.email || '');
      
      if (data?.role !== 'admin') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to fetch profile data');
    }
  };

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://smartstudy-server.onrender.com/api/tech-prep/skills', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Skills data received:', data); // Debug log
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setSkills(data);
      } else if (data && Array.isArray(data.skills)) {
        setSkills(data.skills);
      } else {
        console.warn('Skills data is not an array:', data);
        setSkills([]);
        setError('Invalid skills data format');
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setSkills([]); // Ensure skills is always an array
      setError('Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (skillId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/tech-prep/skills/${skillId}/topics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTopics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]);
    }
  };

  const fetchContent = async (topicId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/tech-prep/topics/${topicId}/content`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setContent(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent([]);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/tech-prep/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStats(data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({});
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Skill operations
  const handleCreateSkill = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/tech-prep/admin/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(skillForm),
      });

      if (response.ok) {
        setShowSkillModal(false);
        resetSkillForm();
        fetchSkills();
        fetchStats();
        alert('Skill created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error creating skill');
      }
    } catch (error) {
      console.error('Error creating skill:', error);
      alert('Error creating skill');
    }
  };

  const handleUpdateSkill = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/tech-prep/admin/skills/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(skillForm),
      });

      if (response.ok) {
        setShowSkillModal(false);
        setEditingItem(null);
        resetSkillForm();
        fetchSkills();
        alert('Skill updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error updating skill');
      }
    } catch (error) {
      console.error('Error updating skill:', error);
      alert('Error updating skill');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill? This will also delete all related topics and content.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/tech-prep/admin/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchSkills();
        fetchStats();
        if (selectedSkill?.id === skillId) {
          setSelectedSkill(null);
          setTopics([]);
        }
        alert('Skill deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error deleting skill');
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Error deleting skill');
    }
  };

  // Topic operations
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/tech-prep/admin/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(topicForm),
      });

      if (response.ok) {
        setShowTopicModal(false);
        resetTopicForm();
        if (selectedSkill) {
          fetchTopics(selectedSkill.id);
        }
        fetchStats();
        alert('Topic created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error creating topic');
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Error creating topic');
    }
  };

  const handleUpdateTopic = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/tech-prep/admin/topics/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(topicForm),
      });

      if (response.ok) {
        setShowTopicModal(false);
        setEditingItem(null);
        resetTopicForm();
        if (selectedSkill) {
          fetchTopics(selectedSkill.id);
        }
        alert('Topic updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error updating topic');
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      alert('Error updating topic');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic? This will also delete all related content.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/tech-prep/admin/topics/${topicId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        if (selectedSkill) {
          fetchTopics(selectedSkill.id);
        }
        fetchStats();
        if (selectedTopic?.id === topicId) {
          setSelectedTopic(null);
          setContent([]);
        }
        alert('Topic deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error deleting topic');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Error deleting topic');
    }
  };

  // Content operations
  const handleUploadContent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('topic_id', contentForm.topic_id);
      formData.append('title', contentForm.title);
      formData.append('description', contentForm.description);
      formData.append('content_type', contentForm.content_type);
      if (contentForm.file) {
        formData.append('file', contentForm.file);
      }

      const response = await fetch('https://smartstudy-server.onrender.com/api/tech-prep/admin/content', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setShowContentModal(false);
        resetContentForm();
        if (selectedTopic) {
          fetchContent(selectedTopic.id);
        }
        fetchStats();
        alert('Content uploaded successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error uploading content');
      }
    } catch (error) {
      console.error('Error uploading content:', error);
      alert('Error uploading content');
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/tech-prep/admin/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        if (selectedTopic) {
          fetchContent(selectedTopic.id);
        }
        fetchStats();
        alert('Content deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error deleting content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content');
    }
  };

  // Form reset functions
  const resetSkillForm = () => {
    setSkillForm({
      name: '',
      description: '',
      icon: 'bi-laptop',
      bg_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'primary'
    });
  };

  const resetTopicForm = () => {
    setTopicForm({
      skill_id: selectedSkill?.id || '',
      name: '',
      description: ''
    });
  };

  const resetContentForm = () => {
    setContentForm({
      topic_id: selectedTopic?.id || '',
      title: '',
      description: '',
      content_type: 'pdf',
      file: null
    });
  };

  // Modal handlers
  const openSkillModal = (skill = null) => {
    if (skill) {
      setEditingItem(skill);
      setSkillForm({
        name: skill.name,
        description: skill.description,
        icon: skill.icon,
        bg_gradient: skill.bg_gradient,
        color: skill.color
      });
    } else {
      setEditingItem(null);
      resetSkillForm();
    }
    setShowSkillModal(true);
  };

  const openTopicModal = (topic = null) => {
    if (topic) {
      setEditingItem(topic);
      setTopicForm({
        skill_id: selectedSkill?.id || '',
        name: topic.name,
        description: topic.description
      });
    } else {
      setEditingItem(null);
      resetTopicForm();
    }
    setShowTopicModal(true);
  };

  const openContentModal = () => {
    resetContentForm();
    setShowContentModal(true);
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setSelectedTopic(null);
    setContent([]);
    fetchTopics(skill.id);
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    fetchContent(topic.id);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return 'bi-play-circle';
      case 'pdf': return 'bi-file-pdf';
      case 'image': return 'bi-image';
      default: return 'bi-file';
    }
  };

  return (
    <div className="tech-prep-admin-container">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/dashboard">
            <img
              src="/assets/owl.png"
              alt="JobLMS Logo"
              className="navbar-logo"
            />
            SmartStudy Admin
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

      {/* Main Content */}
      <div className="container-fluid mt-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="display-5 mb-0">
                  <i className="bi bi-gear-fill me-3"></i>
                  Tech Prep Admin Panel
                </h1>
                <p className="lead text-muted">
                  Manage skills, topics, and learning content
                </p>
              </div>
              <Link to="/dashboard" className="btn btn-outline-primary">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError('')}
                  aria-label="Close"
                ></button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4>{stats.totalSkills || 0}</h4>
                    <p className="mb-0">Total Skills</p>
                  </div>
                  <i className="bi bi-laptop fs-1"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4>{stats.totalTopics || 0}</h4>
                    <p className="mb-0">Total Topics</p>
                  </div>
                  <i className="bi bi-list-ul fs-1"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4>{stats.totalContent || 0}</h4>
                    <p className="mb-0">Total Content</p>
                  </div>
                  <i className="bi bi-file-earmark fs-1"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4>{stats.contentByType?.length || 0}</h4>
                    <p className="mb-0">Content Types</p>
                  </div>
                  <i className="bi bi-collection fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="row">
          {/* Skills Panel */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-laptop me-2"></i>
                  Skills
                </h5>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => openSkillModal()}
                >
                  <i className="bi bi-plus"></i> Add Skill
                </button>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center p-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : skills.length === 0 ? (
                  <div className="text-center p-4 text-muted">
                    <i className="bi bi-laptop fs-1 mb-3"></i>
                    <p>No skills found. Create your first skill to get started!</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className={`list-group-item list-group-item-action ${
                          selectedSkill?.id === skill.id ? 'active' : ''
                        }`}
                        onClick={() => handleSkillSelect(skill)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <i className={`${skill.icon} me-2 fs-5`}></i>
                            <div>
                              <h6 className="mb-1">{skill.name}</h6>
                              <small className="text-muted">
                                {skill.topic_count || 0} topics, {skill.content_count || 0} content
                              </small>
                            </div>
                          </div>
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-outline-secondary dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <i className="bi bi-three-dots"></i>
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openSkillModal(skill);
                                  }}
                                >
                                  <i className="bi bi-pencil me-2"></i>Edit
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSkill(skill.id);
                                  }}
                                >
                                  <i className="bi bi-trash me-2"></i>Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Topics Panel */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Topics
                  {selectedSkill && (
                    <small className="text-muted ms-2">
                      for {selectedSkill.name}
                    </small>
                  )}
                </h5>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => openTopicModal()}
                  disabled={!selectedSkill}
                >
                  <i className="bi bi-plus"></i> Add Topic
                </button>
              </div>
              <div className="card-body p-0">
                {!selectedSkill ? (
                  <div className="text-center p-4 text-muted">
                    <i className="bi bi-arrow-left fs-1 mb-3"></i>
                    <p>Select a skill to view topics</p>
                  </div>
                ) : topics.length === 0 ? (
                  <div className="text-center p-4 text-muted">
                    <i className="bi bi-list-ul fs-1 mb-3"></i>
                    <p>No topics found for this skill. Add your first topic!</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        className={`list-group-item list-group-item-action ${
                          selectedTopic?.id === topic.id ? 'active' : ''
                        }`}
                        onClick={() => handleTopicSelect(topic)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{topic.name}</h6>
                            <small className="text-muted">
                              {topic.content_count || 0} content items
                            </small>
                          </div>
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-outline-secondary dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <i className="bi bi-three-dots"></i>
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openTopicModal(topic);
                                  }}
                                >
                                  <i className="bi bi-pencil me-2"></i>Edit
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTopic(topic.id);
                                  }}
                                >
                                  <i className="bi bi-trash me-2"></i>Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Panel */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-file-earmark me-2"></i>
                  Content
                  {selectedTopic && (
                    <small className="text-muted ms-2">
                      for {selectedTopic.name}
                    </small>
                  )}
                </h5>
                <button 
                  className="btn btn-info btn-sm"
                  onClick={openContentModal}
                  disabled={!selectedTopic}
                >
                  <i className="bi bi-plus"></i> Add Content
                </button>
              </div>
              <div className="card-body p-0">
                {!selectedTopic ? (
                  <div className="text-center p-4 text-muted">
                    <i className="bi bi-arrow-left fs-1 mb-3"></i>
                    <p>Select a topic to view content</p>
                  </div>
                ) : content.length === 0 ? (
                  <div className="text-center p-4 text-muted">
                    <i className="bi bi-file-earmark fs-1 mb-3"></i>
                    <p>No content found for this topic. Add your first content!</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {content.map((item) => (
                      <div key={item.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <i className={`${getContentTypeIcon(item.content_type)} me-2 fs-5`}></i>
                              <h6 className="mb-0">{item.title}</h6>
                            </div>
                            {item.description && (
                              <p className="mb-2 text-muted small">{item.description}</p>
                            )}
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="badge bg-secondary">
                                {item.content_type?.toUpperCase() || 'UNKNOWN'}
                              </span>
                              {item.file_size && (
                                <small className="text-muted">
                                  {formatFileSize(item.file_size)}
                                </small>
                              )}
                            </div>
                          </div>
                          <div className="dropdown ms-2">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteContent(item.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Modal */}
      {showSkillModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingItem ? 'Edit Skill' : 'Add New Skill'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSkillModal(false)}
                ></button>
              </div>
              <form onSubmit={editingItem ? handleUpdateSkill : handleCreateSkill}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Skill Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={skillForm.description}
                      onChange={(e) => setSkillForm({...skillForm, description: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Icon</label>
                    <select
                      className="form-select"
                      value={skillForm.icon}
                      onChange={(e) => setSkillForm({...skillForm, icon: e.target.value})}
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>
                          {icon.replace('bi-', '').replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Color Theme</label>
                    <select
                      className="form-select"
                      value={skillForm.color}
                      onChange={(e) => {
                        const selectedColor = colorOptions.find(c => c.value === e.target.value);
                        setSkillForm({
                          ...skillForm, 
                          color: e.target.value,
                          bg_gradient: selectedColor.gradient
                        });
                      }}
                    >
                      {colorOptions.map(color => (
                        <option key={color.value} value={color.value}>
                          {color.value.charAt(0).toUpperCase() + color.value.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Preview</label>
                    <div 
                      className="card text-white"
                      style={{ background: skillForm.bg_gradient }}
                    >
                      <div className="card-body text-center">
                        <i className={`${skillForm.icon} fs-1 mb-2`}></i>
                        <h6>{skillForm.name || 'Skill Name'}</h6>
                        <small>{skillForm.description || 'Description'}</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowSkillModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Update' : 'Create'} Skill
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingItem ? 'Edit Topic' : 'Add New Topic'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTopicModal(false)}
                ></button>
              </div>
              <form onSubmit={editingItem ? handleUpdateTopic : handleCreateTopic}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Topic Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={topicForm.name}
                      onChange={(e) => setTopicForm({...topicForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={topicForm.description}
                      onChange={(e) => setTopicForm({...topicForm, description: e.target.value})}
                    ></textarea>
                  </div>
                  {selectedSkill && (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      This topic will be added to: <strong>{selectedSkill.name}</strong>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowTopicModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    {editingItem ? 'Update' : 'Create'} Topic
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {showContentModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Content</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowContentModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUploadContent}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Content Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contentForm.title}
                      onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={contentForm.description}
                      onChange={(e) => setContentForm({...contentForm, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Content Type *</label>
                    <select
                      className="form-select"
                      value={contentForm.content_type}
                      onChange={(e) => setContentForm({...contentForm, content_type: e.target.value})}
                      required
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Upload File *</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => setContentForm({...contentForm, file: e.target.files[0]})}
                      accept={
                        contentForm.content_type === 'pdf' ? '.pdf' :
                        contentForm.content_type === 'video' ? '.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv' :
                        '.jpg,.jpeg,.png,.gif'
                      }
                      required
                    />
                    <div className="form-text">
                      {contentForm.content_type === 'pdf' && 'Accepted formats: PDF'}
                      {contentForm.content_type === 'video' && 'Accepted formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV'}
                      {contentForm.content_type === 'image' && 'Accepted formats: JPG, JPEG, PNG, GIF'}
                      <br />Maximum file size: 100MB
                    </div>
                  </div>
                  {selectedTopic && (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      This content will be added to: <strong>{selectedTopic.name}</strong>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowContentModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-info">
                    Upload Content
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechPrepAdmin;
