# syntax=docker/dockerfile:1.6

# ----- Dependencies -------------------------------------------------------
FROM node:20.11.1-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ----- Build (Next.js standalone) ----------------------------------------
FROM node:20.11.1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Baked into the client bundle at build time. Keep it a same-origin path so the
# browser talks to this container and Next rewrites the call to the API
# container over the internal network.
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_APP_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Next evaluates rewrites() during `next build` and freezes the destination
# into routes-manifest.json, so this has to be a build arg — setting it at
# runtime has no effect.
ARG BACKEND_INTERNAL_URL=http://backend:5000
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ----- Runtime ------------------------------------------------------------
FROM node:20.11.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
