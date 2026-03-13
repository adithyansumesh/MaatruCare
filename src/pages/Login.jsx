import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/onboarding', { state: { name } });
  };

  return (
    <div className="page-centered">
      <div className="auth-card">
        {/* Brand Side */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Heart size={36} />
          </div>
          <h1>MaatruCare</h1>
          <p>Your trusted AI companion through every step of your pregnancy journey.</p>
        </div>

        {/* Form Side */}
        <div className="auth-form">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue your journey</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                id="login-name"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email or Phone</label>
              <input
                id="login-email"
                type="text"
                className="form-input"
                placeholder="Enter your email or phone"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>
            <button id="login-submit" type="submit" className="btn btn-primary w-full mt-2">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
