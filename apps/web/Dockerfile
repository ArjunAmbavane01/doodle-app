FROM node:23-alpine AS base
WORKDIR /app

COPY ../../pnpm-lock.yaml ../../package.json ../../turbo.json ./

COPY ../../apps/web ./apps/web
COPY ../../packages ./packages

RUN pnpm install --frozen-lockfile

FROM base AS build
RUN pnpm turbo run build --filter=web...

FROM node:23-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/apps/web/next.config.js ./
COPY --from=build /app/apps/web/package.json ./
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/node_modules ./node_modules

RUN mkdir -p ./.next/cache && chmod 1777 ./.next/cache

EXPOSE 3000
CMD ["pnpm", "start"]