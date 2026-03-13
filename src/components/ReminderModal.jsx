import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Trash2, Bell, BellRing, Clock, Calendar, Pill, Droplet, Dumbbell } from 'lucide-react';

const STORAGE_KEY = 'maatrucare_reminders';

const CATEGORIES = [
  { id: 'medicine', label: 'Medicine', icon: <Pill size={16} />, color: '#f72585' },
  { id: 'hydration', label: 'Hydration', icon: <Droplet size={16} />, color: '#00b4d8' },
  { id: 'exercise', label: 'Exercise', icon: <Dumbbell size={16} />, color: '#38b000' },
  { id: 'appointment', label: 'Appointment', icon: <Calendar size={16} />, color: '#8338ec' },
  { id: 'other', label: 'Other', icon: <Bell size={16} />, color: '#fca311' },
];

function loadReminders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function saveReminders(reminders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = d.toDateString() === now.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (isToday) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${time}`;
}

// Generate an alarm sound using Web Audio API
function playAlarmSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Play a pleasant chime pattern
    const playTone = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    // Chime pattern: C5 E5 G5, repeated twice
    const notes = [523, 659, 784, 523, 659, 784];
    notes.forEach((freq, i) => {
      playTone(freq, now + i * 0.2, 0.3);
    });

    // Also try browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      // Notification handled by caller
    }
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

export default function ReminderModal({ onClose }) {
  const [reminders, setReminders] = useState(loadReminders);
  const [showForm, setShowForm] = useState(false);
  const [ringingReminder, setRingingReminder] = useState(null);

  // Form state
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('medicine');
  const [dateTime, setDateTime] = useState('');
  const [repeat, setRepeat] = useState('none');

  const intervalRef = useRef(null);

  // Save reminders to localStorage
  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check for due reminders every 10 seconds
  const checkReminders = useCallback(() => {
    const now = Date.now();
    setReminders(prev => {
      let updated = false;
      const newReminders = prev.map(r => {
        if (!r.triggered && new Date(r.dateTime).getTime() <= now) {
          updated = true;
          // Trigger alarm
          playAlarmSound();
          setRingingReminder(r);

          // Send browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('MaatruCare Reminder', {
              body: `${r.label} — ${getCategoryLabel(r.category)}`,
              icon: '/favicon.svg',
              tag: r.id
            });
          }

          // Handle repeat
          if (r.repeat !== 'none') {
            const next = new Date(r.dateTime);
            if (r.repeat === 'daily') next.setDate(next.getDate() + 1);
            if (r.repeat === 'hourly') next.setHours(next.getHours() + 1);
            if (r.repeat === 'weekly') next.setDate(next.getDate() + 7);
            return { ...r, dateTime: next.toISOString(), triggered: false };
          }
          return { ...r, triggered: true };
        }
        return r;
      });
      if (updated) return newReminders;
      return prev;
    });
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(checkReminders, 10000);
    checkReminders(); // Check immediately
    return () => clearInterval(intervalRef.current);
  }, [checkReminders]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  function getCategoryLabel(catId) {
    return CATEGORIES.find(c => c.id === catId)?.label || 'Other';
  }
  function getCategoryColor(catId) {
    return CATEGORIES.find(c => c.id === catId)?.color || '#fca311';
  }
  function getCategoryIcon(catId) {
    return CATEGORIES.find(c => c.id === catId)?.icon || <Bell size={16} />;
  }

  const addReminder = () => {
    if (!label.trim() || !dateTime) return;
    const reminder = {
      id: Date.now().toString(),
      label: label.trim(),
      category,
      dateTime: new Date(dateTime).toISOString(),
      repeat,
      triggered: false
    };
    setReminders(prev => [...prev, reminder].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)));
    setLabel('');
    setDateTime('');
    setRepeat('none');
    setShowForm(false);
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const dismissAlarm = () => {
    setRingingReminder(null);
  };

  // Split reminders into upcoming and past
  const now = new Date();
  const upcoming = reminders.filter(r => !r.triggered && new Date(r.dateTime) > now);
  const past = reminders.filter(r => r.triggered);

  // Default datetime = next hour
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  return (
    <div className="chat-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="reminder-modal">
        {/* Ringing Overlay */}
        {ringingReminder && (
          <div className="reminder-ring-overlay">
            <div className="reminder-ring-card">
              <div className="reminder-ring-icon">
                <BellRing size={40} />
              </div>
              <h2>{ringingReminder.label}</h2>
              <p>{getCategoryLabel(ringingReminder.category)}</p>
              <button className="btn btn-primary" onClick={dismissAlarm}>
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="reminder-header">
          <div className="reminder-header-title">
            <Bell size={20} />
            <h3>Reminders</h3>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="reminder-content">

          {/* Add Button */}
          {!showForm && (
            <button
              className="reminder-add-trigger"
              onClick={() => { setShowForm(true); if (!dateTime) setDateTime(getDefaultDateTime()); }}
            >
              <Plus size={18} />
              Add New Reminder
            </button>
          )}

          {/* Add Form */}
          {showForm && (
            <div className="reminder-form">
              <div className="form-group">
                <label className="form-label">What to remind?</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Take Folic Acid, Drink Water"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <div className="reminder-categories">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      className={`reminder-cat-btn ${category === cat.id ? 'reminder-cat-btn-active' : ''}`}
                      style={{
                        '--cat-color': cat.color,
                        '--cat-bg': cat.color + '15',
                      }}
                      onClick={() => setCategory(cat.id)}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={dateTime}
                  onChange={e => setDateTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Repeat</label>
                <div className="reminder-repeat-options">
                  {[
                    { value: 'none', label: 'Once' },
                    { value: 'hourly', label: 'Hourly' },
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      className={`reminder-repeat-btn ${repeat === opt.value ? 'reminder-repeat-btn-active' : ''}`}
                      onClick={() => setRepeat(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reminder-form-actions">
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={addReminder} disabled={!label.trim() || !dateTime}>
                  <Bell size={16} />
                  Set Reminder
                </button>
              </div>
            </div>
          )}

          {/* Upcoming Reminders */}
          {upcoming.length > 0 && (
            <div className="reminder-section">
              <h4 className="reminder-section-title">
                <Clock size={16} />
                Upcoming
              </h4>
              {upcoming.map(r => (
                <div key={r.id} className="reminder-item">
                  <div className="reminder-item-icon" style={{ color: getCategoryColor(r.category), background: getCategoryColor(r.category) + '15' }}>
                    {getCategoryIcon(r.category)}
                  </div>
                  <div className="reminder-item-info">
                    <span className="reminder-item-label">{r.label}</span>
                    <span className="reminder-item-time">{formatDate(r.dateTime)}{r.repeat !== 'none' ? ` · ${r.repeat}` : ''}</span>
                  </div>
                  <button className="sos-delete-btn" onClick={() => deleteReminder(r.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Past Reminders */}
          {past.length > 0 && (
            <div className="reminder-section">
              <h4 className="reminder-section-title" style={{ color: 'var(--text-muted)' }}>
                Completed
              </h4>
              {past.map(r => (
                <div key={r.id} className="reminder-item reminder-item-past">
                  <div className="reminder-item-icon" style={{ color: 'var(--text-muted)', background: 'var(--bg-color)' }}>
                    {getCategoryIcon(r.category)}
                  </div>
                  <div className="reminder-item-info">
                    <span className="reminder-item-label" style={{ textDecoration: 'line-through', opacity: 0.6 }}>{r.label}</span>
                    <span className="reminder-item-time">{formatDate(r.dateTime)}</span>
                  </div>
                  <button className="sos-delete-btn" onClick={() => deleteReminder(r.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {reminders.length === 0 && !showForm && (
            <div className="reminder-empty">
              <Bell size={36} />
              <p>No reminders yet</p>
              <span>Add reminders for medicine, hydration, exercise, or appointments.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
