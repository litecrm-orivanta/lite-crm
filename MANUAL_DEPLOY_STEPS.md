# Manual Deployment Steps for GCP

Since gcloud CLI is not installed, follow these manual steps:

## Your VM Details:
- **External IP**: 104.198.62.5
- **Zone**: us-central1-c
- **VM Name**: lite-crm-vm
- **Username**: litecrm

## Step 1: Connect to VM via Google Cloud Console

1. Go to: https://console.cloud.google.com/compute/instances
2. Find your VM: `lite-crm-vm`
3. Click the **SSH** button (right side)
4. Browser terminal will open - you're now connected!

## Step 2: Prepare Code on VM

Once SSH'd into the VM, run:

```bash
# Create project directory
mkdir -p ~/lite-crm
cd ~/lite-crm
```

## Step 3: Upload Code from Your Local Machine

You have two options:

### Option A: Using Google Cloud Shell (Easiest)

1. **On your LOCAL machine**, create a zip file:
```bash
cd /Users/Akash-Kumar/lite-crm
zip -r lite-crm.zip . -x "node_modules/*" ".git/*" "*.log" ".DS_Store" "dist/*" "build/*"
```

2. **Go to Google Cloud Shell**: https://shell.cloud.google.com
3. Click the **three-dot menu** (top right) → **"Upload file"**
4. Upload `lite-crm.zip`
5. **In Cloud Shell**, run:
```bash
# Unzip
unzip lite-crm.zip -d lite-crm

# Upload to VM
gcloud compute scp --recurse lite-crm litecrm@lite-crm-vm:~/ --zone=us-central1-c
```

### Option B: Manual File Transfer (if Option A doesn't work)

You can manually create the files on the VM. But this is tedious - Option A is better.

## Step 4: Configure Environment Variables

**SSH into VM** (via Google Cloud Console SSH button), then:

```bash
cd ~/lite-crm/backend

# Create .env file
nano .env
```

**Paste this (IP is already set for you):**

```env
DATABASE_URL=postgresql://litecrm:litecrm_password@db:5432/litecrm
JWT_SECRET=change-this-to-a-random-32-character-string-minimum
N8N_URL=http://n8n:5678
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=change-this-to-secure-password
FRONTEND_URL=http://104.198.62.5:80
BACKEND_URL=http://104.198.62.5:3000
```

**To generate random JWT_SECRET, run this on VM:**
```bash
openssl rand -hex 32
```

Copy the output and use it as JWT_SECRET.

**To save in nano**: `Ctrl+X`, then `Y`, then `Enter`

## Step 5: Start Docker Services

**Still on VM (SSH'd in):**

```bash
cd ~/lite-crm

# Start services
docker compose up -d

# Wait a bit
sleep 30

# Check status
docker compose ps
```

All services should show "Up" status.

## Step 6: Run Database Migrations

```bash
docker compose exec backend npx prisma migrate deploy
```

## Step 7: Check Logs

```bash
# View all logs
docker compose logs

# View specific service
docker compose logs backend
docker compose logs frontend
```

## Step 8: Test Your Application

Open in browser:
- **Frontend**: http://104.198.62.5
- **Backend**: http://104.198.62.5:3000
- **n8n**: http://104.198.62.5:5678

## Troubleshooting

If services don't start:
```bash
# Check logs
docker compose logs backend
docker compose logs frontend

# Check if Docker is running
docker ps

# Restart services
docker compose restart
```

If you see errors, share them and we can troubleshoot!
