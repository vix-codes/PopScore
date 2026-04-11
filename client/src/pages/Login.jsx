import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      if (!data?.token || !data?.user) {
        setErr('Unexpected server response');
        return;
      }
      login(data.token, data.user);
      nav('/');
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page auth-page animate-in">
      <div className="auth-card card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Log in to drop popcorn ratings and save favorites.</p>
        {err && <div className="error-banner">{err}</div>}
        <form onSubmit={submit} className="auth-form">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary full" disabled={busy}>
            {busy ? 'Signing in...' : 'Log in'}
          </button>
        </form>
        <p className="auth-footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
      <style>{`
        .auth-page {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 3rem;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 2rem;
        }
        .auth-card:hover {
          transform: none;
        }
        .auth-title {
          margin: 0 0 0.35rem;
          font-family: var(--font-display);
          font-size: 1.75rem;
        }
        .auth-sub {
          margin: 0 0 1.25rem;
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .full {
          width: 100%;
          margin-top: 0.25rem;
        }
        .auth-footer {
          margin: 1.25rem 0 0;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .auth-footer a {
          color: var(--accent-2);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
