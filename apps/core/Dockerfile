FROM node:20-alpine AS builder
WORKDIR /workspace

COPY . .
RUN npm install
RUN npm run build:core

FROM node:20-alpine
WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=builder /workspace /workspace

EXPOSE 3001
CMD ["npm", "run", "start:core:prod"]
