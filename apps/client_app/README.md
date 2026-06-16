# Client App

Next.js 15 frontend for Innogram.

## Port

**3000** (Next.js default)

## Scripts

```bash
npm run dev     # Development server
npm run build   # Production build
npm run start   # Serve production build
npm run lint    # ESLint
```

## Environment

| Variable                         | Description                                |
| -------------------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_API_GATEWAY_URL`    | API gateway URL for authenticated requests |
| `NEXT_PUBLIC_CORE_URL`           | Core URL for monitoring metrics            |
| `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` | Allowed image CDN hosts (comma-separated)  |

See [docs/ENVIRONMENT.md](../../docs/ENVIRONMENT.md#client-appsclient_app).

## Features

- Feed, posts, comments, profiles
- Real-time chat (Socket.IO to core)
- Notifications panel
- Performance monitoring dashboard at `/monitoring`

## Docker

Build args must include `NEXT_PUBLIC_*` variables:

```bash
docker build -f apps/client_app/Dockerfile \
  --build-arg NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3004 \
  --build-arg NEXT_PUBLIC_CORE_URL=http://localhost:3001 \
  -t innogram-client .
```

Or use root `docker compose up client`.
