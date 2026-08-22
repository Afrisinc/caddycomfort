# Docker Deployment

Two containers. Only the frontend is published on the host and only the
frontend joins the shared `afrisinc_net`; the API sits alone on a private
network where nothing else — not the host, not the internet, not the sibling
services on the VPS — can reach it.

```
internet ──▶ :443 host reverse proxy ──▶ 127.0.0.1:5001  caddycomfort-frontend
                                                  │            │
                        afrisinc_net (shared) ────┘            │ caddycomfort_internal
                        siblings reach the frontend            │ (private to this stack)
                        but NOT the API                        ▼
                                                     caddycomfort-backend
                                                     no host port, not on afrisinc_net
```

Follows the same conventions as `homextech`: `container_name`, `init: true`,
`env_file: .env`, `TZ=UTC`, json-file log rotation, memory/cpu limits, image
healthchecks, and loopback-only port publishing.

`FRONTEND_PORT` must not collide with another service on the box — `homextech`
already holds `5000`, so this defaults to `5001`.

## How the browser reaches an unpublished API

`NEXT_PUBLIC_API_URL` is baked as `/api`, so the browser calls the frontend on
its own origin. `next.config.ts` rewrites `/api/*` to `http://caddycomfort-backend:5000/api/*`
over the docker network.

Two consequences worth remembering:

- **`BACKEND_INTERNAL_URL` is a build arg, not a runtime env.** Next evaluates
  `rewrites()` during `next build` and freezes the destination into
  `routes-manifest.json`. Setting it only at runtime silently does nothing —
  the proxy keeps pointing at `localhost:5000` and every `/api` call 500s.
  Its value must match the API's `container_name`, since that is what docker
  DNS resolves. Rename the container and you must rebuild the frontend image.
- **`SERVE_FRONTEND=false` on the backend.** `backend/src/server.ts` boots an
  embedded Next.js server when `NODE_ENV=production`, which is right for the
  single-container Render deploy but wrong here — there is no sibling
  `frontend/` directory in the API image. The backend Dockerfile sets this.

## Supabase must go through the pooler

`db.<ref>.supabase.co` is **IPv6-only**. Docker containers have no IPv6 by
default, so a direct-host connection string fails with
`P1001: Can't reach database server` even though the credentials are perfect.
Use the Supavisor pooler, which has IPv4 records:

```
postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

Two things bite here:

- the username is `postgres.<ref>`, not plain `postgres`
- the region must be right, or the pooler answers
  `FATAL: (ENOTFOUND) tenant/user postgres.<ref> not found` — the same error
  you get for a project that no longer exists

To find the region when the dashboard is not handy, probe the poolers:

```bash
for H in aws-0-eu-west-1 aws-0-eu-west-2 aws-0-eu-central-1 aws-0-us-east-1; do
  PGPASSWORD=<password> psql -h $H.pooler.supabase.com -p 5432 \
    -U postgres.<ref> -d postgres -tAc 'select 1' 2>&1 | tail -1
done
```

Port 5432 on the pooler is session mode, which `prisma migrate deploy` needs.
Port 6543 is transaction mode and would also require `?pgbouncer=true`.

## First deploy on the VPS

Same layout as the other services: `docker-compose.yml` and `.env` live on the
box under `$VPS_APP_PATH/<service>/<env>` and are **not** copied by CI. The
workflow only pushes images and restarts.

```bash
mkdir -p "$VPS_APP_PATH/caddycomfort/production"
cd "$VPS_APP_PATH/caddycomfort/production"
# copy docker-compose.yml and .env.example from the repo
cp .env.example .env
$EDITOR .env          # real DATABASE_URL, JWT secrets, PUBLIC_APP_URL, CORS_ORIGIN, Cloudinary

# afrisinc_net is declared external — compose will NOT create it
docker network inspect afrisinc_net >/dev/null 2>&1 || docker network create afrisinc_net

export GHCR_OWNER=afrisinc         # only needed for manual runs
docker compose --profile migrate run --rm migrate   # prisma migrate deploy
docker compose up -d
```

Then point the host reverse proxy at `127.0.0.1:5001`.

### Verifying the isolation

`caddycomfort-backend` must show a bare `5000/tcp` with no host binding, and
must not appear on the shared network:

```bash
docker compose ps
docker inspect caddycomfort-backend --format '{{json .NetworkSettings.Ports}}'
#   -> {"5000/tcp":null}

docker network inspect afrisinc_net --format '{{range .Containers}}{{.Name}} {{end}}'
#   -> caddycomfort-frontend      (the API must NOT be listed)

curl -s http://127.0.0.1:5001/api/health   # proxied through the frontend
```

Nothing here relies on a host firewall: the API has no `ports:` mapping, and
because it is absent from `afrisinc_net` its container name does not even
resolve for sibling services.

## CI/CD

`.github/workflows/deploy.yml` follows the same shape as the other services
(`content-service`, `afrisinc-web`): build → push to GHCR under two tags
(`<short-sha>` and `main`) → SSH in, `docker compose pull`, `up -d`,
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
| `VPS_APP_PATH` | Base path; the app sits at `<path>/caddycomfort/production` |
| `PUBLIC_APP_URL` | Public site origin, baked into the frontend build |

Departures from `content-service`, all deliberate:

- **Two images** instead of one, since the frontend and API are separate
  containers.
- **A network guard** — `afrisinc_net` is external, so compose aborts with
  `network afrisinc_net declared as external, but could not be found` rather
  than creating it. The script creates it if absent.
- **A migrate step** before `up -d`, so prisma migrations land before the new
  code serves traffic.
- **A health gate** after `up -d`. The job polls `/api/health` through the
  published frontend port for up to two minutes; on failure it dumps
  `docker compose ps` plus the last 120 log lines and exits non-zero, so a
  broken rollout shows up as a red build instead of a green one.

The deploy exports `IMAGE_TAG` pinned to the short SHA, so a rollback is
`IMAGE_TAG=<older-sha> docker compose up -d` from the app directory.

## Local

```bash
cp .env.example .env
docker compose up --build
```

`http://localhost:5001`. The backend stays unreachable from the host by design;
to inspect it use `docker compose exec caddycomfort-backend sh`.
