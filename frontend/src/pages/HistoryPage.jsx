import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SnapMark from '../components/SnapMark';
import { getHistory } from '../lib/history';
import '../App.css';

export default function HistoryPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

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

        {items.length === 0 ? (
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
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="site-footer">
        <p>History is stored locally in this browser only.</p>
      </footer>
    </div>
  );
}
