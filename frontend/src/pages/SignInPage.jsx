import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SnapMark from '../components/SnapMark';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import '../App.css';

export default function SignInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    try {
      await login({ email: email.trim(), password });
      navigate('/');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="site-header">
        <Link to="/" className="wordmark">
          <SnapMark size={34} />
          <span>SnapLink</span>
        </Link>
      </header>

      <main className="auth-page">
        <div className="card card--in auth-card">
          <h1 className="auth-card__title">Sign in</h1>

          <form className="shorten-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email" className="field__label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="field__input field__input--main"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password" className="field__label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="field__input field__input--main"
                autoComplete="current-password"
              />
            </div>

            {formError && <p className="form-error" role="alert">{formError}</p>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-card__switch">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
