// The page's signature element: two open hooks that snap shut into a single
// link whenever a URL is successfully shortened. Quiet by default, only
// moves at the one moment that matters.
export default function SnapMark({ closed = false, size = 40 }) {
  return (
    <svg
      className={`snap-mark ${closed ? 'snap-mark--closed' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="snap-mark__hook snap-mark__hook--left"
        d="M16 12c-4.4 0-8 3.6-8 8s3.6 8 8 8"
        stroke="var(--snap-500)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        className="snap-mark__hook snap-mark__hook--right"
        d="M24 12c4.4 0 8 3.6 8 8s-3.6 8-8 8"
        stroke="var(--link-500)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
