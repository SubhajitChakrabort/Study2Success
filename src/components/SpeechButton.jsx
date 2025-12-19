import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

const SpeechButton = ({ text, buttonVariant = 'primary', buttonSize = 'sm', buttonText = '' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speak = () => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    if (!text) return;
    
    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set speaking state to true
    setIsSpeaking(true);
    
    // Add event listener for when speech ends
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    // Add event listener for errors
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  };
  
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };
  
  return (
    <Button
      variant={buttonVariant}
      size={buttonSize}
      onClick={isSpeaking ? stopSpeaking : speak}
      className="speech-button"
    >
      {buttonText || (
        <>
          <i className={`bi ${isSpeaking ? 'bi-pause-fill' : 'bi-volume-up-fill'}`}></i>
          {' '}
          {isSpeaking ? 'Stop' : 'Listen'}
        </>
      )}
    </Button>
  );
};

export default SpeechButton;
