import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExamComponent.css';

const ExamComponent = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2400); // 40 minutes total
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    try {
      const response = await fetch('https://opentdb.com/api.php?amount=20&category=18&type=multiple');
      const data = await response.json();
      
      const formattedQuestions = data.results.map((q, index) => ({
        id: index + 1,
        category: q.category,
        question: q.question,
        options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
        correct_answer: q.correct_answer
      }));
  
      setQuestions(formattedQuestions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchQuestions();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        submitExam();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleAnswer = (selectedOption) => {
    setAnswers({
      ...answers,
      [currentQuestion]: selectedOption
    });

    if (selectedOption === questions[currentQuestion].correct_answer) {
      setScore(prevScore => prevScore + 2);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const submitExam = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/exam/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers,
          score,
          totalQuestions: questions.length,
          timeLeft
        })
      });

      if (response.ok) {
        navigate('/exam-result', { 
          state: { 
            score,
            totalQuestions: questions.length,
            timeLeft
          } 
        });
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  };

  if (loading) {
    return (
      <div className="exam-container">
        <div className="loading">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="exam-container">
      <div className="exam-header">
        <h2>Technical Assessment</h2>
        <div className="timer">
          Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {questions[currentQuestion] && (
        <div className="question-container">
          <div className="question-header">
            <span className="question-number">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="question-category">
              Category: {questions[currentQuestion].category}
            </span>
          </div>

          <div className="question">
            {questions[currentQuestion].question}
          </div>

          <div className="options">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${answers[currentQuestion] === option ? 'selected' : ''}`}
                onClick={() => handleAnswer(option)}
                disabled={answers[currentQuestion]}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentQuestion === questions.length - 1 && (
        <button 
          className="submit-btn"
          onClick={submitExam}
        >
          Submit Exam
        </button>
      )}

      <div className="score-display">
        Current Score: {score}/{questions.length * 2}
      </div>
    </div>
  );
};

export default ExamComponent;
