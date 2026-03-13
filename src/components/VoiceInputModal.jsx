import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Send, Loader2, Volume2 } from 'lucide-react';
import { generateAIResponse } from '../services/aiService';

// Check for browser SpeechRecognition support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceInputModal({ userProfile, onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const recognitionRef = useRef(null);
  const responseRef = useRef(null);

  const supported = !!SpeechRecognition;

  // Scroll to response when it appears
  useEffect(() => {
    if (aiResponse) {
      responseRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiResponse]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (!supported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setError('');
    setTranscript('');
    setInterimTranscript('');
    setAiResponse('');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // English (India)

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      setTranscript(finalText);
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions in your browser.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSendToAI = async () => {
    const finalText = transcript || interimTranscript;
    if (!finalText.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setAiResponse('');

    // Combine transcript parts
    const fullTranscript = finalText.trim();
    setTranscript(fullTranscript);
    setInterimTranscript('');

    try {
      const response = await generateAIResponse(
        'voice',
        userProfile,
        history,
        fullTranscript
      );
      setAiResponse(response);
      setHistory(prev => [
        ...prev,
        { role: 'user', content: fullTranscript },
        { role: 'model', content: response }
      ]);
    } catch {
      setError('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRecording = () => {
    setTranscript('');
    setInterimTranscript('');
    setAiResponse('');
    setError('');
  };

  const currentText = transcript + interimTranscript;

  return (
    <div className="chat-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="voice-modal">
        {/* Header */}
        <div className="voice-header">
          <div className="voice-header-title">
            <Mic size={20} />
            <h3>Voice Input</h3>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="voice-content">

          {/* Microphone Button */}
          <div className="voice-mic-area">
            {!supported ? (
              <div className="voice-unsupported">
                <MicOff size={32} />
                <p>Speech recognition is not available in this browser. Please use Chrome or Edge.</p>
              </div>
            ) : (
              <>
                <button
                  className={`voice-mic-btn ${isListening ? 'voice-mic-btn-active' : ''}`}
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                </button>
                <p className="voice-mic-label">
                  {isListening
                    ? 'Listening... Tap to stop'
                    : currentText
                      ? 'Tap to record again'
                      : 'Tap to start speaking'
                  }
                </p>
                {isListening && (
                  <div className="voice-pulse-rings">
                    <div className="voice-pulse-ring" />
                    <div className="voice-pulse-ring voice-pulse-ring-2" />
                    <div className="voice-pulse-ring voice-pulse-ring-3" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Transcript */}
          {currentText && (
            <div className="voice-transcript">
              <span className="voice-transcript-label">Your words:</span>
              <p className="voice-transcript-text">
                {transcript}
                {interimTranscript && (
                  <span className="voice-interim">{interimTranscript}</span>
                )}
              </p>

              {!aiResponse && !isLoading && (
                <div className="voice-transcript-actions">
                  <button className="btn btn-secondary" onClick={handleNewRecording}>
                    <Mic size={16} />
                    Re-record
                  </button>
                  <button className="btn btn-primary" onClick={handleSendToAI}>
                    <Send size={16} />
                    Ask AI
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="voice-loading">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <span>AI is thinking...</span>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <div className="voice-response" ref={responseRef}>
              <div className="voice-response-header">
                <Volume2 size={16} />
                <span>AI Response</span>
              </div>
              <p className="voice-response-text">{aiResponse}</p>
              <button className="btn btn-primary" onClick={handleNewRecording} style={{ marginTop: '1rem' }}>
                <Mic size={16} />
                Ask Another Question
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="voice-error">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
