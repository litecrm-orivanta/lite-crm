# Fix Backend Build Error on VM

The backend build is failing. Run this on the VM:

```bash
cd ~/lite-crm/backend

# Check the Dockerfile
cat Dockerfile

# The issue is likely that backend doesn't need a build step
# Backend uses TypeScript which is compiled at runtime with ts-node
# Or the build script doesn't exist

# Update Dockerfile to remove build step or use the correct command
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
EOF

# Or if start:prod doesn't exist, use:
# CMD ["npm", "start"]
```

Then rebuild:

```bash
cd ~/lite-crm
docker compose build --no-cache backend
docker compose up -d
```
