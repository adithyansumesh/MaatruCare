import { useState, useEffect } from 'react';
import { X, AlertTriangle, Phone, Send, UserPlus, Trash2, ShieldAlert, CheckCircle, MessageCircle } from 'lucide-react';

const DEFAULT_CONTACTS = [
  { id: '1', name: 'Emergency Contact 1', phone: '+919495714600' },
  { id: '2', name: 'Emergency Contact 2', phone: '+916238106246' },
  { id: '3', name: 'Emergency Contact 3', phone: '+917736658045' },
  { id: '4', name: 'Emergency Contact 4', phone: '+918281400764' },
];

const STORAGE_KEY = 'maatrucare_sos_contacts';

function loadContacts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_CONTACTS;
}

function saveContacts(contacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

export default function SOSModal({ userProfile, onClose }) {
  const [contacts, setContacts] = useState(loadContacts);
  const [phase, setPhase] = useState('ready'); // 'ready' | 'confirm' | 'sending' | 'sent' | 'manage'
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    saveContacts(contacts);
  }, [contacts]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && phase !== 'sending') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, phase]);

  const emergencyMessage = `🚨 SOS EMERGENCY ALERT 🚨\n\nThis is an emergency alert from ${userProfile.name || 'a MaatruCare user'}.\n\nPregnancy Week: ${userProfile.weeks || 'Unknown'}\n${userProfile.conditions ? `Health Conditions: ${userProfile.conditions}\n` : ''}\nI need immediate help. Please contact me or send help right away.\n\n— Sent via MaatruCare Emergency System`;

  // Initiate a phone call to a contact
  const callContact = (phone) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    window.open(`tel:${cleanPhone}`, '_self');
  };

  const handleSOS = () => {
    if (contacts.length === 0) {
      setPhase('manage');
      return;
    }
    setPhase('confirm');
  };

  const handleConfirmSOS = async () => {
    setPhase('sending');
    setSentCount(0);

    // 1. Immediately initiate a call to the first contact
    if (contacts.length > 0) {
      callContact(contacts[0].phone);
    }

    // 2. Open WhatsApp messages for ALL contacts
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const phone = contact.phone.replace(/[^0-9+]/g, '');
      const encodedMsg = encodeURIComponent(emergencyMessage);
      const url = `https://wa.me/${phone.replace('+', '')}?text=${encodedMsg}`;

      window.open(url, `_sos_${i}`);
      setSentCount(i + 1);

      // Small delay between opens to prevent popup blocking
      if (i < contacts.length - 1) {
        await new Promise(r => setTimeout(r, 600));
      }
    }

    setPhase('sent');
  };

  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const contact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim()
    };
    setContacts(prev => [...prev, contact]);
    setNewName('');
    setNewPhone('');
  };

  const removeContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="chat-overlay" onClick={(e) => { if (e.target === e.currentTarget && phase !== 'sending') onClose(); }}>
      <div className="sos-modal">
        {/* Header */}
        <div className="sos-header">
          <div className="sos-header-title">
            <ShieldAlert size={20} />
            <h3>Emergency SOS</h3>
          </div>
          <button className="chat-close-btn" onClick={onClose} disabled={phase === 'sending'}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="sos-content">

          {/* READY — Show big SOS button */}
          {phase === 'ready' && (
            <div className="sos-ready">
              <p className="sos-info">
                Press SOS to <strong>call your first contact</strong> and send WhatsApp alerts to all {contacts.length} contacts simultaneously.
              </p>

              <button className="sos-big-btn" onClick={handleSOS}>
                <AlertTriangle size={40} />
                <span>SOS</span>
              </button>

              <div className="sos-contacts-preview">
                <div className="sos-contacts-header">
                  <span className="sos-contacts-label">Emergency Contacts</span>
                  <button className="sos-manage-btn" onClick={() => setPhase('manage')}>
                    Manage
                  </button>
                </div>
                {contacts.map((c, i) => (
                  <div key={c.id} className="sos-contact-row">
                    <div className="sos-contact-row-left">
                      {i === 0 && <span className="sos-primary-badge">Primary</span>}
                      <span className="sos-contact-name">{c.name}</span>
                    </div>
                    <div className="sos-contact-row-right">
                      <span className="sos-contact-phone">{c.phone}</span>
                      <button
                        className="sos-call-inline-btn"
                        onClick={(e) => { e.stopPropagation(); callContact(c.phone); }}
                        title={`Call ${c.name}`}
                      >
                        <Phone size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <p className="sos-no-contacts">No contacts added. Tap "Manage" to add contacts.</p>
                )}
              </div>
            </div>
          )}

          {/* CONFIRM — Are you sure? */}
          {phase === 'confirm' && (
            <div className="sos-confirm">
              <div className="sos-confirm-icon">
                <AlertTriangle size={48} />
              </div>
              <h2>Confirm Emergency Alert</h2>
              <p>This will do the following:</p>

              <div className="sos-confirm-steps">
                <div className="sos-confirm-step">
                  <Phone size={18} />
                  <span><strong>Call</strong> {contacts[0]?.name || 'primary contact'}</span>
                </div>
                <div className="sos-confirm-step">
                  <MessageCircle size={18} />
                  <span><strong>WhatsApp</strong> all {contacts.length} contacts</span>
                </div>
              </div>

              <p className="sos-confirm-warning">Only use this in a real emergency.</p>

              <div className="sos-confirm-actions">
                <button className="btn btn-secondary" onClick={() => setPhase('ready')}>
                  Cancel
                </button>
                <button className="sos-confirm-btn" onClick={handleConfirmSOS}>
                  <Send size={18} />
                  Confirm SOS
                </button>
              </div>
            </div>
          )}

          {/* SENDING — Progress */}
          {phase === 'sending' && (
            <div className="sos-sending">
              <div className="sos-sending-spinner" />
              <h2>Sending Alerts...</h2>
              <p>Calling {contacts[0]?.name} + messaging {sentCount} of {contacts.length} contacts</p>
            </div>
          )}

          {/* SENT — Success */}
          {phase === 'sent' && (
            <div className="sos-sent">
              <div className="sos-sent-icon">
                <CheckCircle size={56} />
              </div>
              <h2>Alerts Dispatched</h2>
              <p>A call has been initiated to <strong>{contacts[0]?.name}</strong> and WhatsApp messages have been opened for all {contacts.length} contacts.</p>

              <div className="sos-sent-actions">
                {contacts.slice(1).map(c => (
                  <button
                    key={c.id}
                    className="sos-call-btn"
                    onClick={() => callContact(c.phone)}
                  >
                    <Phone size={16} />
                    Call {c.name}
                  </button>
                ))}
              </div>

              <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '0.5rem' }}>
                Done
              </button>
            </div>
          )}

          {/* MANAGE — Add/Remove contacts */}
          {phase === 'manage' && (
            <div className="sos-manage">
              <h3>Manage Emergency Contacts</h3>
              <p className="sos-manage-hint">The first contact is your <strong>primary</strong> — they'll receive the call during SOS.</p>

              <div className="sos-add-form">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contact name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91XXXXXXXXXX"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                />
                <button className="btn btn-primary" onClick={addContact} disabled={!newName.trim() || !newPhone.trim()}>
                  <UserPlus size={16} />
                  Add
                </button>
              </div>

              <div className="sos-contact-list">
                {contacts.map((c, i) => (
                  <div key={c.id} className="sos-contact-manage-row">
                    <div className="sos-contact-manage-info">
                      <div className="sos-contact-manage-name-row">
                        {i === 0 && <span className="sos-primary-badge">Primary</span>}
                        <span className="sos-contact-name">{c.name}</span>
                      </div>
                      <span className="sos-contact-phone">{c.phone}</span>
                    </div>
                    <button className="sos-delete-btn" onClick={() => removeContact(c.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <p className="sos-no-contacts">No emergency contacts yet. Add one above.</p>
                )}
              </div>

              <button className="btn btn-primary w-full" onClick={() => setPhase('ready')} style={{ marginTop: '1rem' }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
