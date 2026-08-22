# Docker Deployment

Two containers on one private docker network. Only the frontend is published on
the VPS host; the API is reachable **only** from inside that network.

```
internet ──▶ :443 reverse proxy ──▶ 127.0.0.1:3000  frontend (Next.js)
                                            │
                                            │  http://backend:5000  (private network)
                                            ▼
                                       backend (Express API)  ← no host port
```

## How the browser reaches an unpublished API

`NEXT_PUBLIC_API_URL` is baked as `/api`, so the browser calls the frontend on
its own origin. `next.config.ts` rewrites `/api/*` to `http://backend:5000/api/*`
over the docker network.

Two consequences worth remembering:

- **`BACKEND_INTERNAL_URL` is a build arg, not a runtime env.** Next evaluates
  `rewrites()` during `next build` and freezes the destination into
  `routes-manifest.json`. Setting it only at runtime silently does nothing —
  the proxy keeps pointing at `localhost:5000` and every `/api` call 500s.
- **`SERVE_FRONTEND=false` on the backend.** `backend/src/server.ts` boots an
  embedded Next.js server when `NODE_ENV=production`, which is right for the
  single-container Render deploy but wrong here — there is no sibling
  `frontend/` directory in the API image. The backend Dockerfile sets this.

## First deploy on the VPS

Same layout as the other services: `docker-compose.yml` and `.env` live on the
box under `$VPS_APP_PATH/<service>/<env>` and are **not** copied by CI. The
workflow only pushes images and restarts.

```bash
mkdir -p "$VPS_APP_PATH/clementine-shop/production"
cd "$VPS_APP_PATH/clementine-shop/production"
# copy docker-compose.yml and .env.example from the repo
cp .env.example .env
$EDITOR .env          # real DATABASE_URL, JWT secrets, PUBLIC_APP_URL, Cloudinary

export GHCR_OWNER=<org>            # only needed for manual runs
docker compose --profile migrate run --rm migrate   # prisma migrate deploy
docker compose up -d
```

Check what is actually exposed — `backend` must show a bare `5000/tcp` with no
host binding:

```bash
docker compose ps
curl -s http://127.0.0.1:3000/api/health   # proxied through the frontend
```

### Exposure

`FRONTEND_BIND` defaults to `127.0.0.1`, which keeps the frontend on loopback
for a reverse proxy (Caddy/nginx/Traefik) to terminate TLS in front of. Set
`FRONTEND_BIND=0.0.0.0` only if you want it straight on the public interface.

Nothing in the compose file publishes the backend, so a host firewall is not
what is protecting it — the absence of a `ports:` mapping is.

## CI/CD

`.github/workflows/deploy.yml` follows the same shape as the other services
(`content-service`, `afrisinc-web`): build → push to GHCR under two tags
(`<short-sha>` and `production`) → SSH in, `docker compose pull`, `up -d`,
`docker image prune -af`.

Repository secrets — the same names the other services use:

| Secret | Purpose |
| --- | --- |
| `GHCR_OWNER` | Org name, e.g. `afrisinc` |
| `GHCR_TOKEN` | PAT used by CI to push |
| `DEPLOY_GHCR_USERNAME` | User the VPS logs in to GHCR as |
| `DEPLOY_GHCR_TOKEN` | PAT with `read:packages`, for the VPS to pull |
| `VPS_HOST` | VPS hostname or IP |
| `VPS_USER` | SSH user (must be in the `docker` group) |
| `VPS_SSH_KEY` | Private key for that user |
| `VPS_APP_PATH` | Base path; the app sits at `<path>/clementine-shop/production` |
| `PUBLIC_APP_URL` | Public site origin, baked into the frontend build |

Two images instead of one is the only real departure from `content-service`,
plus a `docker compose --profile migrate run --rm migrate` line before `up -d`
so prisma migrations land before the new code serves traffic.

The deploy exports `IMAGE_TAG` pinned to the short SHA, so a rollback is
`IMAGE_TAG=<older-sha> docker compose up -d` from the app directory.

## Local

```bash
cp .env.example .env
docker compose up --build
```

`http://localhost:3000`. The backend stays unreachable from the host by design;
to inspect it use `docker compose exec backend sh`.
