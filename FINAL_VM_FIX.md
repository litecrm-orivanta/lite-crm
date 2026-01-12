# FINAL FIX - Run on VM (Not Cloud Shell!)

**IMPORTANT**: You're currently in Cloud Shell. You need to SSH into the VM first!

## Step 1: SSH into the VM

```bash
gcloud compute ssh litecrm@lite-crm-vm --zone=us-central1-c
```

## Step 2: Once on VM, Run These Commands

```bash
cd ~/lite-crm/frontend

# Verify package.json has "type": "module"
cat package.json | grep '"type"'

# Remove package-lock.json
rm -f package-lock.json

# Update Dockerfile - Use Node 20 and ensure clean install
cat > Dockerfile << 'EOF'
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies (fresh install, no cache)
RUN npm install --legacy-peer-deps --no-optional

# Copy source code
COPY . .

# Build arguments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build using npx directly
RUN npx vite build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

cd ~/lite-crm

# Stop all containers
docker compose down

# Remove ALL images and cache
docker system prune -af --volumes

# Rebuild with NO cache at all
DOCKER_BUILDKIT=1 docker compose build --no-cache --pull frontend

# Start services
docker compose up -d
```

## Alternative: If Still Failing, Try This Simpler Approach

```bash
cd ~/lite-crm/frontend

# Remove everything that might cause issues
rm -f package-lock.json
rm -rf node_modules 2>/dev/null || true

# Use simpler Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npx vite build

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

## Verify You're on the VM

The prompt should show: `litecrm@lite-crm-vm:~/lite-crm$`

NOT: `litecrm@cloudshell:~/lite-crm$`

If you see "cloudshell", you're in the wrong place! SSH into VM first.
