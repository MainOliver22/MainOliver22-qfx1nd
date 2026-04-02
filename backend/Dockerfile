FROM node:20-alpine AS base
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ .

EXPOSE 3000

CMD ["node", "server.js"]
