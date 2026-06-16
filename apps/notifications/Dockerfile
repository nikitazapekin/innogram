FROM node:20-alpine AS builder
WORKDIR /workspace
ENV npm_config_fetch_retries=5

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./tsconfig.base.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/notifications/package.json ./apps/notifications/package.json

RUN npm install
RUN npm --prefix packages/shared install

COPY apps/notifications ./apps/notifications
COPY packages/shared ./packages/shared

RUN npm --prefix packages/shared run build
RUN npm --prefix apps/notifications run build

FROM node:20-alpine
WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=builder /workspace/apps/notifications/package.json ./apps/notifications/package.json
COPY --from=builder /workspace/apps/notifications/dist ./apps/notifications/dist
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/apps/notifications/node_modules ./apps/notifications/node_modules
COPY --from=builder /workspace/packages/shared/dist ./packages/shared/dist
COPY --from=builder /workspace/packages/shared/package.json ./packages/shared/package.json

EXPOSE 3005
CMD ["node", "apps/notifications/dist/main.js"]
