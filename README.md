# Innogram Microservices

Monorepo skeleton for `core_microservice`, `auth_microservice`, and `posts_microservice` with NATS-based communication.

## Architecture

- `core_microservice` is the API Gateway.
- `auth_microservice` and `posts_microservice` are standalone services with their own HTTP ports and NATS `@MessagePattern(...)` handlers.
- `core_microservice` authenticates incoming requests through `auth_microservice` before routing post-related calls to `posts_microservice`.
- Swagger is enabled in `core_microservice`.

## Install

Recommended installation from the repository root:

```bash
npm install
```

If you want to install dependencies service-by-service, this also works:

```bash
cd apps/auth_microservice && npm install
cd ../posts_microservice && npm install
cd ../core_microservice && npm install
```

## Start Services

From the repository root:

```bash
npm run start:auth
npm run start:posts
npm run start:core
```

Or from each service directory:

```bash
cd apps/auth_microservice && npm run start:dev
cd apps/posts_microservice && npm run start:dev
cd apps/core_microservice && npm run start:dev
```

If you specifically want file watching, use:

```bash
cd apps/core_microservice && npm run start:watch
```

Ports:

- `core_microservice`: `http://localhost:3001`
- `auth_microservice`: `http://localhost:3002/health`
- `posts_microservice`: `http://localhost:3003/health`
- Swagger: `http://localhost:3001/api/docs`
- NATS: `nats://localhost:4222`
- NATS monitoring: `http://localhost:8222`

## Smoke Test Endpoints

After starting NATS and the three services:

```bash
curl http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/auth/validate -H 'Content-Type: application/json' -d '{"accessToken":"demo-access-token"}'
curl http://localhost:3001/api/posts -H 'Authorization: Bearer demo-access-token'
curl -X POST http://localhost:3001/api/posts -H 'Content-Type: application/json' -H 'Authorization: Bearer demo-access-token' -d '{"title":"Stub post","content":"Checking NATS flow"}'
```

Each service logs NATS ingress/egress steps so you can verify broker routing without any business logic or database wiring yet.

## Docker

```bash
docker compose up --build
```

## CI / Utility Commands

```bash
npm run lint
npm run build
```
