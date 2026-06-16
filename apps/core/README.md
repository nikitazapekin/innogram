# Core Microservice

NestJS HTTP API for profiles, posts, comments, assets, chats, and notifications proxy.

## Port

`CORE_HTTP_PORT` — default **3001**

## Swagger

http://localhost:3001/api/docs

## Scripts

```bash
npm run start:dev      # Build and start
npm run start:watch    # Watch mode
npm run migration:run  # Run TypeORM migrations
npm run test           # Unit tests
npm run test:e2e       # E2E tests
```

## Key modules

| Module        | Path prefix                        | Auth                             |
| ------------- | ---------------------------------- | -------------------------------- |
| Posts         | `/posts`                           | Bearer token                     |
| Users         | `/users`                           | Mixed (`@Public` on some routes) |
| Comments      | `/comments`, `/posts/:id/comments` | Bearer token                     |
| Assets        | `/assets`                          | Bearer token                     |
| Chats         | `/chats`                           | Public upload                    |
| Notifications | `/notifications`                   | Public (proxied)                 |
| Monitoring    | `/monitoring`                      | Public                           |

## Monitoring

- `GET /monitoring/metrics` — JSON performance snapshot
- `GET /monitoring/prometheus` — Prometheus scrape endpoint

## Environment

See [docs/ENVIRONMENT.md](../../docs/ENVIRONMENT.md#core-appscore).

## Docker

```bash
docker build -f apps/core/Dockerfile -t innogram-core .
```

Or via root `docker compose up core`.
