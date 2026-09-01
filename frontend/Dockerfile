# syntax=docker/dockerfile:1.6

# ----- Dependencies -------------------------------------------------------
FROM node:20.11.1-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ----- Build (static Vite bundle) -----------------------------------------
FROM node:20.11.1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Baked into the client bundle at build time. Keep it a same-origin path so
# the browser talks to this container, which nginx proxies to the API
# container over the internal network.
ARG VITE_API_URL=/api
ARG VITE_APP_URL=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_URL=$VITE_APP_URL

RUN npm run build

# nginx.conf is generated here so BACKEND_INTERNAL_URL is frozen into the
# proxy_pass target at build time, matching how the API's container_name
# used to be baked into Next's rewrites().
ARG BACKEND_INTERNAL_URL=http://caddycomfort-backend:5000
RUN apk add --no-cache gettext \
  && BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL envsubst '${BACKEND_INTERNAL_URL}' < nginx.conf.template > nginx.conf

# ----- Runtime ------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
