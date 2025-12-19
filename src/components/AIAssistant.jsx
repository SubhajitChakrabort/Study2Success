import React, { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi there! I'm your SmartStudy AI Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('unknown'); // 'online', 'offline', or 'unknown'
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Check AI service status when component mounts
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://smartstudy-server.onrender.com/api/ai/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAiStatus(data.status);
        }
      } catch (error) {
        console.error('Error checking AI status:', error);
        setAiStatus('offline');
      }
    };
    
    checkAIStatus();
    
    // Check status periodically (every 5 minutes)
    const intervalId = setInterval(checkAIStatus, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Check if we need to enforce a delay between requests to avoid rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minRequestInterval = 3000; // 3 seconds between requests
    
    if (timeSinceLastRequest < minRequestInterval) {
      // Add a "thinking" message
      setMessages(prev => [...prev, { 
        text: "I'm thinking...", 
        sender: 'bot',
        isTemporary: true 
      }]);
      
      // Wait for the remaining time
      await new Promise(resolve => 
        setTimeout(resolve, minRequestInterval - timeSinceLastRequest)
      );
      
      // Remove any temporary messages
      setMessages(prev => prev.filter(msg => !msg.isTemporary));
    }
    
    // Update last request time
    setLastRequestTime(now);
    
    // Add user message to chat
    const userMessage = { text: inputMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: currentMessage })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      
      // Add bot response to chat
      setMessages(prev => [...prev, { text: data.response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error communicating with AI assistant:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      {/* Chat toggle button */}
      <button 
        className={`chat-toggle-btn ${aiStatus === 'offline' ? 'offline' : ''}`}
        onClick={toggleChat}
        title={`AI Study Assistant ${aiStatus === 'offline' ? '(Offline Mode)' : ''}`}
      >
        {isOpen ? (
          <i className="bi bi-x-circle-fill"></i>
        ) : (
          <>
            <i className="bi bi-robot"></i>
            {aiStatus === 'offline' && <span className="status-indicator offline"></span>}
          </>
        )}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h5>
              <i className="bi bi-robot me-2"></i>
              SmartStudy AI Assistant
              {aiStatus === 'offline' && <span className="badge bg-warning ms-2">Offline Mode</span>}
            </h5>
            <button className="close-btn" onClick={toggleChat}>
              <i className="bi bi-x"></i>
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chat-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Ask me anything about your studies..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !inputMessage.trim()}>
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
