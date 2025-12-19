import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VerifyOfferLetters.css"; // Import the new CSS file

const VerifyOfferLetters = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch non-regular students with pending offer letters
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://smartstudy-server.onrender.com/api/admin/pending-verifications");
        setStudents(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const downloadOfferLetter = async (studentId) => {
    try {
      const response = await fetch(`https://smartstudy-server.onrender.com/api/admin/download-offer-letter/${studentId}`, {
        method: "GET",
        headers: { Accept: "application/pdf" },
      });
      if (!response.ok) {
        throw new Error("Failed to download offer letter");
      }
  
      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `offer_letter_${studentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading offer letter:", error);
      alert("Failed to download offer letter");
    }
  };

  const downloadEmployeeProof = async (studentId) => {
    try {
      // Check if the student has an employee proof path before making the request
      const student = students.find(s => s.id === studentId);
      if (!student.employee_id_proof_path) {
        alert("No employee proof document available for this user");
        return;
      }
      
      const response = await fetch(`https://smartstudy-server.onrender.com/api/admin/download-employee-proof/${studentId}`, {
        method: "GET",
        headers: { Accept: "application/pdf,image/*" },
      });
      
      if (!response.ok) {
        throw new Error("Failed to download employee proof");
      }
  
      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `employee_proof_${studentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading employee proof:", error);
      alert("Failed to download employee proof");
    }
  };
  
  const handleVerify = async (studentId) => {
    try {
      await axios.put(`https://smartstudy-server.onrender.com/api/admin/verify-student/${studentId}`);
      // Update the list after verification
      setStudents(students.filter((student) => student.id !== studentId));
    } catch (error) {
      console.error("Error verifying student:", error);
    }
  };

  if (loading) {
    return (
      <div className="verify-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading student verification data...</p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="verify-container">
        <h2>Verify Offer Letters and Employee Proof</h2>
        <div className="empty-state">
          <i className="bi bi-check-circle"></i>
          <p>No pending verifications at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-container">
      <h2>Verify Offer Letters and Employee Proof</h2>
      
      {/* Desktop Table View */}
      <div className="table-responsive desktop-table">
        <table className="verify-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Offer Letter</th>
              <th>Employee ID Proof</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => downloadOfferLetter(student.id)}
                  >
                    <i className="bi bi-download"></i> Download
                  </button>
                </td>
                <td>
                  {student.employee_id_proof_path ? (
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => downloadEmployeeProof(student.id)}
                    >
                      <i className="bi bi-download"></i> Download
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => alert("No employee proof document available for this user")}
                    >
                      <i className="bi bi-x-circle"></i> Not Available
                    </button>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleVerify(student.id)}
                  >
                    <i className="bi bi-check-circle"></i> Verify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile Card View */}
      <div className="mobile-cards">
        {students.map((student) => (
          <div className="student-card" key={student.id}>
            <div className="student-card-header">
              <div className="student-card-name">{student.name}</div>
            </div>
            
            <div className="student-card-field">
              <div className="student-card-label">Email:</div>
              <div className="student-card-value">{student.email}</div>
            </div>
            
            <div className="student-card-field">
              <div className="student-card-label">Phone:</div>
              <div className="student-card-value">{student.phone}</div>
            </div>
            
            <div className="student-card-actions">
              <button
                className="btn btn-primary"
                onClick={() => downloadOfferLetter(student.id)}
              >
                <i className="bi bi-download"></i> Download Offer Letter
              </button>
              
              {student.employee_id_proof_path ? (
                <button
                  className="btn btn-info"
                  onClick={() => downloadEmployeeProof(student.id)}
                >
                  <i className="bi bi-download"></i> Download Employee Proof
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={() => alert("No employee proof document available for this user")}
                >
                  <i className="bi bi-x-circle"></i> No Employee Proof Available
                </button>
              )}
              
              <button
                className="btn btn-success"
                onClick={() => handleVerify(student.id)}
              >
                <i className="bi bi-check-circle"></i> Verify Student
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerifyOfferLetters;

