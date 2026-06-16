# Notifications Microservice

NestJS service that consumes Kafka mention events and exposes HTTP API for notification management.

## Port

`NOTIFICATIONS_HTTP_PORT` — default **3005**

## Swagger

http://localhost:3005/api/docs

## Endpoints

| Method | Path                                 | Description         |
| ------ | ------------------------------------ | ------------------- |
| GET    | `/notifications?recipientProfileId=` | List notifications  |
| PATCH  | `/notifications/:id`                 | Update read state   |
| DELETE | `/notifications/:id`                 | Delete notification |

## Kafka

Consumes `MENTION_EVENTS_TOPIC` (default `mention.events`) from `KAFKA_BROKERS`.

## Scripts

```bash
npm run start:dev   # Build shared + watch
npm run build       # Compile
npm run start       # Run production build
```

## Environment

See [docs/ENVIRONMENT.md](../../docs/ENVIRONMENT.md#notifications-appsnotifications).

## Docker

```bash
docker build -f apps/notifications/Dockerfile -t innogram-notifications .
```
