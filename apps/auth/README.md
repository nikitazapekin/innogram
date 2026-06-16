# Auth Microservice

Express-based authentication service: registration, login, Google OAuth, JWT access tokens, Redis-backed refresh sessions.

## Port

`AUTH_HTTP_PORT` — default **3002**

## Swagger

http://localhost:3002/api/docs

## Endpoints

| Method | Path                     | Description                  |
| ------ | ------------------------ | ---------------------------- |
| GET    | `/health`                | Health check                 |
| GET    | `/.well-known/jwks.json` | JWKS for token verification  |
| POST   | `/auth/register`         | Register with email/password |
| POST   | `/auth/login`            | Login                        |
| POST   | `/auth/refresh`          | Refresh access token         |
| POST   | `/auth/logout`           | Logout                       |
| GET    | `/auth/validate`         | Validate Bearer token        |
| GET    | `/auth/google`           | Start Google OAuth           |
| GET    | `/auth/google/callback`  | OAuth callback               |

## Scripts

```bash
npm run start:dev   # Watch mode (tsx)
npm run build       # Compile to dist/
npm run start       # Run production build
```

## Dependencies

- **Redis** — refresh token sessions
- **Kafka** — signup events to core
- **Core HTTP** — user profile creation

## Environment

See [docs/ENVIRONMENT.md](../../docs/ENVIRONMENT.md#auth-appsauth).

## Docker

```bash
docker build -f apps/auth/Dockerfile -t innogram-auth .
```
