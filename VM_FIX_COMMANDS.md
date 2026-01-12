# Quick Fix Commands for VM

Run these commands on the VM to fix the build error:

## Step 1: Update Dockerfile

```bash
cd ~/lite-crm/frontend
cat > Dockerfile << 'EOF'
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (use npm install to avoid package-lock.json issues)
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

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF
```

## Step 2: Remove package-lock.json (if exists)

```bash
cd ~/lite-crm/frontend
rm -f package-lock.json
```

## Step 3: Rebuild with no cache

```bash
cd ~/lite-crm
docker compose build --no-cache frontend
```

## Step 4: Start services

```bash
docker compose up -d
```

## Step 5: Check status

```bash
docker compose ps
docker compose logs frontend
```

---

If this still doesn't work, try this alternative approach:

```bash
cd ~/lite-crm/frontend

# Remove package-lock.json
rm -f package-lock.json

# Edit Dockerfile to remove package-lock.json copy
nano Dockerfile
```

Change the COPY line from:
```
COPY package*.json ./
```

To:
```
COPY package.json ./
```

Then rebuild.
