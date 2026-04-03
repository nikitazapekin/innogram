FROM node:20-alpine AS builder
WORKDIR /workspace

COPY . .
RUN npm install
RUN npm run build:posts

FROM node:20-alpine
WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=builder /workspace /workspace

EXPOSE 3003
CMD ["npm", "run", "start:posts:prod"]
