import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({
    id: null,
    subjectName: '',
    title: '',
    content: '',
    images: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  useEffect(() => {
    fetchNotes();
  }, []);
  useEffect(() => {
    const filtered = notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [searchTerm, notes]);
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const generatePDF = async (note) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://smartstudy-server.onrender.com/api/notes/save-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subjectName: note.subject_name,
          title: note.title,
          content: note.content
        })
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('PDF generated:', data.filePath);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `https://smartstudy-server.onrender.com/api/notes/${currentNote.id}`
        : 'https://smartstudy-server.onrender.com/api/notes';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentNote)
      });

      if (response.ok) {
        fetchNotes();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://smartstudy-server.onrender.com/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const resetForm = () => {
    setCurrentNote({
      id: null,
      subjectName: '',
      title: '',
      content: '',
      images: []
    });
    setIsEditing(false);
  };

  return (
    <div className="notes-container">
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Your Notes</h3>
                <div className="search-box mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search notes by subject or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="bi bi-search search-icon"></i>
                </div>
                <div className="notes-list">
                  {filteredNotes.map(note => (
                    <div key={note.id} className="note-item">
                      <h4>{note.title}</h4>
                      <p>{note.subject_name}</p>
                      <div className="note-actions">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setCurrentNote({
                              id: note.id,
                              subjectName: note.subject_name,
                              title: note.title,
                              content: note.content,
                              images: note.images || []
                            });
                            setIsEditing(true);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-success ms-2"
                          onClick={() => generatePDF(note)}
                        >
                          Generate PDF
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger ms-2"
                          onClick={() => handleDelete(note.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="card-title">
                  {isEditing ? 'Edit Note' : 'Create New Note'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Subject Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentNote.subjectName}
                      onChange={(e) => setCurrentNote({
                        ...currentNote,
                        subjectName: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentNote.title}
                      onChange={(e) => setCurrentNote({
                        ...currentNote,
                        title: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Content</label>
                    <Editor
                      apiKey="phlvnk0vh3691l0x6qh09xzxf2rrodrv8si3pj7hwy0ytobc"
                      value={currentNote.content}
                      onEditorChange={(content, editor) => {
                        setCurrentNote(prev => ({
                          ...prev,
                          content: content
                        }));
                      }}
                      init={{
                        height: 500,
                        menubar: true,
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'image', 
                          'charmap', 'preview', 'anchor', 'searchreplace',
                          'visualblocks', 'code', 'fullscreen', 'insertdatetime', 
                          'media', 'table', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                          'bold italic forecolor | alignleft aligncenter ' +
                          'alignright alignjustify | bullist numlist outdent indent | ' +
                          'removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                      }}
                    />
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-primary">
                      {isEditing ? 'Update Note' : 'Save Note'}
                    </button>
                    {isEditing && (
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
