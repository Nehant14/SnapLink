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

export async function createShortUrl({ longUrl, customAlias, expiresAt }) {
  const payload = { longUrl };
  if (customAlias) payload.customAlias = customAlias;
  if (expiresAt) payload.expiresAt = expiresAt;

  let res;
  try {
    res = await fetch('/api/v1/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
