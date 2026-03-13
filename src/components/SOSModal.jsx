import { useState, useEffect } from 'react';
import { X, AlertTriangle, Phone, MessageCircle, Settings, Plus, Trash2, PhoneCall } from 'lucide-react';

const DEFAULT_CONTACTS = [
  { id: '1', name: 'Emergency 1', phone: '+919495714600' },
  { id: '2', name: 'Emergency 2', phone: '+916238106246' },
  { id: '3', name: 'Emergency 3', phone: '+917736658045' },
  { id: '4', name: 'Emergency 4', phone: '+918281400764' },
];

function loadContacts() {
  try {
    const saved = localStorage.getItem('maatrucare_sos_contacts');
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_CONTACTS;
}

function saveContacts(contacts) {
  localStorage.setItem('maatrucare_sos_contacts', JSON.stringify(contacts));
}

export default function SOSModal({ userProfile, onClose }) {
  const [contacts, setContacts] = useState(loadContacts);
  const [phase, setPhase] = useState('ready');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => { saveContacts(contacts); }, [contacts]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const emergencyMessage = `🚨 EMERGENCY ALERT — MaatruCare\n\nThis is an automated emergency message from ${userProfile?.name || 'a MaatruCare user'}.\n\nPregnancy Week: ${userProfile?.weeks || 'Not specified'}\nConditions: ${userProfile?.conditions || 'None reported'}\n\nPlease call or reach out immediately. This person may need urgent assistance.\n\n— Sent via MaatruCare Emergency System`;

  const callContact = (phone) => {
    const cleaned = phone.replace(/\s+/g, '');
    window.open(`tel:${cleaned}`, '_self');
  };

  const handleConfirmSOS = async () => {
    setPhase('sending');

    // Call primary contact
    if (contacts.length > 0) {
      callContact(contacts[0].phone);
    }

    // Send WhatsApp messages
    await new Promise(res => setTimeout(res, 1500));
    const encoded = encodeURIComponent(emergencyMessage);
    for (const contact of contacts) {
      const cleaned = contact.phone.replace(/[^0-9+]/g, '');
      const num = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;
      window.open(`https://wa.me/${num}?text=${encoded}`, '_blank');
      await new Promise(res => setTimeout(res, 800));
    }

    setPhase('sent');
  };

  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    setContacts(prev => [...prev, { id: Date.now().toString(), name: newName.trim(), phone: newPhone.trim() }]);
    setNewName('');
    setNewPhone('');
  };

  const removeContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="chat-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sos-modal">
        {/* Header */}
        <div className="sos-header">
          <div className="sos-header-title">
            <AlertTriangle size={20} />
            <h3>SOS Emergency</h3>
          </div>
          <button className="chat-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="sos-content">
          {/* READY */}
          {phase === 'ready' && (
            <>
              <div className="sos-contacts-section">
                <div className="sos-contacts-header">
                  <span className="sos-contacts-title">Emergency Contacts</span>
                  <button className="sos-manage-btn" onClick={() => setPhase('manage')}>
                    <Settings size={14} /> Manage
                  </button>
                </div>
                {contacts.length > 0 ? contacts.map((c, i) => (
                  <div key={c.id} className="sos-contact-row">
                    <div className="sos-contact-row-left">
                      <span className="sos-contact-name">{c.name}</span>
                      {i === 0 && <span className="sos-primary-badge">Primary</span>}
                      <span className="sos-contact-phone">{c.phone}</span>
                    </div>
                    <div className="sos-contact-row-right">
                      <button className="sos-call-inline-btn" onClick={() => callContact(c.phone)} title="Call">
                        <Phone size={14} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="sos-no-contacts">No contacts added. Tap Manage to add.</div>
                )}
              </div>

              <div className="sos-trigger-area">
                <button className="sos-big-btn" onClick={() => setPhase('confirm')} disabled={contacts.length === 0}>
                  <AlertTriangle size={36} />
                  <span>SOS</span>
                </button>
                <p className="sos-trigger-hint">Tap to send emergency alerts</p>
              </div>
            </>
          )}

          {/* CONFIRM */}
          {phase === 'confirm' && (
            <div className="sos-confirm">
              <div className="sos-confirm-icon">
                <AlertTriangle size={36} color="#d00000" />
              </div>
              <h3>Send Emergency Alert?</h3>
              <p>This will:</p>
              <div className="sos-confirm-steps">
                <div className="sos-confirm-step">
                  <PhoneCall size={16} /> Call {contacts[0]?.name || 'primary contact'}
                </div>
                <div className="sos-confirm-step">
                  <MessageCircle size={16} /> WhatsApp all {contacts.length} contacts
                </div>
              </div>
              <div className="sos-confirm-actions">
                <button className="btn btn-secondary" onClick={() => setPhase('ready')}>Cancel</button>
                <button className="btn btn-danger" onClick={handleConfirmSOS}>Confirm SOS</button>
              </div>
            </div>
          )}

          {/* SENDING */}
          {phase === 'sending' && (
            <div className="sos-sending">
              <div className="sos-spinner" />
              <h3>Sending Alerts...</h3>
              <p>Calling {contacts[0]?.name} and opening WhatsApp messages</p>
            </div>
          )}

          {/* SENT */}
          {phase === 'sent' && (
            <div className="sos-sent">
              <div className="sos-sent-icon">✓</div>
              <h3>Alerts Sent!</h3>
              <p>Emergency call initiated and WhatsApp messages opened.</p>
              <div className="sos-sent-actions">
                {contacts.slice(1).map(c => (
                  <button key={c.id} className="sos-call-btn" onClick={() => callContact(c.phone)}>
                    <Phone size={14} /> Call {c.name}
                  </button>
                ))}
              </div>
              <button className="btn btn-secondary" onClick={() => setPhase('ready')} style={{ marginTop: '1rem' }}>Done</button>
            </div>
          )}

          {/* MANAGE */}
          {phase === 'manage' && (
            <div className="sos-manage">
              <h3>Manage Contacts</h3>
              <p className="sos-manage-hint">First contact is the primary (gets the call).</p>

              <div className="sos-manage-form">
                <input className="form-input" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} />
                <input className="form-input" placeholder="Phone (+91...)" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                <button className="btn btn-primary" onClick={addContact} disabled={!newName.trim() || !newPhone.trim()}>
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="sos-manage-list">
                {contacts.map((c, i) => (
                  <div key={c.id} className="sos-contact-manage-row">
                    <div className="sos-contact-manage-name-row">
                      <span className="sos-contact-name">{c.name}</span>
                      {i === 0 && <span className="sos-primary-badge">Primary</span>}
                    </div>
                    <span className="sos-contact-phone">{c.phone}</span>
                    <button className="sos-delete-btn" onClick={() => removeContact(c.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button className="btn btn-secondary w-full" onClick={() => setPhase('ready')} style={{ marginTop: '1rem' }}>← Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
