FROM node:20-alpine AS builder
WORKDIR /workspace
ENV npm_config_fetch_retries=5 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=600000

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/core/package.json ./apps/core/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm install
RUN npm --prefix packages/shared install

COPY apps/core ./apps/core
COPY packages/shared ./packages/shared

RUN npm --prefix packages/shared run build
RUN npm --prefix apps/core run build

FROM node:20-alpine
WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=builder /workspace/apps/core/package.json ./apps/core/package.json
COPY --from=builder /workspace/apps/core/dist ./apps/core/dist
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/apps/core/node_modules ./apps/core/node_modules
COPY --from=builder /workspace/packages/shared/dist ./packages/shared/dist
COPY --from=builder /workspace/packages/shared/package.json ./packages/shared/package.json

EXPOSE 3001
CMD ["node", "apps/core/dist/docker-start.js"]
