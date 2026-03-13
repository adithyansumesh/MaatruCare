import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { generateAIResponse } from '../services/aiService';

export default function AIAssistantModal({ activeFeature, userProfile, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const featureLabel = activeFeature.replace(/-/g, ' ');
    setMessages([{
      role: 'model',
      content: `Welcome to ${featureLabel}! I'm your AI assistant. How can I help you today, ${userProfile.name}?`
    }]);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [activeFeature, userProfile.name]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await generateAIResponse(
        activeFeature,
        userProfile,
        messages,
        userMessage
      );
      setMessages(prev => {
        const updated = [...prev, { role: 'model', content: response }];
        try {
          const existing = JSON.parse(localStorage.getItem('maatrucare_chat_history') || '[]');
          const combined = [...existing, { role: 'user', content: userMessage }, { role: 'model', content: response }].slice(-50);
          localStorage.setItem('maatrucare_chat_history', JSON.stringify(combined));
        } catch {}
        return updated;
      });
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I had trouble processing that. Please try again." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const featureLabel = activeFeature.replace(/-/g, ' ');

  return (
    <div className="chat-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="chat-modal">
        <div className="chat-header">
          <div className="chat-header-title">
            <h3>{featureLabel}</h3>
          </div>
          <button id="chat-close" className="chat-close-btn" onClick={onClose} aria-label="Close chat">
            <X size={18} />
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
            >
              {msg.content}
            </div>
          ))}

          {isLoading && (
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-bar" onSubmit={handleSend}>
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            className="chat-input"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            id="chat-send"
            type="submit"
            className="chat-send-btn"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
