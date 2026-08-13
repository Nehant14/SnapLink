// Thin wrapper around the two endpoints the SnapLink backend actually exposes:
//   POST /api/v1/shorten   -> { shortUrl }
//   GET  /:shortCode       -> 302 redirect (opened directly in the browser, not fetched here)

export class ApiError extends Error {
  constructor(message, { status, detail } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function createShortUrl({ longUrl, customAlias, expiresAt }) {
  const payload = { longUrl };
  if (customAlias) payload.customAlias = customAlias;
  if (expiresAt) payload.expiresAt = expiresAt;

  const endpoint = `${API_BASE_URL}/api/v1/shorten`;

  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // sends the auth cookie (if logged in) and/or the anon-session cookie
      // so the backend can decide ownership + the right expiry rule.
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiError(
      "Can't reach the SnapLink server. Is the backend running?"
    );
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body — fall through, res.ok check below handles it
  }

  if (!res.ok) {
    const message = body?.message || 'Something went wrong while shortening that link.';
    throw new ApiError(message, { status: res.status, detail: body?.detail });
  }

  return body; // { shortUrl }
}

// GET /api/v1/history — server decides what to return based on the
// cookies sent: the logged-in user's account history, or the current
// anonymous session's history, or an empty list if neither.
export async function fetchHistory() {
  const endpoint = `${API_BASE_URL}/api/v1/history`;

  let res;
  try {
    res = await fetch(endpoint, { credentials: 'include' });
  } catch {
    throw new ApiError("Can't reach the SnapLink server. Is the backend running?");
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    throw new ApiError(body?.message || 'Could not load history.', { status: res.status });
  }

  return body?.items || [];
}
