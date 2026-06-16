FROM node:20-alpine AS builder
WORKDIR /workspace

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./tsconfig.base.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api-gateway/package.json ./apps/api-gateway/package.json

RUN npm install
RUN npm --prefix packages/shared install

COPY apps/api-gateway ./apps/api-gateway
COPY packages/shared ./packages/shared

RUN npm --prefix packages/shared run build
RUN npm --prefix apps/api-gateway run build

FROM node:20-alpine
WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=builder /workspace/apps/api-gateway/package.json ./apps/api-gateway/package.json
COPY --from=builder /workspace/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/packages/shared/dist ./packages/shared/dist
COPY --from=builder /workspace/packages/shared/package.json ./packages/shared/package.json

EXPOSE 3004
CMD ["node", "apps/api-gateway/dist/main.js"]
