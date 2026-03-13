import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.name || 'User';

  const [weeks, setWeeks] = useState('');
  const [conditions, setConditions] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();
    navigate('/dashboard', {
      state: {
        name: userName,
        weeks: weeks || 'Not specified',
        conditions: conditions || 'None',
      },
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand-panel">
          <div className="auth-brand-icon"><Heart size={40} /></div>
          <h1>MaatruCare</h1>
          <p>Help us personalize your experience with a few details about your pregnancy.</p>
        </div>
        <div className="auth-form-panel">
          <h2>Tell Us About You</h2>
          <p className="auth-subtitle">This info helps our AI give better guidance</p>
          <form onSubmit={handleContinue}>
            <div className="form-group">
              <label className="form-label" htmlFor="onboard-weeks">Pregnancy Stage (weeks)</label>
              <input id="onboard-weeks" className="form-input" type="number" placeholder="e.g. 20" value={weeks} onChange={(e) => setWeeks(e.target.value)} min="1" max="42" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="onboard-conditions">Any Conditions or Notes</label>
              <input id="onboard-conditions" className="form-input" type="text" placeholder="e.g. Gestational diabetes, first pregnancy" value={conditions} onChange={(e) => setConditions(e.target.value)} />
            </div>
            <button id="onboard-submit" className="btn btn-primary w-full" type="submit">Continue to Dashboard</button>
          </form>
        </div>
      </div>
    </div>
  );
}
