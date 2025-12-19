import React, { useState, useEffect } from "react";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  // Display debug info in console whenever it changes
  useEffect(() => {
    console.log("Current state:", { 
      inputValue, 
      prediction, 
      error, 
      isLoading, 
      debugInfo 
    });
  }, [inputValue, prediction, error, isLoading, debugInfo]);

  const handlePredict = async () => {
    // Reset states
    setError(null);
    setPrediction(null);
    setIsLoading(true);
    setDebugInfo({});
    
    try {
      console.log("Sending request with input:", inputValue);
      
      const response = await fetch("https://smartstudy-server.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputValue }),
      });

      setDebugInfo(prev => ({ 
        ...prev, 
        responseStatus: response.status,
        responseOk: response.ok
      }));

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        responseData: data 
      }));
      
      setPrediction(data.prediction);
    } catch (error) {
      console.error("Prediction error:", error);
      setError("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#333" }}>AI Prediction App</h2>
      
      <div style={{ margin: "20px 0" }}>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a number"
          style={{ 
            padding: "10px", 
            marginRight: "10px", 
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "16px"
          }}
        />
        <button 
          onClick={() => {
            alert('Button clicked! Input value: ' + inputValue);
            handlePredict();
          }}
          disabled={isLoading || !inputValue}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#4CAF50", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: isLoading || !inputValue ? "not-allowed" : "pointer",
            opacity: isLoading || !inputValue ? 0.7 : 1,
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          {isLoading ? "Processing..." : "Predict"}
        </button>
      </div>
      
      {isLoading && (
        <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "5px", display: "inline-block" }}>
          <p style={{ margin: "0", color: "#007bff" }}>Loading prediction...</p>
        </div>
      )}
      
      {error && (
        <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#f8d7da", borderRadius: "5px", display: "inline-block" }}>
          <p style={{ margin: "0", color: "#721c24" }}><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {prediction !== null && (
        <div style={{ 
          margin: "20px 0", 
          padding: "20px", 
          backgroundColor: "#d4edda", 
          borderRadius: "5px", 
          display: "inline-block",
          border: "1px solid #c3e6cb"
        }}>
          <h3 style={{ margin: "0", color: "#155724" }}>Prediction: <span style={{ fontWeight: "bold" }}>{prediction}</span></h3>
        </div>
      )}
      
      {/* Debug section - visible in development */}
      <div style={{ 
        margin: "30px auto", 
        maxWidth: "600px", 
        textAlign: "left", 
        padding: "15px", 
        backgroundColor: "#f8f9fa", 
        borderRadius: "5px",
        border: "1px solid #dee2e6" 
      }}>
        <h4 style={{ borderBottom: "1px solid #dee2e6", paddingBottom: "10px", color: "#495057" }}>Debug Information</h4>
        <p><strong>Input Value:</strong> {inputValue || "(empty)"}</p>
        <p><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</p>
        <p><strong>Prediction:</strong> {prediction !== null ? JSON.stringify(prediction) : "(none)"}</p>
        <p><strong>Error:</strong> {error || "(none)"}</p>
        <p><strong>Response Status:</strong> {debugInfo.responseStatus || "(no response yet)"}</p>
        <p><strong>Response OK:</strong> {debugInfo.responseOk !== undefined ? String(debugInfo.responseOk) : "(unknown)"}</p>
        <div>
          <p><strong>Response Data:</strong></p>
          <pre style={{ 
            backgroundColor: "#e9ecef", 
            padding: "10px", 
            borderRadius: "4px", 
            overflowX: "auto" 
          }}>
            {debugInfo.responseData ? JSON.stringify(debugInfo.responseData, null, 2) : "(no data)"}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
