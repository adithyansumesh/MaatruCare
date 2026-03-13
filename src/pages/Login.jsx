import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (name.trim()) {
      navigate('/onboarding', { state: { name: name.trim() } });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand-panel">
          <div className="auth-brand-icon"><Heart size={40} /></div>
          <h1>MaatruCare</h1>
          <p>Your AI-powered companion for a safe and healthy pregnancy journey.</p>
        </div>
        <div className="auth-form-panel">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue your journey</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-name">Your Name</label>
              <input id="login-name" className="form-input" type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input id="login-email" className="form-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input id="login-password" className="form-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button id="login-submit" className="btn btn-primary w-full" type="submit">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
}
