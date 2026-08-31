# CaddyComfort Frontend

A Vite + React + TypeScript single-page application.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result. The dev server proxies `/api/*` to `BACKEND_INTERNAL_URL` (defaults to `http://localhost:5000`).

## Environment Variables

Copy `.env` and adjust as needed:

- `VITE_API_URL` — base URL the browser uses for API calls (e.g. `/api` behind the nginx proxy, or a full backend URL in local dev).
- `VITE_APP_URL` — the public URL of this app.

## Scripts

- `npm run dev` — start the Vite dev server.
- `npm run build` — type-check and build a production bundle to `dist/`.
- `npm run preview` — preview the production build locally.
- `npm run lint` — run ESLint.

## Production

The Docker build produces a static bundle served by nginx, which also proxies `/api/*` to the backend container (see `Dockerfile` and `nginx.conf.template`).
