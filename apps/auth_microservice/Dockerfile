FROM node:20-alpine AS builder
WORKDIR /workspace

COPY . .
RUN npm install
RUN npm run build:auth

FROM node:20-alpine
WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=builder /workspace /workspace

EXPOSE 3002
CMD ["npm", "run", "start:auth:prod"]
