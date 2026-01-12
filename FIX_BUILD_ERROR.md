# Fix for Frontend Build Error

The frontend build was failing due to a corrupted node_modules issue. I've fixed the Dockerfile.

## What Was Fixed

The Dockerfile now uses a cleaner build process with `npm ci` instead of `npm install`.

## New Deployment Package

A new zip file has been created: `lite-crm-deploy-fixed.zip`

## Steps to Fix

### Option 1: Upload Fixed Zip (Recommended)

1. **In Google Cloud Shell**, upload the new zip file:
   - Click three-dot menu → Upload file
   - Upload: `lite-crm-deploy-fixed.zip`

2. **Unzip and upload**:
```bash
cd /home/litecrm
rm -rf lite-crm  # Remove old version
unzip lite-crm-deploy-fixed.zip -d lite-crm

# Upload to VM
gcloud compute scp --recurse lite-crm litecrm@lite-crm-vm:~/ --zone=us-central1-c
gcloud compute scp lite-crm/vm-setup.sh litecrm@lite-crm-vm:~/lite-crm/ --zone=us-central1-c

# SSH and rebuild
gcloud compute ssh litecrm@lite-crm-vm --zone=us-central1-c
```

3. **On the VM**, clean up and rebuild:
```bash
cd ~/lite-crm
docker compose down
docker compose build --no-cache frontend
docker compose up -d
```

### Option 2: Fix on VM Directly

If you're already SSH'd into the VM:

```bash
cd ~/lite-crm/frontend

# Edit Dockerfile
nano Dockerfile
```

Replace the entire file with:

```dockerfile
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

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
```

Save: `Ctrl+X`, `Y`, `Enter`

Then rebuild:
```bash
cd ~/lite-crm
docker compose build --no-cache frontend
docker compose up -d
```
