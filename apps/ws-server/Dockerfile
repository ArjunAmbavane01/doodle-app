FROM node:23-alpine AS base
WORKDIR /app

COPY ../../pnpm-lock.yaml ../../package.json ../../turbo.json ./

COPY ../../apps/ws-server ./apps/ws-server
COPY ../../packages ./packages

RUN pnpm install --frozen-lockfile

FROM base AS build
RUN pnpm turbo run build --filter=ws-server...

FROM node:23-alpine AS runner
WORKDIR /app

COPY --from=build /app/apps/ws-server/dist ./dist
COPY --from=build /app/apps/ws-server/package.json ./
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]