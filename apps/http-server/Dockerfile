FROM node:23-alpine AS base

WORKDIR /app

COPY ../../pnpm-lock.yaml ../../package.json ../../turbo.json ./
COPY ../../apps/http-server ./apps/http-server
COPY ../../packages ./packages

RUN pnpm install --frozen-lockfile

FROM deps AS build
RUN pnpm turbo run build --filter=http-server...

FROM base AS runner
WORKDIR /app

COPY --from=build /app/apps/http-server/dist ./dist
COPY --from=build /app/apps/http-server/package.json ./
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production
CMD ["node", "dist/index.js"] 
