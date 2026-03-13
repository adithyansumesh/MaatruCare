import { useState, useEffect } from 'react';
import { X, Clock, MapPin, Star, Calendar, Phone, CheckCircle, Search } from 'lucide-react';

const APPT_STORAGE_KEY = 'maatrucare_appointments';

const DOCTORS = [
  {
    id: 'd1',
    name: 'Dr. Priya Sharma',
    specialty: 'Obstetrician & Gynecologist',
    hospital: 'Apollo Cradle Hospital, Koramangala',
    city: 'Bangalore',
    rating: 4.8,
    experience: '18 yrs',
    fee: '₹800',
    phone: '+918012345678',
    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
    photo: '👩‍⚕️',
    available: ['Mon', 'Wed', 'Fri'],
  },
  {
    id: 'd2',
    name: 'Dr. Anita Desai',
    specialty: 'High-Risk Pregnancy Specialist',
    hospital: 'Fortis La Femme, Richmond Rd',
    city: 'Bangalore',
    rating: 4.9,
    experience: '22 yrs',
    fee: '₹1200',
    phone: '+918023456789',
    slots: ['10:00 AM', '11:00 AM', '12:00 PM', '03:00 PM', '04:00 PM'],
    photo: '👩‍⚕️',
    available: ['Mon', 'Tue', 'Thu', 'Sat'],
  },
  {
    id: 'd3',
    name: 'Dr. Rakesh Menon',
    specialty: 'Obstetrician & Gynecologist',
    hospital: 'Amrita Hospital, Kochi',
    city: 'Kochi',
    rating: 4.7,
    experience: '15 yrs',
    fee: '₹600',
    phone: '+914712345678',
    slots: ['09:30 AM', '10:30 AM', '11:30 AM', '02:30 PM', '03:30 PM'],
    photo: '👨‍⚕️',
    available: ['Tue', 'Wed', 'Fri', 'Sat'],
  },
  {
    id: 'd4',
    name: 'Dr. Lakshmi Nair',
    specialty: 'Maternal-Fetal Medicine',
    hospital: 'KIMS Health, Trivandrum',
    city: 'Trivandrum',
    rating: 4.6,
    experience: '12 yrs',
    fee: '₹700',
    phone: '+914712456789',
    slots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '05:00 PM'],
    photo: '👩‍⚕️',
    available: ['Mon', 'Wed', 'Thu', 'Sat'],
  },
  {
    id: 'd5',
    name: 'Dr. Meera Krishnan',
    specialty: 'Obstetrician & Gynecologist',
    hospital: 'Cloudnine Hospital, HSR Layout',
    city: 'Bangalore',
    rating: 4.8,
    experience: '16 yrs',
    fee: '₹900',
    phone: '+918034567890',
    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM', '05:00 PM'],
    photo: '👩‍⚕️',
    available: ['Mon', 'Tue', 'Wed', 'Fri'],
  },
  {
    id: 'd6',
    name: 'Dr. Suresh Reddy',
    specialty: 'Perinatologist',
    hospital: 'Rainbow Children\'s Hospital, Banjara Hills',
    city: 'Hyderabad',
    rating: 4.9,
    experience: '20 yrs',
    fee: '₹1000',
    phone: '+914012345678',
    slots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'],
    photo: '👨‍⚕️',
    available: ['Mon', 'Tue', 'Thu', 'Fri'],
  },
];

function loadAppointments() {
  try {
    const saved = localStorage.getItem(APPT_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function saveAppointments(appts) {
  localStorage.setItem(APPT_STORAGE_KEY, JSON.stringify(appts));
}

function getNextDate(dayName) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const dayIdx = days.indexOf(dayName);
  const todayIdx = today.getDay();
  let diff = dayIdx - todayIdx;
  if (diff <= 0) diff += 7;
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  return next;
}

export default function AppointmentModal({ onClose }) {
  const [appointments, setAppointments] = useState(loadAppointments);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booked, setBooked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('doctors'); // 'doctors' | 'myappts'

  useEffect(() => {
    saveAppointments(appointments);
  }, [appointments]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const filteredDoctors = DOCTORS.filter(d => {
    const term = searchTerm.toLowerCase();
    return d.name.toLowerCase().includes(term)
      || d.specialty.toLowerCase().includes(term)
      || d.hospital.toLowerCase().includes(term)
      || d.city.toLowerCase().includes(term);
  });

  const bookAppointment = () => {
    if (!selectedDoctor || !selectedDay || !selectedSlot) return;
    const date = getNextDate(selectedDay);
    const appt = {
      id: Date.now().toString(),
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      hospital: selectedDoctor.hospital,
      day: selectedDay,
      slot: selectedSlot,
      date: date.toISOString(),
      bookedAt: new Date().toISOString()
    };
    setAppointments(prev => [...prev, appt]);
    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      setSelectedDoctor(null);
      setSelectedDay(null);
      setSelectedSlot(null);
    }, 2000);
  };

  const cancelAppointment = (id) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="chat-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="appt-modal">
        {/* Header */}
        <div className="appt-header">
          <div className="appt-header-title">
            <Calendar size={20} />
            <h3>Appointments</h3>
          </div>
          <div className="mood-header-actions">
            <button
              className={`mood-tab ${view === 'doctors' ? 'mood-tab-active' : ''}`}
              onClick={() => setView('doctors')}
            >Find Doctor</button>
            <button
              className={`mood-tab ${view === 'myappts' ? 'mood-tab-active' : ''}`}
              onClick={() => setView('myappts')}
            >My Appointments</button>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="appt-content">

          {/* DOCTORS VIEW */}
          {view === 'doctors' && !selectedDoctor && (
            <>
              {/* Search */}
              <div className="appt-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search doctors, hospitals, city..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Doctor Cards */}
              {filteredDoctors.map(doc => (
                <div key={doc.id} className="appt-doctor-card" onClick={() => setSelectedDoctor(doc)}>
                  <div className="appt-doctor-photo">{doc.photo}</div>
                  <div className="appt-doctor-info">
                    <span className="appt-doctor-name">{doc.name}</span>
                    <span className="appt-doctor-spec">{doc.specialty}</span>
                    <span className="appt-doctor-hospital">
                      <MapPin size={12} /> {doc.hospital}
                    </span>
                    <div className="appt-doctor-meta">
                      <span className="appt-doctor-rating"><Star size={12} /> {doc.rating}</span>
                      <span>{doc.experience}</span>
                      <span className="appt-doctor-fee">{doc.fee}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* DOCTOR DETAIL + BOOKING */}
          {view === 'doctors' && selectedDoctor && !booked && (
            <div className="appt-booking">
              <button className="appt-back-btn" onClick={() => { setSelectedDoctor(null); setSelectedDay(null); setSelectedSlot(null); }}>
                ← Back to Doctors
              </button>

              <div className="appt-doctor-detail">
                <div className="appt-doctor-photo-lg">{selectedDoctor.photo}</div>
                <h3>{selectedDoctor.name}</h3>
                <p className="appt-doctor-spec">{selectedDoctor.specialty}</p>
                <p className="appt-doctor-hospital"><MapPin size={14} /> {selectedDoctor.hospital}</p>
                <div className="appt-doctor-meta">
                  <span className="appt-doctor-rating"><Star size={12} /> {selectedDoctor.rating}</span>
                  <span>{selectedDoctor.experience}</span>
                  <span className="appt-doctor-fee">{selectedDoctor.fee}</span>
                </div>
              </div>

              {/* Day Picker */}
              <div className="appt-section">
                <label className="form-label">Select Day</label>
                <div className="appt-day-picker">
                  {selectedDoctor.available.map(day => (
                    <button
                      key={day}
                      className={`appt-day-btn ${selectedDay === day ? 'appt-day-btn-active' : ''}`}
                      onClick={() => { setSelectedDay(day); setSelectedSlot(null); }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slot Picker */}
              {selectedDay && (
                <div className="appt-section">
                  <label className="form-label">Select Time</label>
                  <div className="appt-slot-picker">
                    {selectedDoctor.slots.map(slot => (
                      <button
                        key={slot}
                        className={`appt-slot-btn ${selectedSlot === slot ? 'appt-slot-btn-active' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <Clock size={12} />
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Button */}
              {selectedSlot && (
                <button className="btn btn-primary w-full" onClick={bookAppointment} style={{ marginTop: '0.5rem' }}>
                  <Calendar size={16} />
                  Book Appointment — {selectedDay}, {selectedSlot}
                </button>
              )}
            </div>
          )}

          {/* BOOKING SUCCESS */}
          {view === 'doctors' && booked && (
            <div className="appt-booked">
              <CheckCircle size={56} />
              <h2>Appointment Booked!</h2>
              <p>Your appointment has been confirmed.</p>
            </div>
          )}

          {/* MY APPOINTMENTS */}
          {view === 'myappts' && (
            <>
              {appointments.length === 0 ? (
                <div className="mood-empty">
                  <span className="mood-empty-emoji">📅</span>
                  <p>No appointments booked</p>
                  <span>Find a doctor and book your appointment.</span>
                </div>
              ) : (
                appointments.map(appt => (
                  <div key={appt.id} className="appt-my-card">
                    <div className="appt-my-info">
                      <span className="appt-my-doctor">{appt.doctorName}</span>
                      <span className="appt-my-spec">{appt.specialty}</span>
                      <span className="appt-my-hospital"><MapPin size={12} /> {appt.hospital}</span>
                      <span className="appt-my-time">
                        <Clock size={12} /> {appt.day}, {appt.slot}
                      </span>
                    </div>
                    <button className="sos-delete-btn" onClick={() => cancelAppointment(appt.id)} title="Cancel">
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
