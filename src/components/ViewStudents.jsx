import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf"; // Import jsPDF
import autoTable from "jspdf-autotable"; // Import jspdf-autotable
import "./ViewStudents.css"; // Optional: Add custom styles

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const navigate = useNavigate();

  // Fetch student data from the backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://smartstudy-server.onrender.com/api/students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await response.json();

        // Ensure data is an array
        if (Array.isArray(data)) {
          setStudents(data);
          setFilteredStudents(data); // Initialize filtered students with all students
        } else {
          console.error("Invalid data format:", data);
          setStudents([]);
          setFilteredStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
        setFilteredStudents([]);
      }
    };

    fetchStudents();
  }, []);

  // Handle search by email
  useEffect(() => {
    const filtered = students.filter((student) =>
      student.email.toLowerCase().includes(searchEmail.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchEmail, students]);

  // Handle block/unblock student
  const handleBlockUnblock = async (id, isBlocked) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://smartstudy-server.onrender.com/api/students/${id}/block`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isBlocked: !isBlocked }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update block status");
      }

      const updatedStudents = students.map((student) =>
        student.id === id ? { ...student, isBlocked: !isBlocked } : student
      );
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
    } catch (error) {
      console.error("Error updating block status:", error);
    }
  };

  // Download student details as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add a title to the PDF
    doc.text("Student Details", 10, 10);

    // Define the columns for the table
    const columns = ["Name", "Department", "Phone", "User ID", "Email", "Status"];

    // Map the student data to the table rows
    const rows = filteredStudents.map((student) => [
      student.name,
      student.department,
      student.phone,
      student.user_id,
      student.email,
      student.isBlocked ? "Blocked" : "Active",
    ]);

    // Add the table to the PDF
    autoTable(doc, {
      head: [columns], // Table header
      body: rows, // Table rows
    });

    // Save the PDF
    doc.save("student_details.pdf");
  };

  return (
    <div className="view-students">
      <h2>View Students</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <button onClick={downloadPDF}>Download PDF</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Phone</th>
            <th>User ID</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.department}</td>
              <td>{student.phone}</td>
              <td>{student.user_id}</td>
              <td>{student.email}</td>
              <td>{student.isBlocked ? "Blocked" : "Active"}</td>
              <td>
                <button
                  onClick={() =>
                    handleBlockUnblock(student.id, student.isBlocked)
                  }
                >
                  {student.isBlocked ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewStudents;