import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SnapMark from '../components/SnapMark';
import { fetchHistory, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function formatExpiry(expiresAt) {
  if (!expiresAt) return 'Never expires';
  const date = new Date(expiresAt);
  const isPast = date.getTime() < Date.now();
  const formatted = date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return isPast ? `Expired ${formatted}` : `Expires ${formatted}`;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Wait for the auth check to settle first — fetchHistory works either
    // way (server branches on cookies), but this avoids a flash of the
    // wrong empty/loading state while /me is still resolving.
    if (authLoading) return;

    let cancelled = false;
    setLoading(true);

    fetchHistory()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load history.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading]);

  return (
    <div className="page">
      <header className="site-header">
        <div className="wordmark">
          <SnapMark size={34} />
          <span>SnapLink</span>
        </div>
      </header>

      <main className="history-page">
        <Link to="/" className="history-page__back">
          &larr; Back
        </Link>
        <h1 className="history-page__title">Link history</h1>

        {loading || authLoading ? (
          <p className="history-page__empty">Loading…</p>
        ) : error ? (
          <p className="form-error" role="alert">{error}</p>
        ) : items.length === 0 ? (
          <p className="history-page__empty">No links yet — shorten one to see it here.</p>
        ) : (
          <ul className="history-page__list">
            {items.map((item) => (
              <li key={item.shortUrl} className="history-page__row">
                <span className="history-page__original" title={item.longUrl}>
                  {item.longUrl}
                </span>
                <span className="history-page__arrow" aria-hidden="true">
                  &rarr;
                </span>
                <a
                  className="history-page__short"
                  href={item.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.shortUrl.replace(/^https?:\/\//, '')}
                </a>
                <span className="history-page__expiry">{formatExpiry(item.expiresAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="site-footer">
        <p>
          {user
            ? 'This is your account history — visible from any device you sign into.'
            : "This history is tied to this browser only, and only covers links from the last 48 hours. Sign up to keep it, and your links, permanently."}
        </p>
      </footer>
    </div>
  );
}
