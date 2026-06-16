# Environment Variables

Innogram loads configuration from the repository root `.env`, then optional `.env.{NODE_ENV}` (e.g. `.env.development`, `.env.production`), then service-local overrides.

Copy the template and fill in values:

```bash
cp .env.example .env
```

## Global

| Variable                    | Required | Default       | Description                            |
| --------------------------- | -------- | ------------- | -------------------------------------- |
| `NODE_ENV`                  | no       | `development` | `development`, `production`, or `test` |
| `APP_VERSION`               | no       | —             | Release tag sent to Sentry             |
| `SENTRY_DSN`                | no       | —             | Sentry DSN for error tracking          |
| `SENTRY_TRACES_SAMPLE_RATE` | no       | `0.1`         | Sentry performance sampling (0–1)      |

## API Gateway (`apps/api-gateway`)

| Variable           | Required | Default | Description           |
| ------------------ | -------- | ------- | --------------------- |
| `API_GATEWAY_PORT` | yes      | —       | HTTP listen port      |
| `AUTH_SERVICE_URL` | yes      | —       | Auth service base URL |
| `CORE_URL`         | yes      | —       | Core service base URL |

## Core (`apps/core`)

| Variable                       | Required | Default          | Description                       |
| ------------------------------ | -------- | ---------------- | --------------------------------- |
| `CORE_HTTP_PORT`               | no       | `3001`           | HTTP listen port                  |
| `SWAGGER_PATH`                 | no       | `api/docs`       | Swagger UI path                   |
| `AUTH_SERVICE_URL`             | yes      | —                | Auth JWKS URL base                |
| `POSTGRES_HOST`                | yes      | —                | PostgreSQL host                   |
| `POSTGRES_PORT`                | yes      | —                | PostgreSQL port                   |
| `POSTGRES_USER`                | yes      | —                | PostgreSQL user                   |
| `POSTGRES_PASSWORD`            | yes      | —                | PostgreSQL password               |
| `POSTGRES_DATABASE`            | yes      | —                | PostgreSQL database               |
| `CORE_REDIS_URL`               | no       | —                | Redis URL for caching             |
| `CORE_REDIS_KEY_PREFIX`        | no       | `innogram:core`  | Redis key prefix                  |
| `ASSET_URL_CACHE_TTL_SECONDS`  | no       | `10800`          | Presigned URL cache TTL           |
| `POSTS_FEED_CACHE_TTL_SECONDS` | no       | `30`             | Feed cache TTL                    |
| `SLOW_QUERY_THRESHOLD_MS`      | no       | `100`            | Slow query log threshold          |
| `KAFKA_BROKERS`                | yes      | —                | Comma-separated Kafka brokers     |
| `MENTION_EVENTS_TOPIC`         | no       | `mention.events` | Kafka topic for mentions          |
| `MINIO_ENDPOINT`               | yes      | —                | MinIO / S3 endpoint host          |
| `MINIO_PORT`                   | yes      | —                | MinIO port                        |
| `MINIO_ACCESS_KEY`             | yes      | —                | MinIO access key                  |
| `MINIO_SECRET_KEY`             | yes      | —                | MinIO secret key                  |
| `MINIO_BUCKET`                 | yes      | —                | Default bucket name               |
| `MINIO_USE_SSL`                | no       | `false`          | Use HTTPS for MinIO               |
| `RUN_MIGRATIONS`               | no       | `false`          | Run DB migrations on Docker start |

## Auth (`apps/auth`)

| Variable                              | Required | Default                 | Description                              |
| ------------------------------------- | -------- | ----------------------- | ---------------------------------------- |
| `AUTH_HTTP_PORT`                      | yes      | —                       | HTTP listen port                         |
| `AUTH_SERVICE_NAME`                   | yes      | —                       | Service name in logs                     |
| `AUTH_SERVER_REQUEST_TIMEOUT_MS`      | yes      | —                       | HTTP server timeout                      |
| `AUTH_SWAGGER_PATH`                   | no       | `api/docs`              | Swagger UI path                          |
| `AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN`    | yes      | —                       | e.g. `15m`                               |
| `AUTH_JWT_ACCESS_TOKEN_KEY_ID`        | yes      | —                       | JWKS key id                              |
| `AUTH_JWT_ACCESS_TOKEN_PRIVATE_KEY`   | yes      | —                       | RS256 PEM (use `\n` for newlines)        |
| `AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN`   | yes      | —                       | e.g. `7d`                                |
| `AUTH_JWT_REFRESH_TOKEN_SECRET`       | yes      | —                       | Refresh token HMAC secret                |
| `AUTH_PASSWORD_SALT_ROUNDS`           | yes      | —                       | bcrypt rounds                            |
| `AUTH_REDIS_URL`                      | yes      | —                       | Redis for refresh sessions               |
| `AUTH_REDIS_KEY_PREFIX`               | yes      | —                       | Redis key prefix                         |
| `AUTH_GOOGLE_CLIENT_ID`               | yes      | —                       | Google OAuth client ID                   |
| `AUTH_GOOGLE_CLIENT_SECRET`           | yes      | —                       | Google OAuth secret                      |
| `AUTH_GOOGLE_REDIRECT_URI`            | yes      | —                       | OAuth callback URL                       |
| `AUTH_ALLOWED_OAUTH_REDIRECT_ORIGINS` | yes      | —                       | Comma-separated allowed redirect origins |
| `KAFKA_BROKERS`                       | yes      | —                       | Kafka brokers                            |
| `AUTH_CORE_SIGNUP_TOPIC`              | yes      | —                       | Signup events topic                      |
| `API_GATEWAY_URL`                     | yes      | —                       | Gateway URL for redirects                |
| `AUTH_CORE_HTTP_URL`                  | no       | `http://localhost:3001` | Core internal API                        |

## Notifications (`apps/notifications`)

| Variable                          | Required | Default          | Description         |
| --------------------------------- | -------- | ---------------- | ------------------- |
| `NOTIFICATIONS_HTTP_PORT`         | yes      | `3005`           | HTTP listen port    |
| `NOTIFICATIONS_POSTGRES_HOST`     | yes      | —                | PostgreSQL host     |
| `NOTIFICATIONS_POSTGRES_PORT`     | yes      | —                | PostgreSQL port     |
| `NOTIFICATIONS_POSTGRES_USER`     | yes      | —                | PostgreSQL user     |
| `NOTIFICATIONS_POSTGRES_PASSWORD` | yes      | —                | PostgreSQL password |
| `NOTIFICATIONS_POSTGRES_DATABASE` | yes      | —                | PostgreSQL database |
| `KAFKA_BROKERS`                   | yes      | —                | Kafka brokers       |
| `MENTION_EVENTS_TOPIC`            | no       | `mention.events` | Consumer topic      |

## Client (`apps/client_app`)

| Variable                         | Required | Default          | Description                         |
| -------------------------------- | -------- | ---------------- | ----------------------------------- |
| `NEXT_PUBLIC_API_GATEWAY_URL`    | yes      | —                | Gateway URL for API calls           |
| `NEXT_PUBLIC_CORE_URL`           | yes      | —                | Core URL (monitoring, direct calls) |
| `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` | no       | `localhost:9000` | Comma-separated image hosts         |
| `NEXT_PUBLIC_CHAT_PROFILE_ID`    | no       | —                | Dev default profile for chat        |

## Docker Compose

| Variable             | Default | Description        |
| -------------------- | ------- | ------------------ |
| `CLIENT_PORT`        | `3000`  | Client host port   |
| `KAFKA_PORT`         | `9092`  | Kafka host port    |
| `MINIO_CONSOLE_PORT` | `9001`  | MinIO console port |
| `REDIS_PORT`         | `6379`  | Redis host port    |

## Per-environment files

```text
.env                  # Shared defaults (gitignored)
.env.development      # Local overrides (optional)
.env.production       # Production overrides (optional)
apps/core/.env        # Service-specific overrides (optional)
```

Later files override earlier ones within the same tier (repo → repo.{env} → app → app.{env}).
