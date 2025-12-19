import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Resume.css';

const Resume = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [resumeData, setResumeData] = useState(null);

    const [personalInfo, setPersonalInfo] = useState({
        name: '',
        title: '',
        about: '',
        state: '',
        city: '',
        phone: '',
        email: ''
    });

    const [skills, setSkills] = useState([{ skill: '', level: 'Beginner' }]);

    const [projects, setProjects] = useState([{
        title: '',
        description: '',
        technologies: '',
        link: '',
        startDate: '',
        endDate: ''
    }]);

    const [education, setEducation] = useState([{
        degree: '10th',
        stream: '',
        institution: '',
        startDate: '',
        endDate: '',
        cgpa: '',
        percentage: ''
    }]);

    const [experience, setExperience] = useState([{
        companyName: '',
        position: '',
        techStack: '',
        description: '',
        startDate: '',
        endDate: '',
        isCurrent: false
    }]);

    const [hobbies, setHobbies] = useState(['']);

    useEffect(() => {
        fetchResumeData();
    }, []);
   const fetchResumeData = async () => {
    try {
        const response = await fetch('/api/resume', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            setResumeData(data);

            // Update personal information
            if (data.personal) {
                setPersonalInfo({
                    name: data.personal.name || '',
                    title: data.personal.title || '',
                    about: data.personal.about || '',
                    state: data.personal.state || '',
                    city: data.personal.city || '',
                    phone: data.personal.phone || '',
                    email: data.personal.email || ''
                });

                // Set profile image preview if exists
                if (data.personal.profile_image) {
                    setImagePreview(data.personal.profile_image);
                }
            }

            // Update skills
            if (data.skills && data.skills.length > 0) {
                setSkills(data.skills.map(skill => ({
                    skill: skill.skill,
                    level: skill.level
                })));
            }

            // Update experience (this was already working)
            if (data.experience && data.experience.length > 0) {
                const formattedExperience = data.experience.map(exp => ({
                    companyName: exp.company_name,
                    position: exp.position,
                    techStack: exp.tech_stack,
                    description: exp.description,
                    startDate: exp.start_date?.split('T')[0],
                    endDate: exp.end_date?.split('T')[0],
                    isCurrent: exp.is_current
                }));
                setExperience(formattedExperience);
            }

            // Update projects
            if (data.projects && data.projects.length > 0) {
                const formattedProjects = data.projects.map(project => ({
                    title: project.title,
                    description: project.description,
                    technologies: project.technologies,
                    link: project.link || '',
                    startDate: project.start_date?.split('T')[0] || '',
                    endDate: project.end_date?.split('T')[0] || ''
                }));
                setProjects(formattedProjects);
            }

            // Update education
            if (data.education && data.education.length > 0) {
                const formattedEducation = data.education.map(edu => ({
                    degree: edu.degree,
                    stream: edu.stream,
                    institution: edu.institution,
                    startDate: edu.start_date?.split('T')[0],
                    endDate: edu.end_date?.split('T')[0],
                    cgpa: edu.cgpa || '',
                    percentage: edu.percentage || ''
                }));
                setEducation(formattedEducation);
            }

            // Update hobbies
            if (data.hobbies && data.hobbies.length > 0) {
                setHobbies(data.hobbies);
            }
        }
    } catch (error) {
        console.error('Error fetching resume data:', error);
    }
};
    


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Add/Remove functions for different sections
    const addSkill = () => setSkills([...skills, { skill: '', level: 'Beginner' }]);
    const removeSkill = (index) => setSkills(skills.filter((_, i) => i !== index));

    const addProject = () => setProjects([...projects, {
        title: '', description: '', technologies: '', link: '', startDate: '', endDate: ''
    }]);
    const removeProject = (index) => setProjects(projects.filter((_, i) => i !== index));

    const addEducation = () => setEducation([...education, {
        degree: '10th', stream: '', institution: '', startDate: '', endDate: '', cgpa: '', percentage: ''
    }]);
    const removeEducation = (index) => setEducation(education.filter((_, i) => i !== index));

    const addExperience = () => setExperience([...experience, {
        companyName: '', position: '', techStack: '', description: '', startDate: '', endDate: '', isCurrent: false
    }]);
    const removeExperience = (index) => setExperience(experience.filter((_, i) => i !== index));

    const addHobby = () => setHobbies([...hobbies, '']);
    const removeHobby = (index) => setHobbies(hobbies.filter((_, i) => i !== index));
    // Form submission handlers
    const handlePersonalSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(personalInfo).forEach(key => {
                formData.append(key, personalInfo[key]);
            });
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const response = await fetch('/api/resume/personal', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                toast.success('Personal information saved successfully!');
                setActiveTab('skills');
                fetchResumeData();
            } else {
                toast.error('Failed to save personal information');
            }
        } catch (error) {
            toast.error('Error saving personal information');
        }
    };

    const handleSkillsSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/resume/skills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ skills })
            });

            if (response.ok) {
                toast.success('Skills saved successfully!');
                setActiveTab('experience');
                fetchResumeData();
            } else {
                toast.error('Failed to save skills');
            }
        } catch (error) {
            toast.error('Error saving skills');
        }
    };

    const handleExperienceSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/resume/experience', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ experience })
            });

            if (response.ok) {
                toast.success('Work experience saved successfully!');
                setActiveTab('projects');
                fetchResumeData();
            } else {
                toast.error('Failed to save work experience');
            }
        } catch (error) {
            toast.error('Error saving work experience');
        }
    };

    const handleProjectsSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/resume/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ projects })
            });

            if (response.ok) {
                toast.success('Projects saved successfully!');
                setActiveTab('education');
                fetchResumeData();
            } else {
                toast.error('Failed to save projects');
            }
        } catch (error) {
            toast.error('Error saving projects');
        }
    };
    const handleEducationSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/resume/education', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ education })
            });

            if (response.ok) {
                toast.success('Education saved successfully!');
                setActiveTab('hobbies');
                fetchResumeData();
            } else {
                toast.error('Failed to save education');
            }
        } catch (error) {
            toast.error('Error saving education');
        }
    };

    const handleHobbiesSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/resume/hobbies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ hobbies: hobbies.filter(h => h.trim()) })
            });

            if (response.ok) {
                toast.success('Hobbies saved successfully!');
                toast.success('Resume completed! You can now view or download it.');
                fetchResumeData();
            } else {
                toast.error('Failed to save hobbies');
            }
        } catch (error) {
            toast.error('Error saving hobbies');
        }
    };

    const downloadPDF = async () => {
        if (!resumeData || !resumeData.personal) {
            toast.error('Please complete your resume first!');
            return;
        }

        setIsDownloading(true);
        try {
            // Ensure preview is shown before generating PDF
            if (!showPreview) {
                setShowPreview(true);
                // Wait a bit for the DOM to update
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const element = document.getElementById('resume-preview');
            
            if (!element) {
                toast.error('Resume preview not found. Please try again.');
                setIsDownloading(false);
                return;
            }

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = `${resumeData.personal.name.replace(/\s+/g, '_')}_Resume.pdf`;
            pdf.save(fileName);

            toast.success('Resume downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to download resume');
        } finally {
            setIsDownloading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };
    return (
        <div className="resume-builder">
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Build Your Resume</h2>
                    <div>
                        {resumeData && resumeData.personal && (
                            <>
                                <button
                                    className="btn btn-info me-2"
                                    onClick={() => setShowPreview(!showPreview)}
                                >
                                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={downloadPDF}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="progress mb-4">
                    <div
                        className="progress-bar"
                        style={{
                            width: `${(['personal', 'skills', 'experience', 'projects', 'education', 'hobbies'].indexOf(activeTab) + 1) * 16.67}%`
                        }}
                    ></div>
                </div>

                <ul className="nav nav-pills justify-content-center mb-4">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('personal')}
                        >
                            Personal Info
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'skills' ? 'active' : ''}`}
                            onClick={() => setActiveTab('skills')}
                        >
                            Skills
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'experience' ? 'active' : ''}`}
                            onClick={() => setActiveTab('experience')}
                        >
                            Experience
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`}
                            onClick={() => setActiveTab('projects')}
                        >
                            Projects
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'education' ? 'active' : ''}`}
                            onClick={() => setActiveTab('education')}
                        >
                            Education
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'hobbies' ? 'active' : ''}`}
                            onClick={() => setActiveTab('hobbies')}
                        >
                            Hobbies
                        </button>
                    </li>
                </ul>
                <div className="row">
                    <div className={showPreview ? "col-md-6" : "col-md-12"}>
                        {/* Personal Information Form */}
                        {activeTab === 'personal' && (
                            <div className="card">
                                <div className="card-header">
                                    <h4>Personal Information</h4>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handlePersonalSubmit}>
                                        <div className="row">
                                            <div className="col-md-12 text-center mb-3">
                                                <div className="profile-image-upload">
                                                    {imagePreview ? (
                                                        <img
                                                            src={imagePreview.startsWith('/uploads') ? `https://smartstudy-server.onrender.com${imagePreview}` : imagePreview}
                                                            alt="Profile"
                                                            className="profile-preview"
                                                        />
                                                    ) : (
                                                        <div className="profile-placeholder">
                                                            <i className="bi bi-person-circle"></i>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        id="profileImage"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="d-none"
                                                    />
                                                    <label htmlFor="profileImage" className="btn btn-outline-primary mt-2">
                                                        Upload Photo
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Full Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={personalInfo.name}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Professional Title *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="e.g., Software Developer"
                                                    value={personalInfo.title}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">About Me *</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                placeholder="Brief description about yourself..."
                                                value={personalInfo.about}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, about: e.target.value })}
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">State *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={personalInfo.state}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">City *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={personalInfo.city}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    value={personalInfo.phone}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Email *</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={personalInfo.email}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className="btn btn-primary">
                                            Save & Continue
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                        {/* Skills Form */}
                        {activeTab === 'skills' && (
                            <div className="card">
                                <div className="card-header">
                                    <h4>Skills</h4>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleSkillsSubmit}>
                                        {skills.map((skill, index) => (
                                            <div key={index} className="row mb-3">
                                                <div className="col-md-6">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Skill name"
                                                        value={skill.skill}
                                                        onChange={(e) => {
                                                            const newSkills = [...skills];
                                                            newSkills[index].skill = e.target.value;
                                                            setSkills(newSkills);
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <select
                                                        className="form-control"
                                                        value={skill.level}
                                                        onChange={(e) => {
                                                            const newSkills = [...skills];
                                                            newSkills[index].level = e.target.value;
                                                            setSkills(newSkills);
                                                        }}
                                                    >
                                                        <option value="Beginner">Beginner</option>
                                                        <option value="Intermediate">Intermediate</option>
                                                        <option value="Advanced">Advanced</option>
                                                        <option value="Expert">Expert</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-2">
                                                    {skills.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            onClick={() => removeSkill(index)}
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        <button type="button" className="btn btn-secondary mb-3" onClick={addSkill}>
                                            Add Skill
                                        </button>

                                        <div>
                                            <button type="submit" className="btn btn-primary me-2">
                                                Save & Continue
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveTab('personal')}>
                                                Previous
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Experience Form */}
                        {activeTab === 'experience' && (
                            <div className="card">
                                <div className="card-header">
                                    <h4>Work Experience</h4>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleExperienceSubmit}>
                                        {experience.map((exp, index) => (
                                            <div key={index} className="border p-3 mb-3 rounded">
                                                <h6>Experience {index + 1}</h6>
                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Company Name *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={exp.companyName}
                                                            onChange={(e) => {
                                                                const newExperience = [...experience];
                                                                newExperience[index].companyName = e.target.value;
                                                                setExperience(newExperience);
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Position *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={exp.position}
                                                            onChange={(e) => {
                                                                const newExperience = [...experience];
                                                                newExperience[index].position = e.target.value;
                                                                setExperience(newExperience);
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Tech Stack</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="e.g., React, Node.js, MySQL"
                                                        value={exp.techStack}
                                                        onChange={(e) => {
                                                            const newExperience = [...experience];
                                                            newExperience[index].techStack = e.target.value;
                                                            setExperience(newExperience);
                                                        }}
                                                    />
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Description *</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="3"
                                                        value={exp.description}
                                                        onChange={(e) => {
                                                            const newExperience = [...experience];
                                                            newExperience[index].description = e.target.value;
                                                            setExperience(newExperience);
                                                        }}
                                                        required
                                                    ></textarea>
                                                </div>

                                                <div className="row mb-3">
                                                    <div className="col-md-4">
                                                        <label className="form-label">Start Date *</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={exp.startDate}
                                                            onChange={(e) => {
                                                                const newExperience = [...experience];
                                                                newExperience[index].startDate = e.target.value;
                                                                setExperience(newExperience);
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label">End Date</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={exp.endDate}
                                                            disabled={exp.isCurrent}
                                                            onChange={(e) => {
                                                                const newExperience = [...experience];
                                                                newExperience[index].endDate = e.target.value;
                                                                setExperience(newExperience);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-md-2">
                                                        <div className="form-check mt-4">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                checked={exp.isCurrent}
                                                                onChange={(e) => {
                                                                    const newExperience = [...experience];
                                                                    newExperience[index].isCurrent = e.target.checked;
                                                                    if (e.target.checked) {
                                                                        newExperience[index].endDate = '';
                                                                    }
                                                                    setExperience(newExperience);
                                                                }}
                                                            />
                                                            <label className="form-check-label">Current Job</label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2 d-flex align-items-end">
                                                        {experience.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                onClick={() => removeExperience(index)}
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button type="button" className="btn btn-secondary mb-3" onClick={addExperience}>
                                            Add Experience
                                        </button>

                                        <div>
                                            <button type="submit" className="btn btn-primary me-2">
                                                Save & Continue
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveTab('skills')}>
                                                Previous
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                        {/* Projects Form */}
                        {activeTab === 'projects' && (
                            <div className="card">
                                <div className="card-header">
                                    <h4>Projects</h4>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleProjectsSubmit}>
                                        {projects.map((project, index) => (
                                            <div key={index} className="border p-3 mb-3 rounded">
                                                <h6>Project {index + 1}</h6>
                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Project Title *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={project.title}
                                                            onChange={(e) => {
                                                                const newProjects = [...projects];
                                                                newProjects[index].title = e.target.value;
                                                                setProjects(newProjects);
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Project Link</label>
                                                        <input
                                                            type="url"
                                                            className="form-control"
                                                            placeholder="https://github.com/username/project"
                                                            value={project.link}
                                                            onChange={(e) => {
                                                                const newProjects = [...projects];
                                                                newProjects[index].link = e.target.value;
                                                                setProjects(newProjects);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Description *</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="3"
                                                        value={project.description}
                                                        onChange={(e) => {
                                                            const newProjects = [...projects];
                                                            newProjects[index].description = e.target.value;
                                                            setProjects(newProjects);
                                                        }}
                                                        required
                                                    ></textarea>
                                                </div>

                                                <div className="row mb-3">
                                                    <div className="col-md-4">
                                                        <label className="form-label">Technologies Used *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="React, Node.js, MongoDB"
                                                            value={project.technologies}
                                                            onChange={(e) => {
                                                                const newProjects = [...projects];
                                                                newProjects[index].technologies = e.target.value;
                                                                setProjects(newProjects);
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">Start Date</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={project.startDate}
                                                            onChange={(e) => {
                                                                const newProjects = [...projects];
                                                                newProjects[index].startDate = e.target.value;
                                                                setProjects(newProjects);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">End Date</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={project.endDate}
                                                            onChange={(e) => {
                                                                const newProjects = [...projects];
                                                                newProjects[index].endDate = e.target.value;
                                                                setProjects(newProjects);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-md-2 d-flex align-items-end">
                                                        {projects.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                onClick={() => removeProject(index)}
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button type="button" className="btn btn-secondary mb-3" onClick={addProject}>
                                            Add Project
                                        </button>

                                        <div>
                                            <button type="submit" className="btn btn-primary me-2">
                                                Save & Continue
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveTab('experience')}>
                                                Previous
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                        {/* Education Form */}
                        {activeTab === 'education' && (
                            <div className="card">
                                <div className="card-header">
                                    <h4>Education</h4>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleEducationSubmit}>
                                        {education.map((edu, index) => (
                                            <div key={index} className="border p-3 mb-3 rounded">
                                                <h6>Education {index + 1}</h6>
                                                <div className="row mb-3">
                                                    <div className="col-md-4">
                                                        <label className="form-label">Degree/Level *</label>
                                                        <select
                                                            className="form-control"
                                                            value={edu.degree}
                                                            onChange={(e) => {
                                                                const newEducation = [...education];
                                                                newEducation[index].degree = e.target.value;
                                                                setEducation(newEducation);
                                                            }}
                                                            required
                                                        >
                                                            <option value="10th">10th Grade</option>
                                                            <option value="12th">12th Grade</option>
                                                            <option value="Diploma">Diploma</option>
                                                            <option value="Bachelor">Bachelor's Degree</option>
                                                            <option value="Master">Master's Degree</option>
                                                            <option value="PhD">PhD</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label">Stream/Specialization *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="e.g., Computer Science, Science"
                                                            value={edu.stream}
                                                            onChange={(e) => {
                                                                const newEducation = [...education];
                                                                newEducation[index].stream = e.target.value;
                                                                setEducation(newEducation);
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label">Institution/School *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={edu.institution}
                                                            onChange={(e) => {
                                                                const newEducation = [...education];
                                                                newEducation[index].institution = e.target.value;
                                                                setEducation(newEducation);
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row mb-3">
                                                    <div className="col-md-3">
                                                        <label className="form-label">Start Date *</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={edu.startDate}
                                                            onChange={(e) => {
                                                                const newEducation = [...education];
                                                                newEducation[index].startDate = e.target.value;
                                                                setEducation(newEducation);
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label">End Date *</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={edu.endDate}
                                                            onChange={(e) => {
                                                                const newEducation = [...education];
                                                                newEducation[index].endDate = e.target.value;
                                                                setEducation(newEducation);
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-2">
                                                        <label className="form-label">CGPA</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            max="10"
                                                            className="form-control"
                                                            placeholder="0.00"
                                                            value={edu.cgpa}
                                                            onChange={(e) => {
                                                                const newEducation = [...education];
                                                                newEducation[index].cgpa = e.target.value;
                                                                setEducation(newEducation);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-md-2">
                                                        <label className="form-label">Percentage</label>
                                                        <input
                                                            type="number"
                                                            max="100"
                                                            className="form-control"
                                                            placeholder="0"
                                                            value={edu.percentage}
                                                            onChange={(e) => {
                                                                const newEducation = [...education];
                                                                newEducation[index].percentage = e.target.value;
                                                                setEducation(newEducation);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="col-md-2 d-flex align-items-end">
                                                        {education.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                onClick={() => removeEducation(index)}
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button type="button" className="btn btn-secondary mb-3" onClick={addEducation}>
                                            Add Education
                                        </button>

                                        <div>
                                            <button type="submit" className="btn btn-primary me-2">
                                                Save & Continue
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveTab('projects')}>
                                                Previous
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Hobbies Form */}
                        {activeTab === 'hobbies' && (
                            <div className="card">
                                <div className="card-header">
                                    <h4>Hobbies & Interests</h4>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleHobbiesSubmit}>
                                        {hobbies.map((hobby, index) => (
                                            <div key={index} className="row mb-3">
                                                <div className="col-md-10">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Enter hobby or interest"
                                                        value={hobby}
                                                        onChange={(e) => {
                                                            const newHobbies = [...hobbies];
                                                            newHobbies[index] = e.target.value;
                                                            setHobbies(newHobbies);
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    {hobbies.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            onClick={() => removeHobby(index)}
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        <button type="button" className="btn btn-secondary mb-3" onClick={addHobby}>
                                            Add Hobby
                                        </button>

                                        <div>
                                            <button type="submit" className="btn btn-success me-2">
                                                Complete Resume
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveTab('education')}>
                                                Previous
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                        {/* Resume Preview Section */}
                        {/* Resume Preview Section */}
                        {showPreview && resumeData && resumeData.personal && (
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-body" id="resume-preview">
                                        {/* Header Section */}
                                        <div className="resume-header">
                                            {imagePreview && (
                                                <img
                                                    src={imagePreview.startsWith('/uploads') ? `https://smartstudy-server.onrender.com${imagePreview}` : imagePreview}
                                                    alt="Profile"
                                                    className="profile-image"
                                                />
                                            )}
                                            <h1>{personalInfo.name}</h1>
                                            <div className="job-title">{personalInfo.title}</div>
                                            <div className="contact-info">
                                                <span><i className="bi bi-geo-alt-fill"></i> {personalInfo.city}, {personalInfo.state}</span>
                                                <span><i className="bi bi-envelope-fill"></i> {personalInfo.email}</span>
                                                <span><i className="bi bi-telephone-fill"></i> {personalInfo.phone}</span>
                                            </div>
                                        </div>

                                        <div className="resume-content">
                                            {/* Professional Summary */}
                                            <div className="resume-section">
                                                <h3 className="section-title">Professional Summary</h3>
                                                <p className="summary-text">{personalInfo.about}</p>
                                            </div>

                                            {/* Skills */}
                                            {skills.length > 0 && skills[0].skill && (
                                                <div className="resume-section">
                                                    <h3 className="section-title">Technical Skills</h3>
                                                    <div className="skills-grid">
                                                        {skills.map((skill, index) => (
                                                            skill.skill && (
                                                                <div key={index} className="skill-item">
                                                                    <span className="skill-name">{skill.skill}</span>
                                                                    <span className="skill-level">{skill.level}</span>
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Experience */}
                                            {experience.length > 0 && experience[0].companyName && (
                                                <div className="resume-section">
                                                    <h3 className="section-title">Professional Experience</h3>
                                                    {experience.map((exp, index) => (
                                                        exp.companyName && (
                                                            <div key={index} className="experience-item">
                                                                <div className="experience-header">
                                                                    <div>
                                                                        <h4 className="job-position">{exp.position}</h4>
                                                                        <h5 className="company-name">{exp.companyName}</h5>
                                                                    </div>
                                                                    <div className="date-range">
                                                                        {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                                                                    </div>
                                                                </div>
                                                                <p className="job-description">{exp.description}</p>
                                                                {exp.techStack && (
                                                                    <div className="tech-stack">
                                                                        <strong>Tech:</strong> {exp.techStack}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}

                                            {/* Projects */}
                                            {projects.length > 0 && projects[0].title && (
                                                <div className="resume-section">
                                                    <h3 className="section-title">Key Projects</h3>
                                                    {projects.map((project, index) => (
                                                        project.title && (
                                                            <div key={index} className="project-item">
                                                                <div className="project-header">
                                                                    <h4 className="project-title">{project.title}</h4>
                                                                    <div className="date-range">
                                                                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                                                                    </div>
                                                                </div>
                                                                <p className="project-description">{project.description}</p>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7px' }}>
                                                                    <div className="project-tech">
                                                                        <strong>Tech:</strong> {project.technologies}
                                                                    </div>
                                                                    {project.link && (
                                                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                                                                            Link
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}

                                            {/* Education */}
                                            {education.length > 0 && education[0].institution && (
                                                <div className="resume-section">
                                                    <h3 className="section-title">Education</h3>
                                                    {education.map((edu, index) => (
                                                        edu.institution && (
                                                            <div key={index} className="education-item">
                                                                <div className="education-header">
                                                                    <div>
                                                                        <h4 className="degree-title">
                                                                            {edu.degree} {edu.stream && `in ${edu.stream}`}
                                                                        </h4>
                                                                        <h5 className="institution-name">{edu.institution}</h5>
                                                                    </div>
                                                                    <div className="date-range">
                                                                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                                                    </div>
                                                                </div>
                                                                {(edu.cgpa || edu.percentage) && (
                                                                    <div className="education-details">
                                                                        {edu.cgpa && `CGPA: ${edu.cgpa}`}
                                                                        {edu.cgpa && edu.percentage && ' | '}
                                                                        {edu.percentage && `Percentage: ${edu.percentage}%`}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}

                                            {/* Hobbies */}
                                            {hobbies.length > 0 && hobbies[0] && (
                                                <div className="resume-section">
                                                    <h3 className="section-title">Interests</h3>
                                                    <div className="hobbies-container">
                                                        {hobbies.map((hobby, index) => (
                                                            hobby && (
                                                                <span key={index} className="hobby-tag">
                                                                    {hobby}
                                                                </span>
                                                            )
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resume;
