FROM node:20-alpine AS builder
WORKDIR /workspace
ENV npm_config_fetch_retries=5 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=600000

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/core_microservice/package.json ./apps/core_microservice/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm install
RUN npm --prefix apps/core_microservice install

COPY apps/core_microservice ./apps/core_microservice
COPY packages/shared ./packages/shared

RUN npm --prefix apps/core_microservice run build

FROM node:20-alpine
WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=builder /root/.npm /root/.npm
COPY --from=builder /workspace/apps/core_microservice/package.json ./apps/core_microservice/package.json
RUN npm --prefix apps/core_microservice install --omit=dev && npm cache clean --force
COPY --from=builder /workspace/apps/core_microservice/dist ./apps/core_microservice/dist

EXPOSE 3001
CMD ["node", "apps/core_microservice/dist/docker-start.js"]
