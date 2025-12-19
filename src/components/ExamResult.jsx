import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ExamResult.css';

const ExamResult = () => {
    const [examResults, setExamResults] = useState([]);
    const location = useLocation();
    const currentResult = location.state;
  
    useEffect(() => {
      if (currentResult) {
        const newResult = {
          id: Date.now(),
          score: parseInt(currentResult.score),
          total_questions: parseInt(currentResult.totalQuestions),
          time_taken: parseInt(2400 - currentResult.timeLeft),
          completed_at: new Date().toISOString()
        };
        setExamResults([newResult]);
      }
      fetchExamResults();
    }, []);
  
    const fetchExamResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://smartstudy-server.onrender.com/api/exam/results', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        const formattedResults = data.map(result => ({
          ...result,
          score: parseInt(result.score),
          total_questions: parseInt(result.total_questions),
          time_taken: parseInt(result.time_taken)
        }));
  
        setExamResults(prevResults => {
          const existingResults = formattedResults.filter(result => 
            !prevResults.some(pr => pr.id === result.id)
          );
          return [...prevResults, ...existingResults];
        });
      } catch (error) {
        console.error('Error fetching exam results:', error);
      }
    };
  
    return (
      <div className="exam-results-container">
        <h2>Your Exam Results</h2>
        <div className="results-grid">
          {examResults.map((result) => (
            <div key={result.id} className="result-card">
              <div className="result-header">
                <span className="date">
                  {new Date(result.completed_at).toLocaleDateString()}
                </span>
                <span className="time">
                  {new Date(result.completed_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="score-section">
                <h3>Score: {result.score}/{result.total_questions * 2}</h3>
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{ 
                      width: `${(result.score / (result.total_questions * 2)) * 100}%`,
                      backgroundColor: result.score >= result.total_questions ? '#4CAF50' : '#ff9800'
                    }}
                  ></div>
                </div>
              </div>
              <div className="details">
                <p>Questions Attempted: {result.total_questions}</p>
                <p>Time Taken: {Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s</p>
                <p>Percentage: {((result.score / (result.total_questions * 2)) * 100).toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
export default ExamResult;
