import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./SearchWeb.css";

const SearchWeb = () => {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedResult, setExpandedResult] = useState(null);

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Operating Systems",
    "Database Management Systems",
    "Java Programming",
    "Python Programming",
    "Data Structures & Algorithms",
    "Computer Networking",
    "Cyber Security",
    "Computer Architecture",
    "JavaScript",
    "PHP",
    "Unix/Linux",
    "Web Development",
    "Machine Learning",
    "Artificial Intelligence",
    "Software Engineering",
    "Cloud Computing",
    "History",
    "Geography",
    "Literature",
    "Economics",
    "Psychology"
  ];

  // Function to search using external APIs
  const searchExternalSources = async (searchQuery, selectedSubject) => {
    const fullQuery = selectedSubject 
      ? `${searchQuery} ${selectedSubject}` 
      : searchQuery;
    
    try {
      // Note: In a real implementation, you would replace this with actual API calls
      // to Google Custom Search API, Bing Search API, or another search service
      
      // For demonstration purposes, we'll simulate a response
      // In production, you would use:
      // const response = await fetch(`https://your-backend-api/search?q=${encodeURIComponent(fullQuery)}`);
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate simulated search results based on the query
      const simulatedResults = [
        {
          id: 1,
          title: `${fullQuery} - Comprehensive Guide`,
          snippet: `Learn about ${fullQuery} with detailed explanations, examples, and practice problems. This resource covers all the fundamental concepts related to ${fullQuery}.`,
          source: "Educational Resource Hub",
          url: `https://www.google.com/search?q=${encodeURIComponent(fullQuery)}`,
          externalLink: true
        },
        {
          id: 2,
          title: `Understanding ${fullQuery} - Tutorial`,
          snippet: `A step-by-step tutorial on ${fullQuery} designed for students at all levels. Includes visual explanations and interactive examples to enhance learning.`,
          source: "Learning Platform",
          url: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(fullQuery)}`,
          externalLink: true
        },
        {
          id: 3,
          title: `${fullQuery} Explained Simply`,
          snippet: `A beginner-friendly explanation of ${fullQuery} that breaks down complex concepts into easy-to-understand components. Perfect for students new to the subject.`,
          source: "Academic Resource Center",
          url: `https://www.coursera.org/search?query=${encodeURIComponent(fullQuery)}`,
          externalLink: true
        },
        {
          id: 4,
          title: `${fullQuery} - Wikipedia`,
          snippet: `Comprehensive information about ${fullQuery} including history, applications, and related concepts. A good starting point for research.`,
          source: "Wikipedia",
          url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(fullQuery)}`,
          externalLink: true
        },
        {
          id: 5,
          title: `${fullQuery} - Video Tutorials`,
          snippet: `Visual explanations and demonstrations of ${fullQuery} concepts. Learn through video lessons created by expert educators.`,
          source: "Educational Video Platform",
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(fullQuery)}+tutorial`,
          externalLink: true
        }
      ];
      
      return simulatedResults;
      
    } catch (error) {
      console.error("Error fetching external search results:", error);
      throw error;
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }
    
    setLoading(true);
    setError("");
    setExpandedResult(null);
    
    try {
      // Search external sources
      const searchResults = await searchExternalSources(query, subject);
      setResults(searchResults);
    } catch (err) {
      setError("Failed to fetch results. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-web-container">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
           <Link className="navbar-brand" to="/dashboard">
                                <img src="/assets/owl.png" alt="JobLMS Logo" className="navbar-logo" />
                                SmartStudy
                              </Link>
          <Link to="/dashboard" className="btn btn-outline-light">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title text-center mb-4">Search Subject Questions</h2>
                
                <form onSubmit={handleSearch}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter your question..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <select 
                        className="form-select"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        <option value="">All Subjects</option>
                        {subjects.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className="bi bi-search me-2"></i>
                        )}
                        Search
                      </button>
                    </div>
                  </div>
                </form>
                
                {error && (
                  <div className="alert alert-danger mt-3">
                    {error}
                  </div>
                )}
                
                <div className="search-results mt-4">
                  {results.length > 0 ? (
                    <>
                      <h3>Search Results</h3>
                      {results.map((result) => (
                        <div key={result.id} className="result-card">
                          <h4>{result.title}</h4>
                          <p>{result.snippet}</p>
                          <div className="result-footer">
                            <small className="text-muted">Source: {result.source}</small>
                            <a 
                              href={result.url} 
                              className="btn btn-sm btn-outline-primary" 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Visit Source
                            </a>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : !loading && query && (
                    <p className="text-center text-muted mt-4">No results found. Try a different search term.</p>
                  )}
                  
                  {!query && !loading && (
                    <div className="search-tips mt-4">
                      <h4>Search Tips</h4>
                      <ul>
                        <li>Be specific with your questions for better results</li>
                        <li>Try searching for topics like "What is Java" or "Database Management Systems"</li>
                        <li>Select a subject category to narrow down results</li>
                        <li>For programming topics, try "Python", "Java", or "Data Structures"</li>
                        <li>For computer science topics, try "Operating Systems" or "Computer Networks"</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchWeb;
