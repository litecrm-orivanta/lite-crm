FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy Prisma schema first
COPY prisma ./prisma

# Generate Prisma client (must happen before TypeScript build)
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy configs and source
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# 🔴 CRITICAL: ensure no stale JS
RUN rm -rf dist

# Build TS -> dist (clean)
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
