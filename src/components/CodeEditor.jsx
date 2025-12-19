import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./CodeEditor.css";

const CodeEditor = () => {
  const [language, setLanguage] = useState("html");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("untitled");
  const [fileExtension, setFileExtension] = useState(".html");
  const [savedFiles, setSavedFiles] = useState([]);
  const [input, setInput] = useState(""); // For user input to programs
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or default to false
    const savedMode = localStorage.getItem("codeEditorDarkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Default code templates for each language with more practical examples
  const defaultCode = {
    html: `<!DOCTYPE html>
<html>
<head>
    <title>Simple Calculator</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            text-align: center;
        }
        .calculator {
            width: 300px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        input, button {
            margin: 5px;
            padding: 8px;
        }
        #result {
            font-weight: bold;
            font-size: 18px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="calculator">
        <h2>Simple Calculator</h2>
        <input type="number" id="num1" placeholder="Enter first number">
        <input type="number" id="num2" placeholder="Enter second number">
        <br>
        <button onclick="add()">Add</button>
        <button onclick="subtract()">Subtract</button>
        <button onclick="multiply()">Multiply</button>
        <button onclick="divide()">Divide</button>
        <div id="result">Result will appear here</div>
    </div>

    <script>
        function add() {
            const num1 = parseFloat(document.getElementById('num1').value);
            const num2 = parseFloat(document.getElementById('num2').value);
            document.getElementById('result').innerText = "Result: " + (num1 + num2);
        }
        
        function subtract() {
            const num1 = parseFloat(document.getElementById('num1').value);
            const num2 = parseFloat(document.getElementById('num2').value);
            document.getElementById('result').innerText = "Result: " + (num1 - num2);
        }
        
        function multiply() {
            const num1 = parseFloat(document.getElementById('num1').value);
            const num2 = parseFloat(document.getElementById('num2').value);
            document.getElementById('result').innerText = "Result: " + (num1 * num2);
        }
        
        function divide() {
            const num1 = parseFloat(document.getElementById('num1').value);
            const num2 = parseFloat(document.getElementById('num2').value);
            if (num2 === 0) {
                document.getElementById('result').innerText = "Error: Cannot divide by zero";
            } else {
                document.getElementById('result').innerText = "Result: " + (num1 / num2);
            }
        }
    </script>
</body>
</html>`,
    css: `/* Styling for a calculator */
body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    margin: 0;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.calculator {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    padding: 20px;
    width: 300px;
}

.display {
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-bottom: 15px;
    padding: 10px;
    text-align: right;
    font-size: 24px;
}

.buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 10px;
}

button {
    background-color: #e0e0e0;
    border: none;
    border-radius: 5px;
    color: #333;
    cursor: pointer;
    font-size: 18px;
    padding: 15px 0;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #d0d0d0;
}

.operator {
    background-color: #f8a51b;
    color: white;
}

.operator:hover {
    background-color: #e5951b;
}

.equals {
    background-color: #4caf50;
    color: white;
    grid-column: span 2;
}

.equals:hover {
    background-color: #45a049;
}

.clear {
    background-color: #f44336;
    color: white;
}

.clear:hover {
    background-color: #e53935;
}`,
    javascript: `// Simple calculator program
function calculator() {
    // Get user input
    const num1 = parseFloat(prompt("Enter first number:"));
    const num2 = parseFloat(prompt("Enter second number:"));
    const operation = prompt("Enter operation (add, subtract, multiply, divide):");
    
    let result;
    
    // Perform calculation based on operation
    switch(operation.toLowerCase()) {
        case "add":
            result = num1 + num2;
            break;
        case "subtract":
            result = num1 - num2;
            break;
        case "multiply":
            result = num1 * num2;
            break;
        case "divide":
            if(num2 === 0) {
                return "Error: Cannot divide by zero";
            }
            result = num1 / num2;
            break;
        default:
            return "Invalid operation";
    }
    
    return \`Result of \${operation} \${num1} and \${num2} is: \${result}\`;
}

// Run the calculator
console.log(calculator());`,
    python: `# Simple calculator program in Python

def calculator():
    # Get user input
    try:
        num1 = float(input("Enter first number: "))
        num2 = float(input("Enter second number: "))
        operation = input("Enter operation (add, subtract, multiply, divide): ")
        
        # Perform calculation based on operation
        if operation.lower() == "add":
            result = num1 + num2
        elif operation.lower() == "subtract":
            result = num1 - num2
        elif operation.lower() == "multiply":
            result = num1 * num2
        elif operation.lower() == "divide":
            if num2 == 0:
                return "Error: Cannot divide by zero"
            result = num1 / num2
        else:
            return "Invalid operation"
        
        return f"Result of {operation} {num1} and {num2} is: {result}"
    except ValueError:
        return "Error: Please enter valid numbers"

# Run the calculator
print(calculator())`,
    java: `// Simple calculator program in Java
import java.util.Scanner;

public class Calculator {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // Get user input
        System.out.print("Enter first number: ");
        double num1 = scanner.nextDouble();
        
        System.out.print("Enter second number: ");
        double num2 = scanner.nextDouble();
        
        scanner.nextLine(); // Consume newline
        
        System.out.print("Enter operation (add, subtract, multiply, divide): ");
        String operation = scanner.nextLine();
        
        double result = 0;
        boolean validOperation = true;
        
        // Perform calculation based on operation
        switch(operation.toLowerCase()) {
            case "add":
                result = num1 + num2;
                break;
            case "subtract":
                result = num1 - num2;
                break;
            case "multiply":
                result = num1 * num2;
                break;
            case "divide":
                if(num2 == 0) {
                    System.out.println("Error: Cannot divide by zero");
                    validOperation = false;
                } else {
                    result = num1 / num2;
                }
                break;
            default:
                System.out.println("Invalid operation");
                validOperation = false;
        }
        
        if(validOperation) {
            System.out.println("Result of " + operation + " " + num1 + " and " + num2 + " is: " + result);
        }
        
        scanner.close();
    }
}`,
    sql: `-- Create a simple database for a calculator app
CREATE TABLE calculations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_number DECIMAL(10, 2),
    second_number DECIMAL(10, 2),
    operation VARCHAR(20),
    result DECIMAL(15, 5),
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample calculations
INSERT INTO calculations (first_number, second_number, operation, result)
VALUES (10.5, 5.25, 'add', 15.75);

INSERT INTO calculations (first_number, second_number, operation, result)
VALUES (20, 5, 'divide', 4);

INSERT INTO calculations (first_number, second_number, operation, result)
VALUES (7, 8, 'multiply', 56);

-- Query to find all calculations
SELECT * FROM calculations;

-- Query to find average result by operation
SELECT operation, AVG(result) as average_result
FROM calculations
GROUP BY operation
ORDER BY average_result DESC;`
  };

  // Set default code when language changes
  useEffect(() => {
    setCode(defaultCode[language]);
    updateFileExtension(language);
  }, [language]);

  // Save dark mode preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("codeEditorDarkMode", JSON.stringify(darkMode));
    // Apply dark mode to body for global styling
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Update file extension based on language
  const updateFileExtension = (lang) => {
    const extensions = {
      html: ".html",
      css: ".css",
      javascript: ".js",
      python: ".py",
      java: ".java",
      sql: ".sql"
    };
    setFileExtension(extensions[lang]);
  };

  // Run code function
  const runCode = async () => {
    setLoading(true);
    setError("");
    
    try {
      if (language === "html") {
        // For HTML, display in iframe
        const iframe = document.getElementById("output-frame");
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(code);
        iframeDoc.close();
        setOutput("");
      } else if (language === "javascript") {
        // For JavaScript, execute in browser
        try {
          // Capture console.log output
          const originalLog = console.log;
          let logs = [];
          console.log = (...args) => {
            logs.push(args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg) : arg
            ).join(' '));
          };
          
          // Execute the code in a try-catch block
          eval(code);
          
          // Restore console.log
          console.log = originalLog;
          
          setOutput(logs.join('\n'));
        } catch (e) {
          setError("Error executing JavaScript: " + e.message);
        }
      } else {
        // For other languages, send to backend API
        try {
          // Prepare the request data
          const requestData = {
            language,
            code,
            input
          };
          
          // Use a real code execution API (Judge0, JDoodle, etc.)
          // For this example, we'll use a mock API response
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Mock API responses based on language and code content
          let mockResponse;
          
          if (language === "python") {
            if (code.includes("calculator()")) {
              // Simulate Python calculator output
              mockResponse = {
                output: "Enter first number: 10\nEnter second number: 5\nEnter operation (add, subtract, multiply, divide): add\nResult of add 10.0 and 5.0 is: 15.0",
                error: null,
                status: "success"
              };
            } else {
              mockResponse = {
                output: "Hello, World!",
                error: null,
                status: "success"
              };
            }
          } else if (language === "java") {
            if (code.includes("Calculator")) {
              // Simulate Java calculator output
              mockResponse = {
                output: "Enter first number: 10\nEnter second number: 5\nEnter operation (add, subtract, multiply, divide): add\nResult of add 10.0 and 5.0 is: 15.0",
                error: null,
                status: "success"
              };
            } else {
              mockResponse = {
                output: "Hello, World!",
                error: null,
                status: "success"
              };
            }
          } else if (language === "sql") {
            // Simulate SQL query results
            mockResponse = {
              output: "Query executed successfully.\n\nResults:\nid | first_number | second_number | operation | result | calculation_date\n---+-------------+--------------+-----------+--------+-------------------\n1 | 10.50 | 5.25 | add | 15.75 | 2023-03-22 12:34:56\n2 | 20.00 | 5.00 | divide | 4.00 | 2023-03-22 12:35:10\n3 | 7.00 | 8.00 | multiply | 56.00 | 2023-03-22 12:35:25\n\n3 rows returned.",
              error: null,
              status: "success"
            };
          } else {
            mockResponse = {
              output: "Code executed successfully.",
              error: null,
              status: "success"
            };
          }
          
          if (mockResponse.error) {
            setError(mockResponse.error);
          } else {
            setOutput(mockResponse.output);
          }
                    
          const response = await fetch('https://smartstudy-server.onrender.com/api/code/execute', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });
          
          const responseData = await response.json();
          
          if (responseData.error) {
            setError(responseData.error);
          } else {
            setOutput(responseData.output);
          }
          
        } catch (err) {
            setError("API Error: " + err.message);
          }
        }
      } catch (err) {
        setError("Error executing code: " + err.message);
        console.error("Code execution error:", err);
      } finally {
        setLoading(false);
      }
    };
  
    // Save current file
    const saveFile = () => {
      const newFile = {
        id: Date.now(),
        name: fileName + fileExtension,
        language: language,
        code: code
      };
      
      setSavedFiles(prev => [...prev, newFile]);
      alert(`File "${fileName + fileExtension}" saved successfully!`);
    };
  
    // Load a saved file
    const loadFile = (file) => {
      setLanguage(file.language);
      setCode(file.code);
      setFileName(file.name.split('.')[0]);
      updateFileExtension(file.language);
    };
  
    // Download file
    const downloadFile = () => {
      const element = document.createElement("a");
      const fileBlob = new Blob([code], { type: "text/plain" });
      element.href = URL.createObjectURL(fileBlob);
      element.download = fileName + fileExtension;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };
  
    // Check if language needs input
    const needsInput = () => {
      return ["python", "java"].includes(language);
    };
  
    return (
      <div className={`code-editor-container ${darkMode ? 'dark-mode' : ''}`}>
        <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark' : 'navbar-dark bg-primary'}`}>
          <div className="container">
             <Link className="navbar-brand" to="/dashboard">
                                  <img src="/assets/owl.png" alt="JobLMS Logo" className="navbar-logo" />
                                  SmartStudy
                                </Link>
            <Link to="/dashboard" className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-light'}`}>
              Back to Dashboard
            </Link>
          </div>
        </nav>
  
        <div className="container-fluid mt-3">
          <div className="row">
            <div className="col-md-3">
              <div className={`card mb-3 ${darkMode ? 'bg-dark text-light' : ''}`}>
                <div className={`card-header ${darkMode ? 'bg-secondary text-white' : 'bg-dark text-white'}`}>
                  <h5 className="mb-0">Code Editor Settings</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <label className="form-check-label">Dark Mode</label>
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="darkModeSwitch" 
                        checked={darkMode}
                        onChange={toggleDarkMode}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="language" className="form-label">Language:</label>
                    <select 
                      id="language"
                      className={`form-select ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="sql">SQL</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="fileName" className="form-label">File Name:</label>
                    <div className="input-group">
                      <input 
                        type="text" 
                        id="fileName"
                        className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                        value={fileName} 
                        onChange={(e) => setFileName(e.target.value)}
                      />
                      <span className={`input-group-text ${darkMode ? 'bg-secondary text-light border-secondary' : ''}`}>
                        {fileExtension}
                      </span>
                    </div>
                  </div>
                  
                  {needsInput() && (
                    <div className="mb-3">
                      <label htmlFor="input" className="form-label">Program Input:</label>
                      <textarea
                        id="input"
                        className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter input values for your program..."
                        rows="3"
                      ></textarea>
                      <small className={`text-${darkMode ? 'light' : 'muted'}`}>
                        For Python/Java programs that require user input. One value per line.
                      </small>
                    </div>
                  )}
                  
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-success" 
                      onClick={saveFile}
                    >
                      <i className="bi bi-save me-2"></i>Save File
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={downloadFile}
                    >
                      <i className="bi bi-download me-2"></i>Download
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={runCode}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : (
                        <i className="bi bi-play-fill me-2"></i>
                      )}
                      Run Code
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`}>
                <div className={`card-header ${darkMode ? 'bg-secondary text-white' : 'bg-dark text-white'}`}>
                  <h5 className="mb-0">Saved Files</h5>
                </div>
                <div className="card-body p-0">
                  <ul className={`list-group list-group-flush ${darkMode ? 'bg-dark' : ''}`}>
                    {savedFiles.length === 0 ? (
                      <li className={`list-group-item text-center ${darkMode ? 'bg-dark text-light border-secondary' : 'text-muted'}`}>
                        No saved files yet
                      </li>
                    ) : (
                      savedFiles.map(file => (
                        <li key={file.id} className={`list-group-item ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span>
                              <i className={`bi bi-file-earmark-code me-2 text-${
                                file.language === 'html' ? 'danger' : 
                                file.language === 'css' ? 'success' :
                                file.language === 'javascript' ? 'warning' :
                                file.language === 'python' ? 'primary' :
                                file.language === 'java' ? 'secondary' : 'info'
                              }`}></i>
                              {file.name}
                            </span>
                            <button 
                              className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}
                              onClick={() => loadFile(file)}
                            >
                              Load
                            </button>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="col-md-9">
              <div className={`card mb-3 ${darkMode ? 'bg-dark text-light' : ''}`}>
                <div className={`card-header ${darkMode ? 'bg-secondary text-white' : 'bg-dark text-white'} d-flex justify-content-between align-items-center`}>
                  <h5 className="mb-0">Code Editor - {fileName}{fileExtension}</h5>
                  <span className={`badge ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
                    {language.toUpperCase()}
                  </span>
                </div>
                <div className="card-body p-0">
                  <textarea
                    className={`form-control code-textarea ${darkMode ? 'dark-editor' : ''}`}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{ 
                      height: '400px', 
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      padding: '10px',
                      border: 'none',
                      borderRadius: '0',
                      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
                      color: darkMode ? '#d4d4d4' : '#000'
                    }}
                  />
                </div>
              </div>
              
              <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`}>
                <div className={`card-header ${darkMode ? 'bg-secondary text-white' : 'bg-dark text-white'}`}>
                  <h5 className="mb-0">Output</h5>
                </div>
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}
                  
                  {language === 'html' ? (
                    <div className="output-iframe-container">
                      <iframe 
                        id="output-frame" 
                        title="HTML Output"
                        className="output-iframe"
                        sandbox="allow-scripts"
                        style={{ 
                          width: '100%', 
                          height: '400px', 
                          border: darkMode ? '1px solid #6c757d' : '1px solid #dee2e6' 
                        }}
                      ></iframe>
                    </div>
                  ) : (
                    <pre className="output-console" style={{
                      backgroundColor: darkMode ? '#1e1e1e' : '#212529',
                      color: '#f8f9fa',
                      padding: '15px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      height: '400px',
                      overflowY: 'auto',
                      margin: '0',
                      whiteSpace: 'pre-wrap',
                      border: darkMode ? '1px solid #6c757d' : 'none'
                    }}>
                      {output}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default CodeEditor;
  
          // In a real implementation, you would use fetch or axios:
