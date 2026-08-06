import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ShortenForm from '../components/ShortenForm';
import ResultCard from '../components/ResultCard';
import QrPanel from '../components/QrPanel';
import SnapMark from '../components/SnapMark';
import ThemeToggle from '../components/ThemeToggle';
import { createShortUrl, ApiError } from '../lib/api';
import { addHistoryEntry } from '../lib/history';
import '../App.css';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('snaplink-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Maps the zod validation `detail` array (when present) from the backend
// onto the specific form fields, so errors land next to the input that
// caused them instead of as one generic banner.
function mapFieldErrors(detail) {
  const fieldErrors = {};
  if (!Array.isArray(detail)) return fieldErrors;
  for (const issue of detail) {
    const key = issue.path?.[0];
    if (key) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export default function HomePage() {
  const [result, setResult] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [theme, setTheme] = useState(getInitialTheme);
  const cardRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('snaplink-theme', theme);
  }, [theme]);

  // While mid-edit (user clicked back into the input after a link was
  // already generated), clicking anywhere outside the card reverts back
  // to the compact + QR view without discarding the existing result.
  useEffect(() => {
    if (!editing) return undefined;

    function handlePointerDown(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setEditing(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [editing]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  function handleInputFocus() {
    if (result) setEditing(true);
  }

  async function handleSubmit({ longUrl, customAlias, expiresAt }) {
    setLoading(true);
    setFormError('');
    setFieldErrors({});

    try {
      const { shortUrl } = await createShortUrl({ longUrl, customAlias, expiresAt });
      const entry = { shortUrl, longUrl };
      setResult(entry);
      setEditing(false);
      addHistoryEntry(entry);
    } catch (err) {
      if (err instanceof ApiError) {
        const mapped = mapFieldErrors(err.detail);
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped);
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError('Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const showCompact = Boolean(result) && !editing;

  return (
    <div className="page">
      <header className="site-header">
        <div className="wordmark">
          <SnapMark size={34} />
          <span>SnapLink</span>
        </div>
        <ThemeToggle isDark={theme === 'dark'} onToggle={toggleTheme} />
      </header>

      <main className="hero">
        <h1 className="hero__title hero__title--in">
          Paste a long one.
          <br />
          Get back something worth sharing.
        </h1>
        <p className="hero__subtitle hero__subtitle--in">
          No account, no dashboard — just a short link that works.
        </p>

        <div className={`reveal-row ${showCompact ? 'reveal-row--compact' : ''}`}>
          <QrPanel value={result?.shortUrl} visible={showCompact} />

          <div className={`card card--in ${showCompact ? 'card--compact' : ''}`} ref={cardRef}>
            <ShortenForm
              onSubmit={handleSubmit}
              loading={loading}
              fieldErrors={fieldErrors}
              onFocusInput={handleInputFocus}
            />
            {formError && <p className="form-error" role="alert">{formError}</p>}

            <Link to="/history" className="history-button" aria-label="View link history">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 7v5l3.5 2M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"
                />
              </svg>
              <span>History</span>
            </Link>
          </div>
        </div>

        {result && <ResultCard shortUrl={result.shortUrl} longUrl={result.longUrl} />}
      </main>

      <footer className="site-footer">
        <p>Short links may expire if you set an expiry date. Limited to 100 requests every 15 minutes per IP.</p>
      </footer>
    </div>
  );
}