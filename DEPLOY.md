# Deployment Guide

This guide covers deploying Innogram with Docker Compose for development and staging. For production, use the same images with your orchestrator (Kubernetes, ECS, etc.) and external managed databases.

## Prerequisites

- Docker 24+ and Docker Compose v2
- A filled `.env` file (copy from `.env.example`)
- RS256 private key for JWT (`AUTH_JWT_ACCESS_TOKEN_PRIVATE_KEY`)

## 1. Configure environment

```bash
cp .env.example .env
```

Required secrets and values are documented in [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md). At minimum set:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`
- `AUTH_JWT_ACCESS_TOKEN_PRIVATE_KEY`, `AUTH_JWT_ACCESS_TOKEN_KEY_ID`
- `AUTH_JWT_REFRESH_TOKEN_SECRET`
- `AUTH_GOOGLE_CLIENT_ID`, `AUTH_GOOGLE_CLIENT_SECRET`, `AUTH_GOOGLE_REDIRECT_URI`
- `AUTH_ALLOWED_OAUTH_REDIRECT_ORIGINS`

For Docker networking, the compose file overrides hostnames (`postgres`, `redis`, `kafka`, `minio`) automatically.

## 2. Build and start

```bash
docker compose up --build -d
```

Services and ports (defaults):

| Service       | Port        | Health                            |
| ------------- | ----------- | --------------------------------- |
| client        | 3000        | —                                 |
| gateway       | 3004        | —                                 |
| core          | 3001        | Swagger at `/api/docs`            |
| auth          | 3002        | `/health`, Swagger at `/api/docs` |
| notifications | 3005        | Swagger at `/api/docs`            |
| postgres      | 5433        | `pg_isready`                      |
| redis         | 6379        | `redis-cli ping`                  |
| minio         | 9000 / 9001 | API / console                     |
| kafka         | 9092        | topic list                        |

## 3. Run migrations

Core runs migrations automatically when `RUN_MIGRATIONS=true` (default in compose). To run manually:

```bash
docker compose exec core node apps/core/dist/docker-start.js
# Or locally:
npm --prefix apps/core run migration:run
```

## 4. Verify deployment

```bash
curl http://localhost:3002/health
curl http://localhost:3001/monitoring/metrics
curl http://localhost:3004/auth/validate -H 'Authorization: Bearer <token>'
```

Open the client at http://localhost:3000.

## 5. Monitoring and error tracking

### Application metrics

- JSON snapshot: `GET /monitoring/metrics` on core
- Prometheus scrape: `GET /monitoring/prometheus` on core

Configure Prometheus:

```yaml
scrape_configs:
  - job_name: innogram-core
    static_configs:
      - targets: ['core:3001']
    metrics_path: /monitoring/prometheus
```

### Sentry (optional)

Set in `.env`:

```env
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_TRACES_SAMPLE_RATE=0.1
APP_VERSION=1.0.0
```

Sentry is initialized in `core` and `auth` when `SENTRY_DSN` is present.

## 6. Production recommendations

1. **Secrets** — use a secrets manager; never commit `.env` files.
2. **TLS** — terminate HTTPS at a reverse proxy (nginx, Traefik, ALB).
3. **Databases** — use managed PostgreSQL and Redis in production.
4. **Kafka** — use a managed cluster or dedicated Kafka operators.
5. **Object storage** — point MinIO vars to S3-compatible storage.
6. **Scaling** — scale `core` and `auth` horizontally; keep Kafka consumer groups in mind for notifications.
7. **Logs** — ship JSON logs to your aggregator (core and auth emit structured logs).

## 7. Partial stacks

Start only infrastructure:

```bash
docker compose up -d postgres redis minio kafka
```

Start a single service:

```bash
docker compose up --build core
```

## Troubleshooting

| Issue                             | Fix                                                      |
| --------------------------------- | -------------------------------------------------------- |
| Core fails to connect to Postgres | Wait for `postgres` healthcheck; check `POSTGRES_*` vars |
| Auth JWT errors                   | Ensure private key uses `\n` for newlines in `.env`      |
| Kafka connection refused          | Wait ~30s for Kafka `start_period` healthcheck           |
| Client can't reach API            | Rebuild client with correct `NEXT_PUBLIC_*` build args   |
