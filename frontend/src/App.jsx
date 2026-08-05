import { useEffect, useState } from 'react';
import ShortenForm from './components/ShortenForm';
import ResultCard from './components/ResultCard';
import HistoryList from './components/HistoryList';
import SnapMark from './components/SnapMark';
import ThemeToggle from './components/ThemeToggle';
import { createShortUrl, ApiError } from './lib/api';
import './App.css';

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

export default function App() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('snaplink-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  async function handleSubmit({ longUrl, customAlias, expiresAt }) {
    setLoading(true);
    setFormError('');
    setFieldErrors({});
    setResult(null);

    try {
      const { shortUrl } = await createShortUrl({ longUrl, customAlias, expiresAt });
      const entry = { shortUrl, longUrl };
      setResult(entry);
      setHistory((prev) => [entry, ...prev.filter((h) => h.shortUrl !== shortUrl)].slice(0, 6));
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

        <div className="card card--in">
          <ShortenForm onSubmit={handleSubmit} loading={loading} fieldErrors={fieldErrors} />
          {formError && <p className="form-error" role="alert">{formError}</p>}
        </div>

        {result && <ResultCard shortUrl={result.shortUrl} longUrl={result.longUrl} />}

        <HistoryList items={history} />
      </main>

      <footer className="site-footer">
        <p>Short links may expire if you set an expiry date. Limited to 100 requests every 15 minutes per IP.</p>
      </footer>
    </div>
  );
}