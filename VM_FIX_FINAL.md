# Final Fix for Vite Build Error

The issue is corrupted vite installation. Try this approach:

## Option 1: Complete Cache Clear and Rebuild (Recommended)

Run these commands **on the VM** (SSH into VM first):

```bash
# SSH into VM first (if not already)
# gcloud compute ssh litecrm@lite-crm-vm --zone=us-central1-c

cd ~/lite-crm/frontend

# Remove package-lock.json
rm -f package-lock.json

# Update Dockerfile with npm cache clear
cat > Dockerfile << 'EOF'
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Clear npm cache
RUN npm cache clean --force

# Copy package.json only
COPY package.json ./

# Install dependencies with clean cache
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source code
COPY . .

# Build arguments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

cd ~/lite-crm

# Remove all Docker images and cache
docker compose down
docker system prune -af

# Rebuild completely from scratch
docker compose build --no-cache --pull frontend
docker compose up -d
```

## Option 2: Try Node 18 Instead of 20

If Option 1 doesn't work, try Node 18:

```bash
cd ~/lite-crm/frontend

cat > Dockerfile << 'EOF'
# Build stage - using Node 18
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json only
COPY package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

cd ~/lite-crm
docker compose build --no-cache frontend
docker compose up -d
```

## Option 3: Check if package.json has issues

Verify package.json is valid:

```bash
cd ~/lite-crm/frontend
cat package.json
```

Make sure vite is listed in devDependencies.

## Option 4: Manual Install Test

Test if vite can install manually:

```bash
cd ~/lite-crm/frontend
docker run --rm -v $(pwd):/app -w /app node:20-alpine sh -c "npm install --legacy-peer-deps && npm run build"
```

This will test if the issue is with Docker or the code itself.
