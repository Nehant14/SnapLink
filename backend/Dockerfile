FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install deps first so this layer is cached unless package*.json changes
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Now bring in the actual source
COPY server.js ./
COPY src ./src

# Run as a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Actual bound port comes from the PORT env var at runtime (see .env /
# docker-compose.yml) — this is just documentation for `docker inspect`.
EXPOSE 4000

CMD ["node", "server.js"]
