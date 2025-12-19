import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import "./Dashboard.css";
import DesktopOnly from "./DesktopOnly";
import AIAssistant from "./AIAssistant";
import PredictionInsights from "./PredictionInsights";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminSidebar = ({ profileData }) => (
  <div className="sidebar" id="sidebar">
    <div className="sidebar-profile text-center">
      {profileData?.photoUrl ? (
        <img
          src={`https://smartstudy-server.onrender.com${profileData.photoUrl}`}
          alt="Profile"
          className="sidebar-profile-image"
        />
      ) : (
        <i className="bi bi-person-circle profile-icon"></i>
      )}
      <h6 className="mt-2">{profileData?.name || "Admin"}</h6>
      <span className="badge bg-danger">Admin</span>
    </div>
    <ul className="nav flex-column">
      <li className="nav-item">
        <Link to="/view-students" className="nav-link">
          <i className="bi bi-person-lines-fill me-2"></i>
          View Students
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/view-teachers" className="nav-link">
          <i className="bi bi-person-fill me-2"></i>
          View Teachers
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/tech-prep-admin" className="nav-link">
          <i className="bi bi-laptop me-2"></i>
          Tech Prep
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/commission-report" className="nav-link">
          <i className="bi bi-cash-stack me-2"></i>
          Commission Report
        </Link>
      </li>
      

      <li className="nav-item">
        <Link to="/verify-offer-letters" className="nav-link">
          <i className="bi bi-bell-fill me-2"></i>
          Verify Offer Letters
          {/* <span className="badge bg-danger ms-2">
            {profileData?.pendingVerifications || 0}
          </span> */}
        </Link>
      </li>
    </ul>
  </div>
);

const TeacherSidebar = ({ profileData }) => (
  <div className="sidebar" id="sidebar">
    <div className="sidebar-profile text-center">
      {profileData?.photoUrl ? (
        <img
          src={`https://smartstudy-server.onrender.com${profileData.photoUrl}`}
          alt="Profile"
          className="sidebar-profile-image"
        />
      ) : (
        <i className="bi bi-person-circle profile-icon"></i>
      )}
      <h6 className="mt-2">{profileData?.name || "Teacher"}</h6>
      <span className="badge bg-primary">Teacher</span>
    </div>
    <ul className="nav flex-column">
      <li className="nav-item">
        <Link to="/upload-notes" className="nav-link">
          <i className="bi bi-cloud-upload me-2"></i>
          Upload Notes
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/my-uploads" className="nav-link">
          <i className="bi bi-folder-check me-2"></i>
          View Your Uploads
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/commission-report" className="nav-link">
          <i className="bi bi-cash-stack me-2"></i>
          Commission Report
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/upload-notice" className="nav-link">
          <i className="bi bi-bell-fill me-2 text-warning"></i>
          Upload Notice
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/help-support" className="nav-link">
          <i className="bi bi-question-circle me-2"></i>
          Help & Support
        </Link>
      </li>
    </ul>
  </div>
);

const StudentSidebar = ({
  profileData,
  newNotesCount,
  onTeacherNotesClick,
  subscriptionDaysLeft,
}) => (
  <div className="sidebar" id="sidebar">
    <div className="sidebar-profile text-center">
      {profileData?.photoUrl ? (
        <img
          src={`https://smartstudy-server.onrender.com${profileData.photoUrl}`}
          alt="Profile"
          className="sidebar-profile-image"
        />
      ) : (
        <i className="bi bi-person-circle profile-icon"></i>
      )}
      <h6 className="mt-2">{profileData?.name || "Student"}</h6>
      {subscriptionDaysLeft !== undefined && (
        <div className="subscription-status mt-2">
          <span
            className={`badge ${subscriptionDaysLeft > 10 ? "bg-success" : "bg-danger"
              }`}
          >
            {subscriptionDaysLeft} days left
          </span>
        </div>
      )}
    </div>
    <ul className="nav flex-column">
      <li className="nav-item">
        <Link
          to="/teachers-notes"
          className="nav-link"
          onClick={onTeacherNotesClick}
        >
          <i className="bi bi-journal-text me-2"></i>
          Teachers Notes
          {newNotesCount > 0 && (
            <span className="badge bg-danger ms-2">{newNotesCount}</span>
          )}
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/content-summarizer" className="btn btn-primary">
          <i className="bi bi-magic me-2"></i>
          Content Summarizer
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/my-notes" className="nav-link">
          <i className="bi bi-journal-plus me-2"></i>
          Your Notes
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/test" className="nav-link">
          <i className="bi bi-pencil-square me-2"></i>
          Test Yourself
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/exam-result" className="nav-link">
          <i className="bi bi-journal-text me-2"></i>
          Your Test Scores
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/search-web" className="nav-link">
          <i className="bi bi-search me-2"></i>
          Search on Web
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/code-editor" className="nav-link">
          <i className="bi bi-code-slash me-2"></i>
          Jump into Real World
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/help-support" className="nav-link">
          <i className="bi bi-question-circle me-2"></i>
          Help & Support
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/study-folder" className="nav-link">
          <i className="bi bi-folder me-2"></i>
          Study Folder
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/teacher-study-folder" className="nav-link">
          <i className="bi bi-folder me-2"></i>
          Teacher Study Folder
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/tech-prep" className="nav-link">
          <i className="bi bi-laptop me-2"></i>
          Tech Prep
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/build-resume" className="nav-link">
          <i className="bi bi-file-person me-2"></i>
          Build Resume
        </Link>
      </li>
      



      {/* <li className="nav-item">
        <Link to="/analytics" className="nav-link">
          <i className="bi bi-graph-up me-2"></i>
          Learning Analytics
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/learning-path" className="nav-link">
          <i className="bi bi-signpost-split me-2"></i>
          Learning Path
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/content-effectiveness" className="nav-link">
          <i className="bi bi-bar-chart-line me-2"></i>
          Content Effectiveness
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/at-risk-students" className="nav-link">
          <i className="bi bi-exclamation-triangle me-2"></i>
          At-Risk Students
        </Link>
      </li> */}
      <li className="nav-item">
        <Link to="/important-notice" className="nav-link">
          <i className="bi bi-bell-fill me-2 text-warning"></i>
          Important Notice
        </Link>
      </li>
    </ul>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [profileData, setProfileData] = useState({});
  const [newNotesCount, setNewNotesCount] = useState(0);
  const [stats, setStats] = useState({
    notesBySubject: {},
    totalNotes: 0,
    highestExamScore: 0,
    recentExams: [],
    studyMaterials: [],
    teachersNotes: {
      total: 0,
      bySubject: {},
      byMonth: {},
    },
    totalStudents: 0,
    totalTeachers: 0,
    studentsByDepartment: {},
  });
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [subscriptionDaysLeft, setSubscriptionDaysLeft] = useState(undefined);
  useEffect(() => {
    fetchProfileData();
    fetchDashboardStats();
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Add a separate useEffect to fetch the new notes count when profileData changes
  // useEffect(() => {
  //   if (profileData.role === "student") {
  //     fetchNewNotesCount();
  //     fetchSubscriptionInfo();
  //   }
  // }, [profileData.role]);
  useEffect(() => {
    if (profileData.role === "student") {
      fetchNewNotesCount();
      fetchSubscriptionInfo();
    }
  }, [profileData.role]);

  // const fetchSubscriptionInfo = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await fetch(
  //       "https://smartstudy-server.onrender.com/api/user/subscription-info",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.daysLeft !== undefined) {
  //         setSubscriptionDaysLeft(data.daysLeft);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching subscription info:", error);
  //   }
  // };
  const fetchSubscriptionInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://smartstudy-server.onrender.com/api/user/subscription-info",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.daysLeft !== undefined && data.daysLeft !== null) {
          setSubscriptionDaysLeft(data.daysLeft);
        } else {
          // For non-regular students, explicitly set to undefined
          setSubscriptionDaysLeft(undefined);
        }
      }
    } catch (error) {
      console.error("Error fetching subscription info:", error);
      // In case of error, also set to undefined
      setSubscriptionDaysLeft(undefined);
    }
  };

  const fetchNewNotesCount = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching new notes count for student");
      const response = await fetch(
        "https://smartstudy-server.onrender.com/api/dashboard/new-notes-count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("New notes count response:", data);
        setNewNotesCount(data.newNotesCount || 0);
      }
    } catch (error) {
      console.error("Error fetching new notes count:", error);
    }
  };

  // Update the handleTeacherNotesClick function with the correct API path
  const handleTeacherNotesClick = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Marking notes as viewed");
      await fetch("https://smartstudy-server.onrender.com/api/dashboard/mark-notes-viewed", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Reset the counter to zero
      setNewNotesCount(0);
    } catch (error) {
      console.error("Error marking notes as viewed:", error);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  // const fetchProfileData = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await fetch("https://smartstudy-server.onrender.com/api/user/profile", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const data = await response.json();
  //     setProfileData(data || {});
  //     setUserEmail(data?.email || "");
  //   } catch (error) {
  //     console.error("Error fetching profile:", error);
  //   }
  // };
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("https://smartstudy-server.onrender.com/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile data: ${response.status}`);
      }

      const data = await response.json();
      setProfileData(data || {});
      setUserEmail(data?.email || "");

      // If user is a teacher, fetch teacher-specific profile data
      if (data?.role === "teacher") {
        const teacherResponse = await fetch(
          "https://smartstudy-server.onrender.com/api/teacher/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (teacherResponse.ok) {
          const teacherData = await teacherResponse.json();
          setProfileData((prevData) => ({
            ...prevData,
            phoneNumber: teacherData.phone_number || "",
            department: teacherData.department || "",
            teacherId: teacherData.teacher_id || "",
            address: teacherData.address || "",
            semesters: teacherData.semesters || [],
            photoUrl: teacherData.photo_url || null,
          }));

          if (teacherData.photo_url) {
            setProfilePhoto(`https://smartstudy-server.onrender.com${teacherData.photo_url}`);
          }
        }
      } else if (data?.photoUrl) {
        // For students
        setProfilePhoto(`https://smartstudy-server.onrender.com${data.photoUrl}`);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://smartstudy-server.onrender.com/api/dashboard/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      // Fetch teachers notes stats
      const teachersResponse = await fetch(
        "https://smartstudy-server.onrender.com/api/dashboard/teachers-notes-stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let teachersData = { total: 0, bySubject: {}, byMonth: {} };

      if (teachersResponse.ok) {
        teachersData = await teachersResponse.json();
      } else {
        // Mock data if endpoint doesn't exist yet
        teachersData = {
          total: 24,
          bySubject: {
            "Computer Science": 8,
            Mathematics: 5,
            Physics: 4,
            Chemistry: 3,
            English: 4,
          },
          byMonth: {
            Jan: 2,
            Feb: 3,
            Mar: 4,
            Apr: 2,
            May: 5,
            Jun: 8,
          },
        };
      }

      // Fetch total students and teachers
      const studentsResponse = await fetch(
        "https://smartstudy-server.onrender.com/api/dashboard/total-students",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const totalStudents = studentsResponse.ok
        ? await studentsResponse.json()
        : 0;

      const teachersResponse2 = await fetch(
        "https://smartstudy-server.onrender.com/api/dashboard/total-teachers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const totalTeachers = teachersResponse2.ok
        ? await teachersResponse2.json()
        : 0;

      // Fetch students by department
      const studentsByDepartmentResponse = await fetch(
        "https://smartstudy-server.onrender.com/api/dashboard/students-by-department",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const studentsByDepartment = studentsByDepartmentResponse.ok
        ? await studentsByDepartmentResponse.json()
        : {};

      setStats({
        notesBySubject: data?.notesBySubject || {},
        totalNotes: data?.totalNotes || 0,
        highestExamScore: data?.highestExamScore || 0,
        recentExams: data?.recentExams || [],
        studyMaterials: data?.studyMaterials || [],
        teachersNotes: teachersData,
        totalStudents: totalStudents.totalStudents || 0, // Access nested property
        totalTeachers: totalTeachers.totalTeachers || 0, // Access nested property
        studentsByDepartment,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const barChartData = {
    labels: Object.keys(stats.notesBySubject || {}),
    datasets: [
      {
        label: "Notes per Subject",
        data: Object.values(stats.notesBySubject || {}),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: ["Completed Exams", "Total Notes", "Study Materials"],
    datasets: [
      {
        data: [
          stats.recentExams?.length || 0,
          stats.totalNotes || 0,
          Object.values(stats.notesBySubject || {}).reduce(
            (a, b) => a + b,
            0
          ) || 0,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const studentsByDepartmentChartData = {
    labels: Object.keys(stats.studentsByDepartment || {}),
    datasets: [
      {
        label: "Students by Department",
        data: Object.values(stats.studentsByDepartment || {}),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <DesktopOnly>
      <div className="dashboard">
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <Link className="navbar-brand" to="/dashboard">
              <img
                src="/assets/owl.png"
                alt="JobLMS Logo"
                className="navbar-logo"
              />
              SmartStudy
            </Link>
            <div className="dropdown">
              <button
                className="btn btn-link dropdown-toggle d-flex align-items-center text-white text-decoration-none"
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {profileData?.photoUrl ? (
                  <img
                    src={`https://smartstudy-server.onrender.com${profileData.photoUrl}`}
                    alt="Profile"
                    className="profile-image me-2"
                  />
                ) : (
                  <i className="bi bi-person-circle fs-4 me-2"></i>
                )}
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="userDropdown"
              >
                <li>
                  <span className="dropdown-item-text">{userEmail}</span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item" to="/profile">
                    Update Profile
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="d-flex">
          {profileData?.role === "admin" ? (
            <AdminSidebar profileData={profileData} />
          ) : profileData?.role === "teacher" ? (
            <TeacherSidebar profileData={profileData} />
          ) : (
            <StudentSidebar
              profileData={profileData}
              newNotesCount={newNotesCount}
              onTeacherNotesClick={handleTeacherNotesClick}
              subscriptionDaysLeft={subscriptionDaysLeft}
            />
          )}
          <div className="container mt-4">
            <div className="row">
              {profileData?.role !== "admin" && (
                <div className="row">
                  <div className="col-md-12 mb-4">
                    <div className="card">
                      <div className="card-header bg-primary text-white">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-graph-up me-2"></i>

                          {profileData?.role === "admin"
                            ? "Institution Analytics"
                            : "AI-Powered Learning Insights"}
                        </h5>
                      </div>
                      <div className="card-body">
                        <PredictionInsights userRole={profileData?.role} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {profileData?.role === "student" && (
                <div className="col-md-3 mb-4">
                  {subscriptionDaysLeft !== undefined ? (
                    // Regular student card (existing code)
                    <div
                      className={`card ${subscriptionDaysLeft > 10 ? "bg-success" : "bg-danger"
                        } text-white`}
                    >
                      <div className="card-body">
                        <h5 className="card-title text-white">Subscription</h5>
                        <h2 className="text-white">
                          {subscriptionDaysLeft} days
                        </h2>
                        <p className="mb-0">
                          {subscriptionDaysLeft <= 10
                            ? "Your subscription will expire soon!"
                            : "Your subscription is active"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Non-regular student card showing expired subscription
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <h5 className="card-title text-white">
                          Professional Account
                        </h5>
                        <h2 className="text-white">Active</h2>
                        <p className="mb-0">
                          Welcome, working professional! Your account is active.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="col-md-3 mb-4">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <h5 className="card-title text-white">Today</h5>
                    <p className="mb-1">{formatDate(currentDateTime)}</p>
                    <h5 className="text-white">
                      {formatTime(currentDateTime)}
                    </h5>
                  </div>
                </div>
              </div>
              {profileData?.role === "admin" && (
                <>
                  <div className="col-md-3 mb-4">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h5 className="card-title text-white">
                          Total Students
                        </h5>
                        <h2 className="text-white">
                          {stats.totalStudents} {/* Direct value */}
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-4">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h5 className="card-title text-white">
                          Total Teachers
                        </h5>
                        <h2 className="text-white">
                          {stats.totalTeachers} {/* Direct value */}
                        </h2>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {profileData?.role !== "admin" && (
                <div className="col-md-3 mb-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title text-white">Total Notes</h5>
                      <h2 className="text-white">{stats.totalNotes}</h2>
                    </div>
                  </div>
                </div>
              )}
              {profileData?.role !== "teacher" &&
                profileData?.role !== "admin" && (
                  <div className="col-md-3 mb-4">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h5 className="card-title text-white">Highest Score</h5>
                        <h2 className="text-white">
                          {stats.highestExamScore}/40
                        </h2>
                      </div>
                    </div>
                  </div>
                )}
              <div
                className={`col-md-${profileData?.role === "teacher" ? "3" : "3"
                  } mb-4`}
              >
                {profileData?.role !== "admin" && (
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Notes by Subject</h5>
                      {Object.entries(stats.notesBySubject || {})
                        .slice(0, 3)
                        .map(([subject, count]) => (
                          <div
                            key={subject}
                            className="d-flex justify-content-between align-items-center mb-2"
                          >
                            <span>{subject}</span>
                            <span className="badge bg-primary rounded-pill">
                              {count}
                            </span>
                          </div>
                        ))}
                      {Object.keys(stats.notesBySubject || {}).length > 3 && (
                        <div className="text-center mt-2">
                          <small className="text-muted">
                            And {Object.keys(stats.notesBySubject).length - 3}{" "}
                            more subjects
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {profileData?.role === "admin" && (
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Students by Department</h5>
                      <Bar data={studentsByDepartmentChartData} />
                    </div>
                  </div>
                </div>
              )}
              {profileData?.role !== "admin" && (
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Notes Distribution</h5>
                        <Bar data={barChartData} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Overall Statistics</h5>
                        <Pie data={pieChartData} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <AIAssistant />
      </div>
    </DesktopOnly>
  );
};

export default Dashboard;
