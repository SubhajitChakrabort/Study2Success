import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import SpeechButton from './SpeechButton';
import ReactMarkdown from 'react-markdown';

const NoteDetail = ({ noteId }) => {
  const [note, setNote] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch note and summary data
    const fetchNoteAndSummary = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch note details
        const noteResponse = await fetch(`https://smartstudy-server.onrender.com/api/notes/${noteId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch summary
        const summaryResponse = await fetch(`https://smartstudy-server.onrender.com/api/note-summaries/summaries?note_id=${noteId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!noteResponse.ok) {
          throw new Error('Failed to fetch note');
        }
        
        const noteData = await noteResponse.json();
        setNote(noteData);
        
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          if (summaryData.length > 0) {
            setSummary(summaryData[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching note details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNoteAndSummary();
  }, [noteId]);
  
  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }
  
  if (!note) {
    return <div className="alert alert-danger">Note not found</div>;
  }
  
  return (
    <div className="note-detail-container">
      <Card className="mb-4">
        <Card.Header>
          <h3>{note.title}</h3>
        </Card.Header>
        <Card.Body>
          {/* Note content here */}
        </Card.Body>
      </Card>
      
      {summary && (
        <Card className="mb-4 note-summary-card">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h4>Summary</h4>
            <SpeechButton 
              text={summary.content} 
              buttonVariant="outline-primary"
            />
          </Card.Header>
          <Card.Body>
            <div className="summary-content">
              <ReactMarkdown>{summary.content}</ReactMarkdown>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {!summary && (
        <div className="text-center p-4">
          <p>No summary available for this note.</p>
          <Button 
            variant="primary" 
            onClick={() => {/* Generate summary logic */}}
          >
            Generate Summary
          </Button>
        </div>
      )}
    </div>
  );
};

export default NoteDetail;
