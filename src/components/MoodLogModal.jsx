import { useState, useEffect } from 'react';
import { X, TrendingUp, Calendar } from 'lucide-react';

const MOOD_STORAGE_KEY = 'maatrucare_mood_log';
const CHAT_STORAGE_KEY = 'maatrucare_chat_history';

const MOODS = [
  { id: 'ecstatic', emoji: '🤩', label: 'Ecstatic', color: '#f72585', level: 5 },
  { id: 'happy', emoji: '😊', label: 'Happy', color: '#ff758f', level: 4 },
  { id: 'calm', emoji: '😌', label: 'Calm', color: '#38b000', level: 3 },
  { id: 'neutral', emoji: '😐', label: 'Neutral', color: '#fca311', level: 2 },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: '#f48c06', level: 1 },
  { id: 'sad', emoji: '😢', label: 'Sad', color: '#00b4d8', level: 0 },
  { id: 'angry', emoji: '😤', label: 'Frustrated', color: '#d00000', level: -1 },
  { id: 'exhausted', emoji: '😩', label: 'Exhausted', color: '#8338ec', level: -2 },
];

const SENTIMENT_KEYWORDS = {
  positive: ['happy', 'great', 'wonderful', 'excited', 'love', 'amazing', 'good', 'thank', 'helped', 'better', 'joy', 'grateful', 'blessed', 'beautiful', 'fantastic', 'perfect', 'relieved', 'comfortable', 'confident', 'smile'],
  negative: ['sad', 'worried', 'scared', 'pain', 'hurt', 'tired', 'exhausted', 'stress', 'anxious', 'afraid', 'nervous', 'cry', 'angry', 'frustrated', 'depressed', 'lonely', 'sick', 'nausea', 'vomit', 'cramp', 'bleeding', 'uncomfortable'],
  calm: ['calm', 'peaceful', 'relaxed', 'fine', 'okay', 'normal', 'stable', 'routine', 'quiet', 'rest'],
};

function loadMoodLog() { try { const s = localStorage.getItem(MOOD_STORAGE_KEY); if (s) return JSON.parse(s); } catch {} return []; }
function saveMoodLog(log) { localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(log)); }
function loadChatHistory() { try { const s = localStorage.getItem(CHAT_STORAGE_KEY); if (s) return JSON.parse(s); } catch {} return []; }

function analyzeChatSentiment(messages) {
  if (!messages || messages.length === 0) return null;
  const recentUserMsgs = messages.filter(m => m.role === 'user').slice(-10).map(m => m.content.toLowerCase());
  if (recentUserMsgs.length === 0) return null;
  const allText = recentUserMsgs.join(' ');
  let pos = 0, neg = 0, cal = 0;
  SENTIMENT_KEYWORDS.positive.forEach(kw => { if (allText.includes(kw)) pos++; });
  SENTIMENT_KEYWORDS.negative.forEach(kw => { if (allText.includes(kw)) neg++; });
  SENTIMENT_KEYWORDS.calm.forEach(kw => { if (allText.includes(kw)) cal++; });
  if (pos > neg && pos > cal) return pos >= 3 ? 'ecstatic' : 'happy';
  if (neg > pos && neg > cal) {
    if (allText.includes('angry') || allText.includes('frustrated')) return 'angry';
    if (allText.includes('tired') || allText.includes('exhausted')) return 'exhausted';
    if (allText.includes('anxious') || allText.includes('worried')) return 'anxious';
    return 'sad';
  }
  if (cal > 0) return 'calm';
  return 'neutral';
}

function formatDay(dateStr) { const d = new Date(dateStr); return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); }

export default function MoodLogModal({ onClose }) {
  const [moodLog, setMoodLog] = useState(loadMoodLog);
  const [suggestedMood, setSuggestedMood] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [view, setView] = useState('log');

  useEffect(() => { saveMoodLog(moodLog); }, [moodLog]);
  useEffect(() => { setSuggestedMood(analyzeChatSentiment(loadChatHistory())); }, []);
  useEffect(() => { const h = (e) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);

  const logMood = () => {
    if (!selectedMood) return;
    setMoodLog(prev => [{ id: Date.now().toString(), moodId: selectedMood, note: note.trim(), timestamp: new Date().toISOString() }, ...prev]);
    setSelectedMood(null); setNote('');
  };

  const getMoodData = (moodId) => MOODS.find(m => m.id === moodId) || MOODS[3];
  const groupedByDay = moodLog.reduce((acc, entry) => { const day = new Date(entry.timestamp).toDateString(); if (!acc[day]) acc[day] = []; acc[day].push(entry); return acc; }, {});
  const days = Object.keys(groupedByDay);
  const last7 = moodLog.slice(0, 7).reverse();

  return (
    <div className="chat-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="mood-modal">
        <div className="mood-header">
          <div className="mood-header-title"><span className="mood-header-emoji">😊</span><h3>Mood Log</h3></div>
          <div className="mood-header-actions">
            <button className={`mood-tab ${view === 'log' ? 'mood-tab-active' : ''}`} onClick={() => setView('log')}>Log</button>
            <button className={`mood-tab ${view === 'history' ? 'mood-tab-active' : ''}`} onClick={() => setView('history')}>History</button>
          </div>
          <button className="chat-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="mood-content">
          {view === 'log' && (
            <>
              {suggestedMood && (
                <div className="mood-suggestion">
                  <span className="mood-suggestion-label">Based on your recent chats, you might be feeling:</span>
                  <button className="mood-suggestion-chip" onClick={() => setSelectedMood(suggestedMood)} style={{ '--mood-color': getMoodData(suggestedMood).color }}>
                    <span className="mood-emoji-lg">{getMoodData(suggestedMood).emoji}</span><span>{getMoodData(suggestedMood).label}</span>
                  </button>
                </div>
              )}
              <div className="mood-picker">
                <span className="mood-picker-label">How are you feeling?</span>
                <div className="mood-emoji-grid">
                  {MOODS.map(mood => (
                    <button key={mood.id} className={`mood-emoji-btn ${selectedMood === mood.id ? 'mood-emoji-btn-active' : ''}`} onClick={() => setSelectedMood(mood.id)} style={{ '--mood-color': mood.color }} title={mood.label}>
                      <span className="mood-emoji-lg">{mood.emoji}</span><span className="mood-emoji-label">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {selectedMood && (
                <div className="mood-note-area">
                  <input type="text" className="form-input" placeholder="Add a note (optional)..." value={note} onChange={e => setNote(e.target.value)} />
                  <button className="btn btn-primary" onClick={logMood}>Log Mood {getMoodData(selectedMood).emoji}</button>
                </div>
              )}
              {last7.length > 1 && (
                <div className="mood-mini-chart">
                  <div className="mood-mini-chart-label"><TrendingUp size={14} /> Recent Trend</div>
                  <div className="mood-mini-chart-bar">
                    {last7.map(entry => { const mood = getMoodData(entry.moodId); const height = ((mood.level + 2) / 7) * 100; return (
                      <div key={entry.id} className="mood-bar-col" title={`${mood.label} — ${formatDay(entry.timestamp)}`}>
                        <div className="mood-bar" style={{ height: `${Math.max(height, 10)}%`, background: mood.color }} /><span className="mood-bar-emoji">{mood.emoji}</span>
                      </div>
                    ); })}
                  </div>
                </div>
              )}
            </>
          )}
          {view === 'history' && (
            <>
              {days.length === 0 ? (
                <div className="mood-empty"><span className="mood-empty-emoji">📝</span><p>No mood entries yet</p><span>Switch to the Log tab to record your first mood.</span></div>
              ) : days.map(day => (
                <div key={day} className="mood-day-group">
                  <h4 className="mood-day-label"><Calendar size={14} /> {formatDay(day)}</h4>
                  {groupedByDay[day].map(entry => { const mood = getMoodData(entry.moodId); return (
                    <div key={entry.id} className="mood-history-item">
                      <span className="mood-history-emoji">{mood.emoji}</span>
                      <div className="mood-history-info"><span className="mood-history-label" style={{ color: mood.color }}>{mood.label}</span>{entry.note && <span className="mood-history-note">{entry.note}</span>}</div>
                      <span className="mood-history-time">{new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                  ); })}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
