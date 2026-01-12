# Quick Deployment Guide: Push Code to Google Cloud VM

This guide will help you push your Lite CRM code from your local machine to your Google Cloud VM.

## Prerequisites

1. ✅ VM is created and running
2. ✅ Firewall rules are configured
3. ✅ You can SSH into the VM
4. ✅ Docker is installed on the VM

## Step 1: Get Your VM Information

From Google Cloud Console:

1. Go to **Compute Engine** → **VM instances**
2. Note down:
   - **External IP**: (e.g., `34.123.45.67`)
   - **Zone**: (e.g., `us-central1-a` - shown in the Zone column)

## Step 2: Choose Deployment Method

### Method A: Using the Automated Script (Recommended)

I've created a deployment script that handles everything automatically.

**Run this command on your LOCAL machine:**

```bash
cd /Users/Akash-Kumar/lite-crm
./deploy-to-gcp.sh YOUR_EXTERNAL_IP YOUR_ZONE
```

**Example:**
```bash
./deploy-to-gcp.sh 34.123.45.67 us-central1-a
```

**What the script does:**
1. ✅ Creates/updates `.env` file with correct IPs
2. ✅ Packages your code (excludes node_modules, .git, etc.)
3. ✅ Uploads code to VM
4. ✅ Runs Docker services
5. ✅ Executes database migrations
6. ✅ Shows you the URLs

---

### Method B: Manual Deployment (Step by Step)

If you prefer manual control:

#### Step 2.1: Configure Environment Variables

```bash
cd /Users/Akash-Kumar/lite-crm/backend
nano .env
```

Update these values (replace `YOUR_EXTERNAL_IP` with your VM's IP):

```env
DATABASE_URL=postgresql://litecrm:litecrm_password@db:5432/litecrm
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string-min-32-chars
N8N_URL=http://n8n:5678
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=n8n_admin_pass_change_this
FRONTEND_URL=http://YOUR_EXTERNAL_IP:80
BACKEND_URL=http://YOUR_EXTERNAL_IP:3000
```

Save: `Ctrl+X`, `Y`, `Enter`

#### Step 2.2: Upload Code Using gcloud (if installed)

```bash
cd /Users/Akash-Kumar/lite-crm

# Upload entire project
gcloud compute scp --recurse . litecrm@lite-crm-vm:~/lite-crm --zone=YOUR_ZONE

# Example:
# gcloud compute scp --recurse . litecrm@lite-crm-vm:~/lite-crm --zone=us-central1-a
```

#### Step 2.3: Upload Code Using SCP (Alternative)

If you don't have gcloud CLI:

```bash
# From your local machine
cd /Users/Akash-Kumar/lite-crm

# Upload to VM
scp -r -i ~/.ssh/gcp-key * litecrm@YOUR_EXTERNAL_IP:~/lite-crm/
```

**Note:** You'll need to set up SSH keys first. See deployment guide for details.

#### Step 2.4: SSH into VM and Setup

```bash
# Connect to VM (via Google Cloud Console SSH button, or local SSH)

# Navigate to project
cd ~/lite-crm

# Start Docker services
docker compose up -d

# Wait a bit
sleep 30

# Run migrations
docker compose exec backend npx prisma migrate deploy

# Check status
docker compose ps

# View logs
docker compose logs -f
```

---

## Step 3: Verify Deployment

Open these URLs in your browser:

- **Frontend**: http://YOUR_EXTERNAL_IP
- **Backend API**: http://YOUR_EXTERNAL_IP:3000
- **n8n**: http://YOUR_EXTERNAL_IP:5678

---

## Step 4: Domain Setup (After Code is Deployed)

Once your application is running, you can set up a domain:

### 4.1 Reserve a Static IP (if not done)

1. Go to **VPC Network** → **External IP addresses**
2. Click **"RESERVE STATIC ADDRESS"**
3. Name: `lite-crm-static-ip`
4. Region: Same as your VM
5. Click **"RESERVE"**
6. Assign it to your VM (VM → Edit → Network interfaces)

### 4.2 Point Domain to IP

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add DNS A record:
   - **Type**: A
   - **Name**: `@` (or `www` for subdomain)
   - **Value**: Your static IP address
   - **TTL**: 3600 (or default)

### 4.3 Update Environment Variables

After domain is pointing to your IP, update `.env` on VM:

```bash
# SSH into VM
cd ~/lite-crm/backend
nano .env
```

Update URLs:
```env
FRONTEND_URL=http://yourdomain.com
BACKEND_URL=http://yourdomain.com:3000
# Or use HTTPS after SSL setup
# FRONTEND_URL=https://yourdomain.com
# BACKEND_URL=https://yourdomain.com:3000
```

Restart services:
```bash
cd ~/lite-crm
docker compose restart backend
```

### 4.4 Set Up SSL (HTTPS) - Optional but Recommended

```bash
# SSH into VM
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

This will:
- Install SSL certificate (free from Let's Encrypt)
- Configure Nginx for HTTPS
- Auto-renew certificates

---

## Troubleshooting

### Code Upload Fails

**Issue**: Permission denied or connection refused

**Solutions:**
1. Check VM is running in Google Cloud Console
2. Verify firewall allows SSH (port 22)
3. Try using Google Cloud Shell upload instead
4. Use Google Cloud Console SSH button to connect first

### Services Won't Start

**Check logs:**
```bash
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

**Common issues:**
- Database not ready: Wait longer, database takes time to start
- Port conflicts: Check if ports are in use
- Memory issues: Check `free -h` (may need larger VM)

### Can't Access Application

**Check:**
1. Firewall rules are configured (ports 80, 3000, 5678)
2. Services are running: `docker compose ps`
3. Try accessing from VM itself: `curl http://localhost:80`

---

## Next Steps After Deployment

1. ✅ Test creating an account
2. ✅ Test creating a lead
3. ✅ Set up n8n (first-time setup at /n8n URL)
4. ✅ Configure domain (optional)
5. ✅ Set up SSL certificate (optional)
6. ✅ Set up backups
7. ✅ Monitor logs

---

## Quick Reference Commands

```bash
# View all containers
docker compose ps

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop all services
docker compose down

# Start all services
docker compose up -d

# Rebuild and restart
docker compose up -d --build

# Execute command in container
docker compose exec backend bash
docker compose exec db psql -U litecrm -d litecrm
```

---

Need help? Check the detailed deployment guide: `DEPLOY_GCP_DETAILED_GUIDE.md`
