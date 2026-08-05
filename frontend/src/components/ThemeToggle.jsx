// A track-and-thumb toggle, styled after the light/dark palette itself.
// The thumb carries a sun in light mode and morphs into a moon (with a
// couple of stars fading in beside it) once dark mode is active.
export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : ''}`}
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle__star theme-toggle__star--a" />
      <span className="theme-toggle__star theme-toggle__star--b" />
      <span className="theme-toggle__thumb">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <circle
            className="theme-toggle__sun-core"
            cx="12"
            cy="12"
            r="5.2"
            fill="currentColor"
          />
          <g className="theme-toggle__rays" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <line x1="12" y1="1.5" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22.5" />
            <line x1="1.5" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22.5" y2="12" />
            <line x1="4.2" y1="4.2" x2="6" y2="6" />
            <line x1="18" y1="18" x2="19.8" y2="19.8" />
            <line x1="4.2" y1="19.8" x2="6" y2="18" />
            <line x1="18" y1="6" x2="19.8" y2="4.2" />
          </g>
        </svg>
      </span>
    </button>
  );
}