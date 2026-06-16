# Innogram

Social platform monorepo with microservices, API gateway, and Next.js client.

## Architecture

| Service              | Stack                        | Default port | Description                                       |
| -------------------- | ---------------------------- | ------------ | ------------------------------------------------- |
| `apps/client_app`    | Next.js 15                   | 3000         | Web UI                                            |
| `apps/api-gateway`   | NestJS proxy                 | 3004         | Routes `/auth/*` to auth, everything else to core |
| `apps/core`          | NestJS + TypeORM + Socket.IO | 3001         | Posts, users, comments, assets, chats             |
| `apps/auth`          | Express + Redis + Kafka      | 3002         | Registration, login, OAuth, JWT                   |
| `apps/notifications` | NestJS + Kafka + TypeORM     | 3005         | Mention notifications consumer                    |
| `packages/shared`    | NestJS module                | —            | Shared auth guard and env loader                  |

Infrastructure: PostgreSQL, Redis, MinIO, Kafka.

## Quick start (local)

```bash
cp .env.example .env
# Fill in required values — see docs/ENVIRONMENT.md

npm install
npm run build:shared

# Start infrastructure
docker compose up -d postgres redis minio kafka

# Start all backend services
npm run start:all

# In another terminal — client
npm --prefix apps/client_app run dev
```

## API documentation (Swagger)

| Service           | URL                            |
| ----------------- | ------------------------------ |
| Core API          | http://localhost:3001/api/docs |
| Auth API          | http://localhost:3002/api/docs |
| Notifications API | http://localhost:3005/api/docs |

## Docker (full stack)

```bash
cp .env.example .env
# Configure secrets — see DEPLOY.md

docker compose up --build
```

## Monitoring

- Performance snapshot: `GET http://localhost:3001/monitoring/metrics`
- Prometheus metrics: `GET http://localhost:3001/monitoring/prometheus`
- UI dashboard: http://localhost:3000/monitoring

Optional error tracking: set `SENTRY_DSN` in `.env` (see docs/ENVIRONMENT.md).

## Documentation

- [Environment variables](docs/ENVIRONMENT.md)
- [Deployment guide](DEPLOY.md)
- Per-service READMEs in `apps/*/README.md`

## Scripts

```bash
npm run build          # Build all workspaces (Turbo)
npm run lint           # Lint all workspaces
npm run start:all      # Dev: gateway + auth + core
npm run start:all:prod # Prod: all services + client
```
