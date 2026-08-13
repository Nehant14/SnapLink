import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SnapMark from '../components/SnapMark';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import '../App.css';

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    try {
      await signup({ email: email.trim(), password, name: name.trim() || undefined });
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
          <h1 className="auth-card__title">Create an account</h1>
          <p className="auth-card__subtitle">
            Any links you've already made in this browser will be saved to your account and kept forever.
          </p>

          <form className="shorten-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name" className="field__label">
                Name <span className="field__hint">optional</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field__input field__input--main"
                autoComplete="name"
              />
            </div>

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
              <label htmlFor="password" className="field__label">
                Password <span className="field__hint">at least 8 characters</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="field__input field__input--main"
                autoComplete="new-password"
              />
            </div>

            {formError && <p className="form-error" role="alert">{formError}</p>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="auth-card__switch">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
