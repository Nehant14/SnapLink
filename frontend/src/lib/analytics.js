// Thin wrapper around the one endpoint analytics-service exposes:
//   GET /api/v1/analytics/:shortCode/stats
//
// Deliberately separate from lib/api.js (which talks to the main backend)
// since this hits a different service/origin entirely.

import { ApiError } from './api';

const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || '';

export async function fetchLinkStats(shortCode) {
    const endpoint = `${ANALYTICS_API_URL}/api/v1/analytics/${encodeURIComponent(shortCode)}/stats`;

    let res;
    try {
        // credentials: 'include' — auth here is the same httpOnly JWT
        // cookie the main backend issues, sent straight to analytics-service.
        res = await fetch(endpoint, { credentials: 'include' });
    } catch {
        throw new ApiError("Can't reach the analytics service. Is it running?");
    }

    let body = null;
    try {
        body = await res.json();
    } catch {
        // no JSON body
    }

    if (!res.ok) {
        throw new ApiError(body?.message || 'Could not load stats for this link.', { status: res.status });
    }

    return body; // { shortCode, totalClicks, referrers, timeline, lastClickAt }
}
