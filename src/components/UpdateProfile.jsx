import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UpdateProfile.css";
import DesktopOnly from "./DesktopOnly";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    email: "",
    name: "",
    address: "",
    department: "",
    phoneNumber: "",
    teacherId: "",
    photo: null,
    semesters: [],
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isTeacher, setIsTeacher] = useState(false);

  const departments = [
    { id: "CSE", name: "Computer Science" },
    { id: "ECE", name: "Electronics" },
    { id: "ME", name: "Mechanical" },
    { id: "CE", name: "Civil" },
    { id: "CHE", name: "Chemical" },
    { id: "MCA", name: "Master In Computer" },
    { id: "CFA", name: "Collage Faculty Admin" },
  ];

  const semesters = [
    { id: "sem1", name: "Semester 1" },
    { id: "sem2", name: "Semester 2" },
    { id: "sem3", name: "Semester 3" },
    { id: "sem4", name: "Semester 4" },
    { id: "sem5", name: "Semester 5" },
    { id: "sem6", name: "Semester 6" },
    { id: "sem7", name: "Semester 7" },
    { id: "sem8", name: "Semester 8" },
  ];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://smartstudy-server.onrender.com/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      // Check if user is a teacher
      if (data.role === "teacher") {
        setIsTeacher(true);

        // Fetch teacher-specific profile data
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
          setProfileData({
            ...data,
            phoneNumber: teacherData.phone_number || "",
            department: teacherData.department || "",
            teacherId: teacherData.teacher_id || "",
            address: teacherData.address || "",
            semesters: teacherData.semesters || [],
          });

          if (teacherData.photo_url) {
            setPhotoPreview(`https://smartstudy-server.onrender.com${teacherData.photo_url}`);
          }
        } else {
          setProfileData({
            ...data,
            semesters: [],
          });
        }
      } else {
        setProfileData(data);
        if (data.photoUrl) {
          setPhotoPreview(`https://smartstudy-server.onrender.com${data.photoUrl}`);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({ ...profileData, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSemesterChange = (semesterId) => {
    const updatedSemesters = [...profileData.semesters];

    if (updatedSemesters.includes(semesterId)) {
      // Remove semester if already selected
      const index = updatedSemesters.indexOf(semesterId);
      updatedSemesters.splice(index, 1);
    } else {
      // Add semester if not selected
      updatedSemesters.push(semesterId);
    }

    setProfileData({ ...profileData, semesters: updatedSemesters });
  };

  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setProfileData({ ...profileData, department });

    // Generate teacher ID if department and phone number are available
    if (department && profileData.phoneNumber) {
      generateTeacherId(department, profileData.phoneNumber);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const phoneNumber = e.target.value;
    setProfileData({ ...profileData, phoneNumber });

    // Generate teacher ID if department and phone number are available
    if (profileData.department && phoneNumber) {
      generateTeacherId(profileData.department, phoneNumber);
    }
  };

  const generateTeacherId = (department, phoneNumber) => {
    if (phoneNumber.length >= 6) {
      const firstThree = phoneNumber.substring(0, 3);
      const lastThree = phoneNumber.substring(phoneNumber.length - 3);
      const teacherId = `${department}${firstThree}${lastThree}`;
      setProfileData((prevData) => ({ ...prevData, teacherId }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      if (isTeacher) {
        formData.append("phoneNumber", profileData.phoneNumber || "");
        formData.append("department", profileData.department || "");
        formData.append("teacherId", profileData.teacherId || "");
        formData.append("address", profileData.address || "");
        formData.append(
          "semesters",
          JSON.stringify(profileData.semesters || [])
        );

        if (profileData.photo) {
          formData.append("photo", profileData.photo);
        }

        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://smartstudy-server.onrender.com/api/teacher/update-profile",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          navigate("/dashboard");
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message || "Failed to update profile"}`);
        }
      } else {
        // Handle student profile update
        Object.keys(profileData).forEach((key) => {
          if (key !== "photo") {
            formData.append(key, profileData[key]);
          }
        });

        if (profileData.photo) {
          formData.append("photo", profileData.photo);
        }

        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://smartstudy-server.onrender.com/api/user/update-profile",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          navigate("/dashboard");
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message || "Failed to update profile"}`);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile");
    }
  };

  // Teacher profile form
  if (isTeacher) {
    return (
      <DesktopOnly>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg">
              <div className="card-body p-5">
                <h2 className="text-center mb-4">Update Teacher Profile</h2>

                <form onSubmit={handleSubmit}>
                  <div className="text-center mb-4">
                    <div className="profile-photo-container">
                      <img
                        src={photoPreview || "https://via.placeholder.com/150"}
                        alt="Profile"
                        className="profile-photo"
                      />
                      <label className="photo-upload-label">
                        <i className="bi bi-camera"></i>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="d-none"
                        />
                      </label>
                    </div>
                  </div>
                  {/* <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profileData.email}
                      readOnly
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.name}
                      readOnly
                    />
                  </div> */}
                 
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profileData.email || ""}
                      readOnly
                      placeholder="Email address will appear here"
                    />
                    <small className="text-muted">
                      Email cannot be changed
                    </small>
                  </div>
                 
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.name || ""}
                      readOnly
                      placeholder="Your name will appear here"
                    />
                    <small className="text-muted">Name cannot be changed</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={profileData.address || ""}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.phoneNumber || ""}
                      onChange={handlePhoneNumberChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label d-block">Department</label>
                    <div className="row">
                      {departments.map((dept) => (
                        <div className="col-md-6 mb-2" key={dept.id}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="department"
                              id={`dept-${dept.id}`}
                              value={dept.id}
                              checked={profileData.department === dept.id}
                              onChange={handleDepartmentChange}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`dept-${dept.id}`}
                            >
                              {dept.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label d-block">Semesters</label>
                    <div className="row">
                      {semesters.map((semester) => (
                        <div className="col-md-3 mb-2" key={semester.id}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`sem-${semester.id}`}
                              checked={profileData.semesters.includes(
                                semester.id
                              )}
                              onChange={() => handleSemesterChange(semester.id)}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`sem-${semester.id}`}
                            >
                              {semester.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Teacher ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.teacherId || ""}
                      readOnly
                    />
                    <small className="text-muted">
                      Auto-generated based on department and phone number
                    </small>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Update Profile
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      </DesktopOnly>
    );
  }

  // Student profile form (original form)
  return (
    <DesktopOnly>
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Update Profile</h2>

              <form onSubmit={handleSubmit}>
                <div className="text-center mb-4">
                  <div className="profile-photo-container">
                    <img
                      src={
                        photoPreview ||
                        (profileData.photoUrl
                          ? `https://smartstudy-server.onrender.com${profileData.photoUrl}`
                          : "https://via.placeholder.com/150")
                      }
                      alt="Profile"
                      className="profile-photo"
                    />
                    <label className="photo-upload-label">
                      <i className="bi bi-camera"></i>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="d-none"
                      />
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profileData.email}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.name}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">University ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.universityRoll}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        universityRoll: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={profileData.department}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        department: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science</option>
                    <option value="ECE">Electronics</option>
                    <option value="ME">Mechanical</option>
                    <option value="CE">Civil</option>
                    <option value="CHE">Chemical</option>
                    <option value="MCA">Master In Computer</option>
                    <option value="CFA">Collage Faculty Admin</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: e.target.value,
                      })
                    }
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label">User ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.userId}
                    readOnly
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Update Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DesktopOnly>
  );
};

export default UpdateProfile;
