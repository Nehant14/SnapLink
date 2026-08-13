import { useState } from 'react';

export default function ShortenForm({ onSubmit, loading, fieldErrors, onFocusInput, allowCustomExpiry = false }) {
  const [longUrl, setLongUrl] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      longUrl: longUrl.trim(),
      customAlias: customAlias.trim() || undefined,
      // datetime-local has no timezone info; treat it as local time and
      // convert to the ISO string the backend's zod schema expects.
      // Only ever sent when signed in — anonymous submissions never include
      // this, since the backend forces a 48h expiry for them regardless.
      expiresAt: allowCustomExpiry && expiresAt ? new Date(expiresAt).toISOString() : undefined,
    });
  }

  return (
    <form className="shorten-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="longUrl" className="field__label">
          Long URL
        </label>
        <input
          id="longUrl"
          type="text"
          inputMode="url"
          placeholder="https://example.com/a/very/long/path?that=needs&shortening=true"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          onFocus={onFocusInput}
          required
          className="field__input field__input--main"
          autoComplete="off"
          spellCheck="false"
        />
        {fieldErrors.longUrl && <p className="field__error">{fieldErrors.longUrl}</p>}
      </div>

      <button
        type="button"
        className="options-toggle"
        onClick={() => setShowOptions((v) => !v)}
        aria-expanded={showOptions}
      >
        {showOptions ? 'Hide options' : allowCustomExpiry ? 'Customize alias or expiry' : 'Customize alias'}
      </button>

      {showOptions && (
        <div className="options-grid">
          <div className="field">
            <label htmlFor="customAlias" className="field__label">
              Custom alias <span className="field__hint">optional · 3–20 letters, numbers, or hyphens</span>
            </label>
            <input
              id="customAlias"
              type="text"
              placeholder="my-launch"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="field__input"
              minLength={3}
              maxLength={20}
              autoComplete="off"
              spellCheck="false"
            />
            {fieldErrors.customAlias && <p className="field__error">{fieldErrors.customAlias}</p>}
          </div>

          {allowCustomExpiry ? (
            <div className="field">
              <label htmlFor="expiresAt" className="field__label">
                Expires at <span className="field__hint">optional · leave blank to keep forever</span>
              </label>
              <input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="field__input"
              />
              {fieldErrors.expiresAt && <p className="field__error">{fieldErrors.expiresAt}</p>}
            </div>
          ) : (
            <div className="field">
              <span className="field__label">Expires at</span>
              <p className="field__hint field__hint--block">
                Links made without an account expire after 48 hours. Sign up to set a custom expiry or keep links forever.
              </p>
            </div>
          )}
        </div>
      )}

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Snapping…' : 'Snap it'}
      </button>
    </form>
  );
}