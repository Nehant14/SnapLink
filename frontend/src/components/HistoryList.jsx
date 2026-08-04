export default function HistoryList({ items }) {
  if (items.length === 0) return null;

  return (
    <div className="history">
      <p className="history__label">This session</p>
      <ul className="history__list">
        {items.map((item) => (
          <li key={item.shortUrl} className="history__item">
            <a href={item.shortUrl} target="_blank" rel="noopener noreferrer">
              {item.shortUrl.replace(/^https?:\/\//, '')}
            </a>
            <span className="history__source" title={item.longUrl}>
              {item.longUrl}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
