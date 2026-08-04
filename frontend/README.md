# SnapLink — frontend

A small, focused React + Vite frontend for the [SnapLink](https://github.com/Nehant14/SnapLink) URL shortener backend.

It only covers what the backend actually implements:

- **Shorten a URL** — `POST /api/v1/shorten` (long URL, plus optional custom alias and expiry date)
- **Visit a short link** — `GET /:shortCode` (handled by simply linking/redirecting to the short URL the backend returns)

There's no login, dashboard, click-analytics, or link-listing UI, because the backend doesn't expose any of that yet. The "this session" list under the result is purely client-side state (it resets on refresh) — a small nicety, not a stand-in for a real history endpoint.

## Running it

```bash
npm install
npm run dev
```

This starts the frontend on `http://localhost:5173`. In dev, Vite proxies any `/api/*` request to `http://localhost:5000` (the backend's default port), so there are no CORS issues locally — just make sure the SnapLink backend is running first.

If your backend runs on a different port, update the `target` in `vite.config.js`.

### Production note

The backend doesn't currently enable CORS (`app.use(cors())` isn't wired up in `app.js`), so if you deploy the frontend and backend on different origins, requests to `/api/v1/shorten` will be blocked by the browser. Either add CORS middleware on the backend, or serve this frontend from the same origin as the API (e.g. behind the same reverse proxy).

## Structure

```
src/
  App.jsx                 page layout + state
  components/
    ShortenForm.jsx        the form (long URL + optional alias/expiry)
    ResultCard.jsx          the freshly-created short link, with copy
    HistoryList.jsx         session-only list of previous links
    SnapMark.jsx             the clasp icon used as the header mark and
                            the "closed" state on a successful result
  lib/
    api.js                 fetch wrapper + error handling for /api/v1/shorten
```
