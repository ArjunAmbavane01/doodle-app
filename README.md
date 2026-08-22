# Doodle

Doodle is a real-time collaborative drawing application. It provides a visual workspace for users to create diagrams and sketches together in real-time.

## Features

- Custom HTML Canvas-based drawing engine
- Real-time collaboration via WebSockets
- User authentication and session management
- Dynamic AI-driven SVG generation

## Tech stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, WebSockets (ws)
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: NextAuth (Google OAuth, JWT)
- **Monorepo**: Turborepo, pnpm

## Getting started

### Prerequisites

- Node.js (>= 20)
- pnpm (>= 9)
- PostgreSQL
- Docker (optional, for containerized deployment)

### 1. Clone the repository

```bash
git clone https://github.com/arjunbhavan-dev/doodle-app.git
cd doodle-app
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment variables

Review the `.env.example` file in the root directory. You will need to configure the required environment variables in their respective locations:

- `apps/http-server/.env`: Requires `PORT`, `DATABASE_URL`, `JWT_SECRET`, and `OPENAI_API_KEY`.
- `apps/ws-server/.env`: Requires `PORT`, `DATABASE_URL`, `JWT_SECRET`, and `WS_JWT_SECRET`.
- `packages/db/.env`: Requires `DATABASE_URL`.
- `apps/web/.env.local`: Requires NextAuth and Google OAuth credentials, and backend API URLs.

### 4. Database setup

Initialize the Prisma client and push the schema to your database to create the necessary tables.

```bash
cd packages/db
npx prisma db push
pnpm run generate
cd ../..
```

### 5. Run the development server

Start all applications and packages concurrently from the root directory:

```bash
pnpm run dev
```

- Web application: http://localhost:3000
- HTTP Server: http://localhost:8000
- WebSocket Server: ws://localhost:8080

### Docker Deployment

The applications contain their own Dockerfiles and can be run via Docker. Note that you must pass the necessary environment variables to the containers.

```bash
# Build and run the web app
cd apps/web
docker build -t doodle-web .
docker run -p 3000:3000 --env-file .env.local doodle-web

# Build and run the HTTP server
cd apps/http-server
docker build -t doodle-http-server .
docker run -p 8000:8000 --env-file .env doodle-http-server

# Build and run the WebSocket server
cd apps/ws-server
docker build -t doodle-ws-server .
docker run -p 8080:8080 --env-file .env doodle-ws-server
```

## Project structure

The repository is a monorepo managed with Turborepo and pnpm workspaces.

- `apps/web`: Next.js frontend application.
- `apps/http-server`: Express REST API for application state and AI operations.
- `apps/ws-server`: WebSocket server handling real-time drawing synchronization.
- `packages/db`: Shared Prisma database schema and client.
- `packages/ui`: Shared React components built with shadcn/ui.
- `packages/common`: Shared types and utilities.
- `packages/backend-common`: Shared backend configurations.

## License

MIT