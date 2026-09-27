# syntax=docker/dockerfile:1.7
# Image for Yandex Cloud Serverless Containers (or Compute Cloud).
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID
ARG NEXT_PUBLIC_TELEGRAM_URL
ARG GIT_COMMIT_SHA=dev
ENV NEXT_TELEMETRY_DISABLED=1 CONTENT_VERSION=${GIT_COMMIT_SHA}
RUN pnpm content:validate && pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOSTNAME=0.0.0.0
ARG GIT_COMMIT_SHA=dev
ENV CONTENT_VERSION=${GIT_COMMIT_SHA}
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app
EXPOSE 8080
CMD ["node", "server.js"]
