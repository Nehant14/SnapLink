import { useEffect, useState } from 'react';
import { fetchLinkStats } from '../lib/analytics';
import { ApiError } from '../lib/api';
import '../App.css';

function formatDay(dateStr) {
  // dateStr is 'YYYY-MM-DD' from the analytics-service timeline bucket.
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function LinkStats({ shortCode, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetchLinkStats(shortCode)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load stats.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [shortCode]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const maxTimelineCount = stats?.timeline?.length
    ? Math.max(...stats.timeline.map((t) => t.count))
    : 0;

  const topReferrers = stats?.referrers
    ? [...stats.referrers].sort((a, b) => b.count - a.count).slice(0, 5)
    : [];

  return (
    <div className="stats-modal__overlay" role="presentation" onClick={onClose}>
      <div
        className="stats-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Stats for ${shortCode}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="stats-modal__header">
          <h2 className="stats-modal__title">Stats for /{shortCode}</h2>
          <button className="stats-modal__close" onClick={onClose} aria-label="Close stats">
            &times;
          </button>
        </div>

        {loading ? (
          <div className="stats-modal__skeleton">
            <div className="stats-modal__skeleton-line" style={{ width: '40%' }} />
            <div className="stats-modal__skeleton-line" style={{ width: '90%' }} />
            <div className="stats-modal__skeleton-line" style={{ width: '70%' }} />
          </div>
        ) : error ? (
          <p className="form-error" role="alert">{error}</p>
        ) : (
          <>
            <div className="stats-modal__total">
              <span className="stats-modal__total-count">{stats.totalClicks}</span>
              <span className="stats-modal__total-label">
                {stats.totalClicks === 1 ? 'total click' : 'total clicks'}
              </span>
            </div>

            <section className="stats-modal__section">
              <h3 className="stats-modal__section-title">Clicks over time</h3>
              {stats.timeline?.length ? (
                <div className="stats-timeline">
                  {stats.timeline
                    .slice()
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((point) => (
                      <div className="stats-timeline__bar-wrap" key={point.date}>
                        <div
                          className="stats-timeline__bar"
                          style={{
                            height: `${maxTimelineCount ? (point.count / maxTimelineCount) * 100 : 0}%`,
                          }}
                          title={`${point.count} click${point.count === 1 ? '' : 's'} on ${point.date}`}
                        />
                        <span className="stats-timeline__label">{formatDay(point.date)}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="stats-modal__empty">No clicks yet.</p>
              )}
            </section>

            <section className="stats-modal__section">
              <h3 className="stats-modal__section-title">Top referrers</h3>
              {topReferrers.length ? (
                <table className="stats-referrer-table">
                  <tbody>
                    {topReferrers.map((r) => (
                      <tr key={r.host}>
                        <td className="stats-referrer-table__host">{r.host}</td>
                        <td className="stats-referrer-table__count">{r.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="stats-modal__empty">No referrer data yet.</p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
