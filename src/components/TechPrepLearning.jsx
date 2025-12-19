import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './TechPrepLearning.css';

const TechPrepLearning = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const [skillData, setSkillData] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkillDetails();
  }, [skillId]);

  useEffect(() => {
    if (selectedTopic) {
      fetchContent(selectedTopic.id);
    }
  }, [selectedTopic]);

  const fetchSkillDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://smartstudy-server.onrender.com/api/tech-prep/skills/${skillId}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSkillData(data.skill);
        setTopics(data.topics);
        if (data.topics.length > 0) {
          setSelectedTopic(data.topics[0]);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching skill details:', error);
      setLoading(false);
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
      
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const renderContent = (contentItem) => {
    switch (contentItem.content_type) {
      case 'pdf':
        return (
          <iframe
            src={`https://smartstudy-server.onrender.com${contentItem.file_path}`}
            width="100%"
            height="600px"
            title={contentItem.title}
          />
        );
      case 'video':
        return (
          <video controls width="100%" height="400px">
            <source src={`https://smartstudy-server.onrender.com${contentItem.file_path}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case 'image':
        return (
          <img
            src={`https://smartstudy-server.onrender.com${contentItem.file_path}`}
            alt={contentItem.title}
            className="img-fluid"
            style={{ maxHeight: '500px' }}
          />
        );
      default:
        return <p>Unsupported content type</p>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Topics Sidebar */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Topics</h5>
            </div>
            <div className="list-group list-group-flush">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  className={`list-group-item list-group-item-action ${
                    selectedTopic?.id === topic.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="col-md-9">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">{selectedTopic?.name || 'Select a Topic'}</h5>
            </div>
            <div className="card-body">
              {content.map((item) => (
                <div key={item.id} className="mb-4">
                  <h4>{item.title}</h4>
                  {item.description && <p className="text-muted">{item.description}</p>}
                  <div className="content-display">
                    {renderContent(item)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechPrepLearning;
