const KEY = 'snaplink-history';

export function getHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry) {
  const current = getHistory();
  const next = [entry, ...current.filter((h) => h.shortUrl !== entry.shortUrl)].slice(0, 50);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can fail (private mode, quota, etc.) — history just won't
    // persist across reloads in that case, which is a quiet degradation.
  }
  return next;
}
