import React from 'react';
import { Button } from '../components/Button.jsx';
import { api } from '../services/api.js';

export function AuthScreen({ mode = 'login', setMode, onLoginSuccess }) {
  const isLogin = mode === 'login';

  const [name, setName]         = React.useState('');
  const [email, setEmail]       = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError]       = React.useState('');
  const [loading, setLoading]   = React.useState(false);

  // Clear fields and error when switching between login / signup
  React.useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await api.auth.login(email, password);
      } else {
        res = await api.auth.register(name, email, password);
      }
      // Pass user data up — App stores it and navigates
      onLoginSuccess(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <aside className="auth__hero">
        <svg className="auth__hero-art" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
            <radialGradient id="glow" cx="0.3" cy="0.4" r="0.7">
              <stop offset="0%"   stopColor="#3730E0" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3730E0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="1000" fill="url(#grid)" />
          <rect width="800" height="1000" fill="url(#glow)" />
          <g transform="translate(60 600)" opacity="0.9">
            <rect x="0"   y="0" width="200" height="120" rx="10" fill="#16181D" stroke="#22252B" />
            <rect x="220" y="0" width="200" height="120" rx="10" fill="#16181D" stroke="#22252B" />
            <rect x="440" y="0" width="200" height="120" rx="10" fill="#16181D" stroke="#22252B" />
            <rect x="14"  y="16" width="60"  height="8" rx="3" fill="#3730E0" />
            <rect x="14"  y="34" width="150" height="6" rx="3" fill="#E8E6DF" />
            <rect x="14"  y="48" width="120" height="6" rx="3" fill="#9A9994" />
            <rect x="14"  y="92" width="22"  height="22" rx="11" fill="#0EA5A8" />
            <rect x="234" y="16" width="60"  height="8" rx="3" fill="#B97309" />
            <rect x="234" y="34" width="140" height="6" rx="3" fill="#E8E6DF" />
            <rect x="234" y="48" width="100" height="6" rx="3" fill="#9A9994" />
            <rect x="234" y="92" width="22"  height="22" rx="11" fill="#D9488A" />
            <rect x="454" y="16" width="60"  height="8" rx="3" fill="#1F9D5C" />
            <rect x="454" y="34" width="130" height="6" rx="3" fill="#E8E6DF" />
            <rect x="454" y="48" width="160" height="6" rx="3" fill="#9A9994" />
            <rect x="454" y="92" width="22"  height="22" rx="11" fill="#7C3AED" />
          </g>
        </svg>

        <div className="auth__hero-brand">
          <span style={{
            width: 26, height: 26, borderRadius: 7, background: 'var(--primary)',
            display: 'inline-grid', placeItems: 'center', position: 'relative',
          }}>
            <span style={{
              position: 'absolute', inset: 7, border: '1.5px solid #fff',
              borderRadius: '50%', borderTopColor: 'transparent', borderRightColor: 'transparent',
            }} />
          </span>
          <span>Plot</span>
        </div>

        <div className="auth__hero-content">
          <h2>The project tool your team won't fight you over.</h2>
          <p>Plot tracks tasks, surfaces what's blocking, and stays out of the way. Ship work, not status updates.</p>
        </div>
      </aside>

      <div className="auth__form">
        <div className="auth__form-inner">
          <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="sub">
            {isLogin ? 'Sign in to continue to your workspace.' : 'Start tracking work in under a minute.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!isLogin && (
              <div className="field">
                <label className="field__label">Full name</label>
                <input
                  className="field__control"
                  placeholder="Aanya Mehta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="field">
              <label className="field__label">Email</label>
              <input
                className="field__control"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="field__label">
                <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Password</span>
                  {isLogin && (
                    <a style={{ color: 'var(--primary)', fontWeight: 500, textTransform: 'none', letterSpacing: 0, fontSize: 11, cursor: 'pointer' }}>
                      Forgot?
                    </a>
                  )}
                </span>
              </label>
              <input
                className="field__control"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 12px',
                background: 'var(--danger-soft)',
                border: '1px solid rgba(199,66,59,0.25)',
                borderRadius: 7,
                color: 'var(--danger)',
                fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <Button
              variant="primary"
              type="submit"
              style={{ width: '100%', height: 38, fontSize: 14, justifyContent: 'center', marginTop: 4 }}
            >
              {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
            </Button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-4)', fontSize: 12, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <Button variant="secondary" style={{ width: '100%', height: 38, justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 16 16">
                <path fill="#4285F4" d="M15.5 8.18c0-.5-.04-.99-.13-1.45H8v2.75h4.2c-.18.97-.73 1.79-1.55 2.34v1.94h2.5c1.46-1.35 2.31-3.34 2.31-5.58z" />
                <path fill="#34A853" d="M8 15.7c2.08 0 3.83-.69 5.1-1.87l-2.5-1.94c-.69.46-1.58.73-2.6.73-2 0-3.7-1.35-4.3-3.17H1.13v1.99A7.7 7.7 0 0 0 8 15.7z" />
                <path fill="#FBBC04" d="M3.7 9.45a4.6 4.6 0 0 1 0-2.93V4.53H1.13a7.7 7.7 0 0 0 0 6.93l2.57-2.01z" />
                <path fill="#EA4335" d="M8 3.6c1.13 0 2.15.39 2.95 1.15l2.21-2.21A7.7 7.7 0 0 0 8 .3 7.7 7.7 0 0 0 1.13 4.53l2.57 1.99C4.3 4.95 6 3.6 8 3.6z" />
              </svg>
              Continue with Google
            </Button>
          </form>

          <div className="auth__toggle">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <a onClick={() => setMode(isLogin ? 'signup' : 'login')}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
