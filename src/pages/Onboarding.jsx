import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.name || 'Mother';
  const [weeks, setWeeks] = useState('');
  const [conditions, setConditions] = useState('');

  const handleComplete = (e) => {
    e.preventDefault();
    navigate('/dashboard', { state: { name: userName, weeks, conditions } });
  };

  return (
    <div className="page-centered">
      <div className="auth-card">
        {/* Brand Side */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <ClipboardList size={36} />
          </div>
          <h1>Health Profile</h1>
          <p>Tell us a bit about your pregnancy so we can personalize your experience.</p>
        </div>

        {/* Form Side */}
        <div className="auth-form">
          <h2>Hi, {userName}!</h2>
          <p className="auth-subtitle">Let's set up your health profile</p>

          <form onSubmit={handleComplete}>
            <div className="form-group">
              <label className="form-label">Pregnancy Stage (Weeks)</label>
              <input
                id="onboarding-weeks"
                type="number"
                className="form-input"
                placeholder="e.g. 14"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                min="1"
                max="42"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Any existing health conditions?</label>
              <input
                id="onboarding-conditions"
                type="text"
                className="form-input"
                placeholder="e.g. Gestational Diabetes (optional)"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
              />
            </div>
            <button id="onboarding-submit" type="submit" className="btn btn-primary w-full mt-2">
              Continue to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
