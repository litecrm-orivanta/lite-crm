# Direct Setup on VM (No Git Push Needed)

Since code is already on VM, run these commands directly:

## On VM Terminal:

```bash
cd ~/lite-crm

# Create .env file
cd backend
cat > .env << 'EOF'
DATABASE_URL=postgresql://litecrm:litecrm_password@db:5432/litecrm
JWT_SECRET=87aa21bf8c20f5d881309daa768f21d608d3e80b09f6c19f7d02fde3c1a74d52
N8N_URL=http://n8n:5678
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=n8n_admin_pass_change_this
FRONTEND_URL=http://104.198.62.5:80
BACKEND_URL=http://104.198.62.5:3000
EOF

cd ~/lite-crm

# Fix frontend Dockerfile (if needed)
cd frontend
cat > Dockerfile << 'EOF'
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

cd ~/lite-crm

# Start services
docker compose up -d

# Wait
sleep 30

# Run migrations
docker compose exec backend npx prisma migrate deploy

# Check status
docker compose ps
```
