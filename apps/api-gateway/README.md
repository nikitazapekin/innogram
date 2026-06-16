# API Gateway

NestJS reverse proxy that routes traffic to backend services.

## Port

`API_GATEWAY_PORT` — default **3004**

## Routing

| Path prefix     | Upstream                          |
| --------------- | --------------------------------- |
| `/auth/*`       | Auth service (`AUTH_SERVICE_URL`) |
| Everything else | Core service (`CORE_URL`)         |

CORS is enabled for `http://localhost:3000` and `http://127.0.0.1:3000`.

## Scripts

```bash
npm run start:dev   # Watch mode
npm run build       # Compile
npm run start       # Run production build
```

## Environment

| Variable           | Description   |
| ------------------ | ------------- |
| `API_GATEWAY_PORT` | Listen port   |
| `AUTH_SERVICE_URL` | Auth base URL |
| `CORE_URL`         | Core base URL |

See [docs/ENVIRONMENT.md](../../docs/ENVIRONMENT.md#api-gateway-appsapi-gateway).

## Docker

```bash
docker build -f apps/api-gateway/Dockerfile -t innogram-gateway .
```

The client app should use `NEXT_PUBLIC_API_GATEWAY_URL` pointing to this service.
