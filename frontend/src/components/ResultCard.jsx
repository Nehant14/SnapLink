import { useState } from 'react';
import SnapMark from './SnapMark';

export default function ResultCard({ shortUrl, longUrl }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can fail without permission — the link is still
      // selectable/visible, so this is a quiet no-op rather than an error.
    }
  }

  return (
    <div className="result-card">
      <SnapMark closed size={28} />
      <div className="result-card__body">
        <p className="result-card__label">Snapped</p>
        <a
          className="result-card__link"
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {shortUrl.replace(/^https?:\/\//, '')}
        </a>
        <p className="result-card__source" title={longUrl}>
          {longUrl}
        </p>
      </div>
      <button className="copy-button" onClick={handleCopy} type="button">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
