import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TechPrep.css';

const TechPrep = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [profileData, setProfileData] = useState({});
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({});

  useEffect(() => {
    fetchProfileData();
    fetchSkills();
    loadAllProgress();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setProfileData(data || {});
      setUserEmail(data?.email || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/tech-prep/skills', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      } else {
        // Fallback to static data if API is not available
        setSkills([
          {
            id: 1,
            name: 'Frontend Development',
            icon: 'bi-laptop',
            description: 'Master modern frontend technologies and frameworks',
            bg_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'primary',
            topic_count: 7
          },
          {
            id: 2,
            name: 'Backend Development',
            icon: 'bi-server',
            description: 'Build robust server-side applications and APIs',
            bg_gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'success',
            topic_count: 7
          },
          {
            id: 3,
            name: 'Database Management',
            icon: 'bi-database',
            description: 'Design and optimize database systems',
            bg_gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'info',
            topic_count: 7
          },
          {
            id: 4,
            name: 'Project Management',
            icon: 'bi-kanban',
            description: 'Learn agile methodologies and project coordination',
            bg_gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'warning',
            topic_count: 7
          }
        ]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching skills:', error);
      // Fallback to static data
      setSkills([
        {
          id: 1,
          name: 'Frontend Development',
          icon: 'bi-laptop',
          description: 'Master modern frontend technologies and frameworks',
          bg_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'primary',
          topic_count: 7
        },
        {
          id: 2,
          name: 'Backend Development',
          icon: 'bi-server',
          description: 'Build robust server-side applications and APIs',
          bg_gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'success',
          topic_count: 7
        },
        {
          id: 3,
          name: 'Database Management',
          icon: 'bi-database',
          description: 'Design and optimize database systems',
          bg_gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'info',
          topic_count: 7
        },
        {
          id: 4,
          name: 'Project Management',
          icon: 'bi-kanban',
          description: 'Learn agile methodologies and project coordination',
          bg_gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'warning',
          topic_count: 7
        }
      ]);
      setLoading(false);
    }
  };

  const loadAllProgress = () => {
    const allProgress = {};
    skills.forEach(skill => {
      const savedProgress = localStorage.getItem(`tech_prep_progress_${skill.id}`);
      if (savedProgress) {
        const skillProgress = JSON.parse(savedProgress);
        const topicProgresses = Object.values(skillProgress);
        const overallProgress = topicProgresses.length > 0 
          ? topicProgresses.reduce((sum, progress) => sum + progress, 0) / topicProgresses.length
          : 0;
        allProgress[skill.id] = Math.round(overallProgress);
      } else {
        allProgress[skill.id] = 0;
      }
    });
    setProgressData(allProgress);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleStartLearning = (skillId) => {
    navigate(`/tech-prep/learn/${skillId}`);
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return 'bg-secondary';
    if (progress < 30) return 'bg-danger';
    if (progress < 70) return 'bg-warning';
    return 'bg-success';
  };

  const getCompletedCount = () => {
    return Object.values(progressData).filter(progress => progress === 100).length;
  };

  return (
    <div className="tech-prep-container">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/dashboard">
            <img
              src="/assets/owl.png"
              alt="JobLMS Logo"
              className="navbar-logo"
            />
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
              {profileData?.role === 'admin' && (
                <>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/tech-prep-admin">
                      <i className="bi bi-gear me-2"></i>
                      Manage Tech Prep
                    </Link>
                  </li>
                </>
              )}
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
      <div className="container mt-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center mb-3">
              <Link to="/dashboard" className="btn btn-outline-primary me-3">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Dashboard
              </Link>
              <div>
                <h1 className="display-4 mb-0">
                  <i className="bi bi-laptop me-3"></i>
                  Tech Prep Hub
                </h1>
                <p className="lead text-muted">
                  Master the skills needed for your tech career journey
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="row">
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading tech skills...</p>
            </div>
                   </div>
        ) : (
          <>
            {/* Skills Overview */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card bg-light">
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-md-3">
                        <h3 className="text-primary">{skills.length}</h3>
                        <p className="mb-0">Skills Available</p>
                      </div>
                      <div className="col-md-3">
                        <h3 className="text-success">
                          {skills.reduce((total, skill) => total + (skill.topic_count || 0), 0)}
                        </h3>
                        <p className="mb-0">Total Topics</p>
                      </div>
                      <div className="col-md-3">
                        <h3 className="text-info">
                          {skills.reduce((total, skill) => total + (skill.content_count || 0), 0)}
                        </h3>
                        <p className="mb-0">Learning Materials</p>
                      </div>
                      <div className="col-md-3">
                        <h3 className="text-warning">{getCompletedCount()}</h3>
                        <p className="mb-0">Completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preparation Categories */}
            <div className="row">
              {skills.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
                  <h4 className="text-muted">No Skills Available</h4>
                  <p className="text-muted">
                    {profileData?.role === 'admin' 
                      ? 'Start by adding some skills in the admin panel.' 
                      : 'Skills will be available soon. Please check back later.'}
                  </p>
                  {profileData?.role === 'admin' && (
                    <Link to="/tech-prep-admin" className="btn btn-primary">
                      <i className="bi bi-plus me-2"></i>
                      Add Skills
                    </Link>
                  )}
                </div>
              ) : (
                skills.map((skill) => {
                  const skillProgress = progressData[skill.id] || 0;
                  return (
                    <div key={skill.id} className="col-lg-6 col-md-6 mb-4">
                      <div className="prep-card h-100">
                        <div 
                          className="prep-card-header"
                          style={{ background: skill.bg_gradient }}
                        >
                          <div className="prep-icon">
                            <i className={`bi ${skill.icon}`}></i>
                          </div>
                          <h3 className="prep-title">{skill.name}</h3>
                          <p className="prep-description">{skill.description}</p>
                        </div>
                        
                        <div className="prep-card-body">
                          <div className="skill-stats mb-3">
                            <div className="row text-center">
                              <div className="col-6">
                                <div className="stat-item">
                                  <h5 className="mb-1">{skill.topic_count || 0}</h5>
                                  <small className="text-muted">Topics</small>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="stat-item">
                                  <h5 className="mb-1">{skill.content_count || 0}</h5>
                                  <small className="text-muted">Materials</small>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="progress mb-3" style={{ height: '10px' }}>
                            <div 
                              className={`progress-bar ${getProgressColor(skillProgress)}`}
                              role="progressbar" 
                              style={{ width: `${skillProgress}%` }}
                              aria-valuenow={skillProgress} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <small className="text-muted d-block mb-3">
                            Progress: {skillProgress}% Complete
                            {skillProgress === 100 && (
                              <i className="bi bi-check-circle-fill text-success ms-2"></i>
                            )}
                          </small>
                          
                          <div className="prep-actions">
                            <button 
                              className={`btn btn-lg w-100 mb-2 ${
                                skillProgress === 0 ? 'btn-primary' : 
                                skillProgress === 100 ? 'btn-success' : 'btn-warning'
                              }`}
                              onClick={() => handleStartLearning(skill.id)}
                            >
                              <i className={`bi ${
                                skillProgress === 0 ? 'bi-play-circle' : 
                                skillProgress === 100 ? 'bi-check-circle' : 'bi-arrow-clockwise'
                              } me-2`}></i>
                              {skillProgress === 0 ? 'Start Learning' : 
                               skillProgress === 100 ? 'Review Content' : 'Continue Learning'}
                            </button>
                            
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-outline-secondary flex-fill"
                                onClick={() => handleStartLearning(skill.id)}
                              >
                                <i className="bi bi-bookmark me-1"></i>
                                Resources
                              </button>
                              <button 
                                className="btn btn-outline-secondary flex-fill"
                                onClick={() => handleStartLearning(skill.id)}
                              >
                                <i className="bi bi-graph-up me-1"></i>
                                Progress
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Progress Overview */}
            {skills.length > 0 && (
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="bi bi-graph-up me-2"></i>
                        Your Learning Progress
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {skills.map((skill) => {
                          const skillProgress = progressData[skill.id] || 0;
                          return (
                            <div key={skill.id} className="col-md-6 col-lg-3 mb-3">
                              <div className="progress-summary p-3 border rounded">
                                <div className="d-flex align-items-center mb-2">
                                  <i className={`${skill.icon} me-2 fs-5`}></i>
                                  <h6 className="mb-0">{skill.name}</h6>
                                </div>
                                <div className="progress mb-2" style={{ height: '6px' }}>
                                  <div 
                                    className={`progress-bar ${getProgressColor(skillProgress)}`}
                                    style={{ width: `${skillProgress}%` }}
                                  ></div>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <small className="text-muted">{skillProgress}%</small>
                                  <small className="text-muted">
                                    {skillProgress === 100 ? (
                                      <span className="text-success">
                                        <i className="bi bi-check-circle-fill me-1"></i>
                                        Complete
                                      </span>
                                    ) : skillProgress > 0 ? (
                                      <span className="text-warning">
                                        <i className="bi bi-clock me-1"></i>
                                        In Progress
                                      </span>
                                    ) : (
                                      <span className="text-muted">
                                        <i className="bi bi-circle me-1"></i>
                                        Not Started
                                      </span>
                                    )}
                                  </small>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Features Section */}
            {skills.length > 0 && (
              <div className="row mt-5">
                <div className="col-12">
                  <div className="feature-section">
                    <h2 className="text-center mb-4">
                      <i className="bi bi-stars me-2"></i>
                      Learning Features
                    </h2>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div className="feature-card text-center p-4">
                          <i className="bi bi-trophy feature-icon text-warning fs-1 mb-3"></i>
                          <h5>Skill Assessments</h5>
                          <p className="text-muted">Test your knowledge with interactive quizzes and practical exercises</p>
                          <span className="badge bg-warning">Coming Soon</span>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="feature-card text-center p-4">
                          <i className="bi bi-people feature-icon text-info fs-1 mb-3"></i>
                          <h5>Study Groups</h5>
                          <p className="text-muted">Join collaborative learning sessions with peers and mentors</p>
                          <span className="badge bg-info">Coming Soon</span>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="feature-card text-center p-4">
                          <i className="bi bi-calendar-event feature-icon text-success fs-1 mb-3"></i>
                          <h5>Learning Path</h5>
                          <p className="text-muted">Follow structured learning roadmaps tailored to your career goals</p>
                          <span className="badge bg-success">Coming Soon</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions for Admin */}
            {profileData?.role === 'admin' && (
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card border-primary">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-gear-fill me-2"></i>
                        Admin Quick Actions
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-2">
                          <Link to="/tech-prep-admin" className="btn btn-outline-primary w-100">
                            <i className="bi bi-plus-circle me-2"></i>
                            Manage Skills & Content
                          </Link>
                        </div>
                        <div className="col-md-4 mb-2">
                          <button className="btn btn-outline-info w-100" disabled>
                            <i className="bi bi-bar-chart me-2"></i>
                            View Analytics
                          </button>
                        </div>
                        <div className="col-md-4 mb-2">
                          <button className="btn btn-outline-success w-100" disabled>
                            <i className="bi bi-people me-2"></i>
                            Student Progress
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
         {/* Footer */}
      <footer className="mt-5 py-4 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h6>Tech Prep Hub</h6>
              <p className="text-muted small">
                Empowering students with industry-relevant technical skills and knowledge.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <small className="text-muted">
                Need help? <Link to="/help-support">Contact Support</Link>
              </small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TechPrep;
