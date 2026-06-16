# Shared Package

`@innogram/shared` — cross-service utilities used by NestJS microservices.

## Exports

### Auth module

- `SharedAuthModule.forRoot({ authServiceUrl })` — JWT validation via JWKS
- `SharedAuthGuard` — global auth guard
- `@Public()` — skip authentication decorator
- `AuthenticatedRequest` — typed request with user payload

### Environment

- `loadMonorepoEnvironment(appRootPath)` — loads `.env`, `.env.{NODE_ENV}`, and service overrides

## Build

```bash
npm run build
```

Must be built before `core`, `notifications`, `auth`, or `api-gateway` when running from source.

## Usage

```typescript
import { Public, SharedAuthModule, loadMonorepoEnvironment } from '@innogram/shared';
```
