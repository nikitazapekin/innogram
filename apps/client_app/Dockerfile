FROM node:20-alpine AS builder
WORKDIR /workspace

ARG NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3004
ARG NEXT_PUBLIC_CORE_URL=http://localhost:3001
ARG NEXT_PUBLIC_IMAGE_REMOTE_HOSTS=localhost:9000

ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL
ENV NEXT_PUBLIC_CORE_URL=$NEXT_PUBLIC_CORE_URL
ENV NEXT_PUBLIC_IMAGE_REMOTE_HOSTS=$NEXT_PUBLIC_IMAGE_REMOTE_HOSTS

COPY package.json package-lock.json ./
COPY apps/client_app/package.json ./apps/client_app/package.json

RUN npm install

COPY apps/client_app ./apps/client_app

RUN npm --prefix apps/client_app run build

FROM node:20-alpine
WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=builder /workspace/apps/client_app/public ./apps/client_app/public
COPY --from=builder /workspace/apps/client_app/.next/standalone ./
COPY --from=builder /workspace/apps/client_app/.next/static ./apps/client_app/.next/static

EXPOSE 3000
CMD ["node", "apps/client_app/server.js"]
