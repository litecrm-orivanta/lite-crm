FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy configs and source
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

# 🔴 CRITICAL: ensure no stale JS
RUN rm -rf dist

# Generate Prisma client
RUN npx prisma generate

# Build TS -> dist (clean)
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
