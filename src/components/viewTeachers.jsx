import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf"; // Import jsPDF
import autoTable from "jspdf-autotable"; // Import jspdf-autotable
import "./ViewTeachers.css"; // Optional: Add custom styles

const ViewTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const navigate = useNavigate();

  // Fetch teacher data from the backend
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://smartstudy-server.onrender.com/api/teachers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch teachers");
        }

        const data = await response.json();

        // Ensure data is an array
        if (Array.isArray(data)) {
          setTeachers(data);
          setFilteredTeachers(data); // Initialize filtered teachers with all teachers
        } else {
          console.error("Invalid data format:", data);
          setTeachers([]);
          setFilteredTeachers([]);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setTeachers([]);
        setFilteredTeachers([]);
      }
    };

    fetchTeachers();
  }, []);

  // Handle search by email
  useEffect(() => {
    const filtered = teachers.filter((teacher) =>
      teacher.email.toLowerCase().includes(searchEmail.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [searchEmail, teachers]);

  // Handle block/unblock teacher
  const handleBlockUnblock = async (id, isBlocked) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://smartstudy-server.onrender.com/api/teachers/${id}/block`,
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

      const updatedTeachers = teachers.map((teacher) =>
        teacher.id === id ? { ...teacher, isBlocked: !isBlocked } : teacher
      );
      setTeachers(updatedTeachers);
      setFilteredTeachers(updatedTeachers);
    } catch (error) {
      console.error("Error updating block status:", error);
    }
  };

  // Download teacher details as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add a title to the PDF
    doc.text("Teacher Details", 10, 10);

    // Define the columns for the table
    const columns = ["Name", "Department", "Phone", "User ID", "Email", "Status"];

    // Map the teacher data to the table rows
    const rows = filteredTeachers.map((teacher) => [
      teacher.name,
      teacher.department,
      teacher.phone,
      teacher.user_id,
      teacher.email,
      teacher.isBlocked ? "Blocked" : "Active",
    ]);

    // Add the table to the PDF
    autoTable(doc, {
      head: [columns], // Table header
      body: rows, // Table rows
    });

    // Save the PDF
    doc.save("teacher_details.pdf");
  };

  return (
    <div className="view-teachers">
      <h2>View Teachers</h2>
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
            {/* <th>Department</th> */}
            <th>Phone</th>
            {/* <th>User ID</th> */}
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTeachers.map((teacher) => (
            <tr key={teacher.id}>
              <td>{teacher.name}</td>
              {/* <td>{teacher.department}</td> */}
              <td>{teacher.phone}</td>
              {/* <td>{teacher.user_id}</td> */}
              <td>{teacher.email}</td>
              <td>{teacher.isBlocked ? "Blocked" : "Active"}</td>
              <td>
                <button
                  onClick={() =>
                    handleBlockUnblock(teacher.id, teacher.isBlocked)
                  }
                >
                  {teacher.isBlocked ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewTeachers;