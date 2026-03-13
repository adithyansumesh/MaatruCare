import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Heart, MessageSquareHeart, Salad, Droplet, Activity,
  Smile, Bell, AlertTriangle, Calendar, Mic
} from 'lucide-react';
import AIModal from '../components/AIAssistantModal';
import SOSModal from '../components/SOSModal';
import VoiceInputModal from '../components/VoiceInputModal';
import ReminderModal from '../components/ReminderModal';
import MoodLogModal from '../components/MoodLogModal';
import AppointmentModal from '../components/AppointmentModal';
import AmbientBackground from '../components/AmbientBackground';

const features = [
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    desc: 'Get personalized pregnancy guidance from your AI companion',
    icon: <MessageSquareHeart size={22} />,
    color: '#ff758f',
    bg: 'rgba(255, 117, 143, 0.1)'
  },
  {
    id: 'diet-lifestyle',
    name: 'Diet & Lifestyle',
    desc: 'Safe food recommendations and healthy lifestyle tips',
    icon: <Salad size={22} />,
    color: '#38b000',
    bg: 'rgba(56, 176, 0, 0.1)'
  },
  {
    id: 'reminders',
    name: 'Reminders',
    desc: 'Medicine, hydration, and appointment reminders',
    icon: <Droplet size={22} />,
    color: '#00b4d8',
    bg: 'rgba(0, 180, 216, 0.1)'
  },
  {
    id: 'symptom-analysis',
    name: 'Symptoms',
    desc: 'AI-powered symptom analysis and guidance',
    icon: <Activity size={22} />,
    color: '#f72585',
    bg: 'rgba(247, 37, 133, 0.1)'
  },
  {
    id: 'mood-tracking',
    name: 'Mood Log',
    desc: 'Track your emotional well-being throughout pregnancy',
    icon: <Smile size={22} />,
    color: '#fca311',
    bg: 'rgba(252, 163, 17, 0.1)'
  },
  {
    id: 'emergency',
    name: 'SOS Alert',
    desc: 'Quick emergency contact alerts when you need help',
    icon: <Bell size={22} />,
    color: '#d00000',
    bg: 'rgba(208, 0, 0, 0.1)'
  },
  {
    id: 'risks',
    name: 'Risk Guide',
    desc: 'Awareness of risk factors and warning signs',
    icon: <AlertTriangle size={22} />,
    color: '#e85d04',
    bg: 'rgba(232, 93, 4, 0.1)'
  },
  {
    id: 'appointments',
    name: 'Appointments',
    desc: 'Manage your doctor appointments and check-ups',
    icon: <Calendar size={22} />,
    color: '#8338ec',
    bg: 'rgba(131, 56, 236, 0.1)'
  },
  {
    id: 'voice',
    name: 'Voice Input',
    desc: 'Speak to your assistant hands-free',
    icon: <Mic size={22} />,
    color: '#b089f0',
    bg: 'rgba(176, 137, 240, 0.1)'
  },
];

export default function Dashboard() {
  const [activeModal, setActiveModal] = useState(null);
  const location = useLocation();
  const userProfile = {
    name: location.state?.name || 'Mother',
    weeks: location.state?.weeks || '1',
    conditions: location.state?.conditions || ''
  };

  const initials = userProfile.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="dashboard-layout">
      {/* Ambient animated background */}
      <AmbientBackground />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Heart size={20} />
          </div>
          <h2>MaatruCare</h2>
        </div>

        <nav className="sidebar-nav">
          {features.map(f => (
            <button
              key={f.id}
              id={`sidebar-${f.id}`}
              className={`sidebar-item ${activeModal === f.id ? 'active' : ''}`}
              onClick={() => setActiveModal(f.id)}
            >
              <div
                className="sidebar-item-icon"
                style={{ color: f.color, background: f.bg }}
              >
                {f.icon}
              </div>
              {f.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-profile-info">
            <span className="sidebar-profile-name">{userProfile.name}</span>
            <span className="sidebar-profile-week">Week {userProfile.weeks}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Greeting */}
        <div className="dashboard-greeting">
          <div className="greeting-text">
            <h1>Hello, {userProfile.name}! 👋</h1>
            <p>How are you feeling today? Pick a feature to get started.</p>
          </div>
          <div className="greeting-badge">
            <Activity size={16} />
            Week {userProfile.weeks}
          </div>
        </div>

        {/* Feature Cards */}
        <p className="features-heading">Features</p>
        <div className="card-grid">
          {features.map(f => (
            <button
              key={f.id}
              id={`card-${f.id}`}
              className="feature-card"
              onClick={() => setActiveModal(f.id)}
            >
              <div
                className="feature-card-icon"
                style={{ color: f.color, background: f.bg }}
              >
                {f.icon}
              </div>
              <span className="feature-card-name">{f.name}</span>
              <span className="feature-card-desc">{f.desc}</span>
            </button>
          ))}
        </div>
      </main>

      {/* SOS Modal */}
      {activeModal === 'emergency' && (
        <SOSModal
          userProfile={userProfile}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Voice Input Modal */}
      {activeModal === 'voice' && (
        <VoiceInputModal
          userProfile={userProfile}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Reminder Modal */}
      {activeModal === 'reminders' && (
        <ReminderModal
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Mood Log Modal */}
      {activeModal === 'mood' && (
        <MoodLogModal
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Appointment Modal */}
      {activeModal === 'appointments' && (
        <AppointmentModal
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* AI Chat Modal (for remaining features) */}
      {activeModal && !['emergency','voice','reminders','mood','appointments'].includes(activeModal) && (
        <AIModal
          activeFeature={activeModal}
          userProfile={userProfile}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
