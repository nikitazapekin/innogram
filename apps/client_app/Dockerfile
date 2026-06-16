FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3004
ARG NEXT_PUBLIC_CORE_URL=http://localhost:3001
ARG NEXT_PUBLIC_IMAGE_REMOTE_HOSTS=localhost:9000

ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL
ENV NEXT_PUBLIC_CORE_URL=$NEXT_PUBLIC_CORE_URL
ENV NEXT_PUBLIC_IMAGE_REMOTE_HOSTS=$NEXT_PUBLIC_IMAGE_REMOTE_HOSTS
ENV NEXT_TELEMETRY_DISABLED=1

COPY apps/client_app/package.json apps/client_app/package-lock.json ./

RUN npm ci --ignore-scripts

COPY apps/client_app ./

RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
