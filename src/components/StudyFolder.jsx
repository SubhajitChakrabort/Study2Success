import React, { useState, useEffect } from "react";
import "./StudyFolder.css";

const StudyFolder = () => {
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudyMaterials();
  }, []);

  const fetchStudyMaterials = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://smartstudy-server.onrender.com/api/study-materials", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      const groupedMaterials = data.reduce((acc, item) => {
        if (!acc[item.subject_name]) {
          acc[item.subject_name] = [];
        }
        acc[item.subject_name].push(item);
        return acc;
      }, {});

      setStudyMaterials(groupedMaterials);
    } catch (error) {
      console.error("Error fetching study materials:", error);
    }
  };

  const filteredSubjects = Object.keys(studyMaterials).filter(subject =>
    subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openPDF = (material) => {
    const fullUrl = `https://smartstudy-server.onrender.com/uploads/study/${material.user_id}/${material.subject_name}/${material.title}.pdf`;
    window.open(fullUrl, "_blank");
  };

  return (
    <div className="study-folder-container">
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col">
            <div className="search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="bi bi-search search-icon"></i>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Subjects</h5>
                <div className="subject-list">
                  {filteredSubjects.map((subject) => (
                    <button
                      key={subject}
                      className={`btn btn-link w-100 text-start ${
                        selectedSubject === subject ? "active" : ""
                      }`}
                      onClick={() => setSelectedSubject(subject)}
                    >
                      <i className="bi bi-folder me-2"></i>
                      {subject}
                      <span className="badge bg-primary float-end">
                        {studyMaterials[subject].length}
                      </span>
                    </button>
                  ))}
                  {filteredSubjects.length === 0 && (
                    <div className="text-muted text-center py-3">
                      No subjects found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  {selectedSubject
                    ? `${selectedSubject} Materials`
                    : "Select a Subject"}
                </h5>
                <div className="materials-list">
                  {selectedSubject &&
                    studyMaterials[selectedSubject].map((material) => (
                      <div key={material.id} className="material-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <i className="bi bi-file-pdf me-2 text-danger"></i>
                            {material.title}
                            <small className="text-muted ms-2">
                              {new Date(material.created_at).toLocaleDateString()}
                            </small>
                          </div>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => openPDF(material)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            View PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  {selectedSubject && studyMaterials[selectedSubject].length === 0 && (
                    <div className="text-center text-muted py-4">
                      No materials available for this subject
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

export default StudyFolder;
