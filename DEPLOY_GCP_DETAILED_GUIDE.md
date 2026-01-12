# Complete Step-by-Step Guide: Deploy Lite CRM on Google Cloud Platform

This is a comprehensive, detailed guide with explanations for every step. Follow it carefully to deploy your Lite CRM application.

---

## Table of Contents

1. [Prerequisites & Account Setup](#1-prerequisites--account-setup)
2. [Project Creation](#2-project-creation)
3. [VM Instance Setup](#3-vm-instance-setup)
4. [Firewall Configuration](#4-firewall-configuration)
5. [Connecting to VM](#5-connecting-to-vm)
6. [System Setup](#6-system-setup)
7. [Application Deployment](#7-application-deployment)
8. [Configuration & Testing](#8-configuration--testing)
9. [Troubleshooting](#9-troubleshooting)
10. [Post-Deployment](#10-post-deployment)

---

## 1. Prerequisites & Account Setup

### 1.1 Create Google Cloud Account

**Step-by-step:**

1. Go to: https://cloud.google.com
2. Click the **"Get started for free"** button (top right)
3. Sign in with your Google account (Gmail account)
4. Fill in account information:
   - Country
   - Account type (Individual or Business)
   - Terms acceptance
5. **Payment Information** (Required):
   - Credit card or debit card
   - **Important**: Google won't charge you unless you explicitly upgrade
   - Free trial gives $300 credit that expires after 90 days
   - You can cancel anytime before trial ends to avoid charges
6. Click **"Start my free trial"**
7. Wait for account activation (usually instant, sometimes a few minutes)

**Validation:**
- You should see the Google Cloud Console dashboard
- Check that you see "$300 Free Trial Credit" in the top banner

---

## 2. Project Creation

### 2.1 Create a New Project

**Why:** Projects organize your resources. Each deployment should have its own project.

**Steps:**

1. In Google Cloud Console, look at the top bar
2. Click on the **project dropdown** (it might show "Select a project" or "My First Project")
3. Click **"NEW PROJECT"** button (top right of the popup)
4. Fill in:
   - **Project name**: `lite-crm-uat` (or any name you prefer)
   - **Location**: Leave as default (No organization)
5. Click **"CREATE"**
6. Wait 10-20 seconds for project creation
7. Click **"SELECT PROJECT"** if it doesn't auto-select

**Validation:**
- Top bar should now show your project name: "lite-crm-uat"
- URL should contain your project ID

### 2.2 Enable Billing

**Steps:**

1. Go to **"Billing"** in the left menu (under "Billing")
2. If prompted, click **"LINK A BILLING ACCOUNT"**
3. Select your billing account (created during signup)
4. Click **"SET ACCOUNT"**

**Validation:**
- Billing page should show "Active" status
- You should see "$300 Free Trial Credit" information

### 2.3 Enable Required APIs

**Why:** Google Cloud requires APIs to be enabled before using services.

**Steps:**

1. Click the **hamburger menu** (☰) in top left
2. Go to **"APIs & Services"** → **"Library"**
3. Search for **"Compute Engine API"**
4. Click on **"Compute Engine API"**
5. Click the **"ENABLE"** button
6. Wait for it to enable (10-30 seconds)
7. Repeat for **"Cloud Resource Manager API"** (search and enable)

**Validation:**
- Both APIs should show "API enabled" status
- You can check enabled APIs at: "APIs & Services" → "Enabled APIs"

---

## 3. VM Instance Setup

### 3.1 Create VM Instance

**Steps:**

1. Click **hamburger menu** (☰) → **"Compute Engine"** → **"VM instances"**
2. If this is your first VM, click **"ENABLE"** (takes 1-2 minutes)
3. Click the **"CREATE INSTANCE"** button (top of page)

**Fill in the form:**

#### Section 1: Instance Details
- **Name**: `lite-crm-vm`
  - Must be lowercase, numbers, hyphens only
  - Example: `lite-crm-uat-vm`

#### Section 2: Region and Zone
- **Region**: Choose one:
  - `us-central1` (Iowa) - Recommended for free tier
  - `us-east1` (South Carolina)
  - `europe-west1` (Belgium)
- **Zone**: Leave default (any zone in selected region)
- **Note**: Free tier eligible regions: us-central1, us-east1, us-west1, europe-west1, asia-east1

#### Section 3: Machine Configuration
- **Machine family**: **General-purpose** (default)
- **Series**: **E2** (default)
- **Machine type**: Click dropdown, then:

**Option A - Free Tier (Limited Resources):**
- Select **"e2-micro"**
- Specs: 0.5-1 vCPU, 1GB RAM
- **Warning**: May struggle with full stack (backend + frontend + database + n8n)

**Option B - Recommended for UAT ($300 credit):**
- Select **"e2-small"** or **"e2-medium"**
- e2-small: 2 vCPU, 2GB RAM (~$15/month)
- e2-medium: 2 vCPU, 4GB RAM (~$30/month) - **Recommended**

#### Section 4: Boot Disk
- Click **"CHANGE"** button
- **Operating System**: **Ubuntu**
- **Version**: **Ubuntu 22.04 LTS** (or latest LTS)
- **Boot disk type**: **Standard persistent disk**
- **Size**: 
  - Free tier: 30 GB (free)
  - Recommended: 50 GB (~$8/month)
- Click **"SELECT"**

#### Section 5: Firewall
- ✅ Check **"Allow HTTP traffic"**
- ✅ Check **"Allow HTTPS traffic"**
- Leave others unchecked

#### Section 6: Advanced Options (Optional)
- Click **"Networking"** tab
- **Network tags**: Add `http-server` and `https-server` (optional, helps with firewall rules)
- **External IP**: Leave as "Ephemeral" (changes on restart) or create static IP later

#### Final Step
- Review all settings
- Click **"CREATE"** button (bottom)
- Wait 1-3 minutes for VM creation

**Validation:**
- VM should appear in the list with a green checkmark
- Status should be "Running"
- Note the **External IP** address (you'll need this)

### 3.2 Create Static IP (Recommended)

**Why:** Prevents IP changes when VM restarts.

**Steps:**

1. In VM instances page, note your current External IP
2. Go to **"VPC Network"** → **"External IP addresses"** (left menu)
3. Click **"RESERVE STATIC ADDRESS"** (top)
4. Fill in:
   - **Name**: `lite-crm-static-ip`
   - **Network service tier**: Premium
   - **IP version**: IPv4
   - **Type**: Regional
   - **Region**: Same as your VM (e.g., us-central1)
5. Click **"RESERVE"**
6. Wait a few seconds
7. Go back to **"Compute Engine"** → **"VM instances"**
8. Click on your VM name: `lite-crm-vm`
9. Click **"EDIT"** button (top)
10. Scroll to **"Network interfaces"**
11. Click the network interface to expand
12. Under **"External IP"**, change from "Ephemeral" to your reserved static IP
13. Click **"SAVE"**
14. Wait 30 seconds for changes to apply

**Validation:**
- VM instances page should show your static IP
- IP should be the same after VM restart

---

## 4. Firewall Configuration

### 4.1 Configure Firewall Rules

**Why:** Google Cloud blocks all incoming traffic by default. We need to allow specific ports.

**Steps:**

1. Go to **"VPC Network"** → **"Firewall"** (left menu)
2. You should see default rules for HTTP (port 80) and HTTPS (port 443) if you checked those boxes
3. Click **"CREATE FIREWALL RULE"** (top)

#### Rule 1: Backend API (Port 3000)

- **Name**: `allow-backend-api`
- **Description**: `Allow backend API access on port 3000`
- **Network**: `default` (or your VPC network name)
- **Direction of traffic**: **Ingress** (incoming)
- **Action on match**: **Allow**
- **Targets**: **All instances in the network**
- **Source IP ranges**: `0.0.0.0/0` (allows from anywhere)
- **Protocols and ports**: 
  - Select **TCP**
  - Enter port: `3000`
- Click **"CREATE"**

#### Rule 2: n8n (Port 5678)

- Click **"CREATE FIREWALL RULE"** again
- **Name**: `allow-n8n`
- **Description**: `Allow n8n workflow service on port 5678`
- **Network**: `default`
- **Direction of traffic**: **Ingress**
- **Action on match**: **Allow**
- **Targets**: **All instances in the network**
- **Source IP ranges**: `0.0.0.0/0`
- **Protocols and ports**: 
  - Select **TCP**
  - Enter port: `5678`
- Click **"CREATE"**

**Validation:**
- You should see 4-5 firewall rules total:
  - `default-allow-http` (port 80)
  - `default-allow-https` (port 443)
  - `allow-backend-api` (port 3000)
  - `allow-n8n` (port 5678)
- All should have green status

---

## 5. Connecting to VM

### 5.1 Using Google Cloud Shell (Easiest - Recommended)

**Steps:**

1. Go to **"Compute Engine"** → **"VM instances"**
2. Find your VM: `lite-crm-vm`
3. In the row, look for the **"SSH"** button (right side)
4. Click the **"SSH"** button (dropdown arrow)
5. Select **"Open in browser window"** or just click "SSH"
6. A new browser window/tab opens with a terminal
7. You're now connected! You should see a command prompt like: `username@lite-crm-vm:~$`

**Advantages:**
- No SSH key setup needed
- Works from any browser
- Automatically authenticated

**Validation:**
- Terminal should show your username and VM name
- Running `whoami` should show your username
- Running `pwd` should show `/home/your-username`

### 5.2 Using Local SSH (Alternative)

**If you prefer using your local terminal:**

#### Step 1: Generate SSH Key (if needed)
```bash
# On your local machine (Mac/Linux)
ssh-keygen -t rsa -f ~/.ssh/gcp-lite-crm -C "your-email@example.com"

# Press Enter to accept default location
# Press Enter twice for no passphrase (or set one)
```

#### Step 2: Add Public Key to Google Cloud
```bash
# Copy your public key
cat ~/.ssh/gcp-lite-crm.pub
# Copy the output (starts with ssh-rsa...)
```

1. In Google Cloud Console, go to **"Compute Engine"** → **"Metadata"**
2. Click **"SSH Keys"** tab
3. Click **"ADD SSH KEY"**
4. Paste your public key
5. Click **"SAVE"**

#### Step 3: Connect via SSH
```bash
# Get your username (usually your Gmail username before @)
# Get your VM's external IP from VM instances page

ssh -i ~/.ssh/gcp-lite-crm your-username@YOUR_EXTERNAL_IP

# First time, type "yes" to accept fingerprint
```

**Validation:**
- You should be logged into the VM
- Terminal prompt should show VM name

---

## 6. System Setup

### 6.1 Update System Packages

**Steps (run in SSH terminal):**

```bash
# Update package lists
sudo apt update

# Upgrade installed packages (takes 2-5 minutes)
sudo apt upgrade -y

# Wait for completion
```

**Validation:**
- No error messages
- Command prompt returns

### 6.2 Install Docker

**Steps:**

```bash
# Remove old Docker versions (if any)
sudo apt remove docker docker-engine docker.io containerd runc -y

# Install prerequisites
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package lists again
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

**Expected Output:**
```
Docker version 24.x.x, build xxxxx
Docker Compose version v2.x.x
```

**Important:** Log out and back in for docker group to take effect:
```bash
exit
```

Then reconnect via SSH (click SSH button again, or reconnect via local SSH)

**Validation after reconnecting:**
```bash
# Run without sudo (should work now)
docker ps

# Should show empty list or containers, not permission error
docker compose version
```

### 6.3 Install Git

```bash
sudo apt install git -y

# Verify
git --version
```

**Validation:**
- Should show: `git version 2.x.x`

### 6.4 Install Node.js (Optional - for building if needed)

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

**Validation:**
- Should show: `v20.x.x` for node
- Should show: `10.x.x` for npm

---

## 7. Application Deployment

### 7.1 Upload Your Code

**Option A: Using Git (Recommended if you have a repository)**

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/your-username/lite-crm.git

# Or if using SSH:
# git clone git@github.com:your-username/lite-crm.git

cd lite-crm

# Verify files are there
ls -la
```

**Option B: Upload Files Manually (Google Cloud Shell)**

1. In Google Cloud Shell, click the **three-dot menu** (top right)
2. Select **"Upload file"**
3. Upload your project files (zip first if many files)
4. Unzip if needed: `unzip lite-crm.zip`
5. Navigate: `cd lite-crm`

**Option C: Using SCP from Local Machine**

```bash
# On your LOCAL machine (not VM)
# First, zip your project
cd /path/to/lite-crm
zip -r lite-crm.zip . -x "node_modules/*" ".git/*"

# Upload via SCP
scp -i ~/.ssh/gcp-lite-crm lite-crm.zip your-username@YOUR_EXTERNAL_IP:~/

# Then SSH into VM and unzip
ssh -i ~/.ssh/gcp-lite-crm your-username@YOUR_EXTERNAL_IP
unzip lite-crm.zip -d lite-crm
cd lite-crm
```

**Validation:**
```bash
# Check you're in the right directory
pwd
# Should show: /home/your-username/lite-crm

# List files
ls -la
# Should see: backend/, frontend/, docker-compose.yml, etc.
```

### 7.2 Configure Environment Variables

**Steps:**

```bash
# Navigate to backend directory
cd ~/lite-crm/backend

# Create .env file
nano .env
```

**In the nano editor, paste this configuration:**

```env
# Database Connection (Docker service name)
DATABASE_URL=postgresql://litecrm:litecrm_password@db:5432/litecrm

# JWT Secret (CHANGE THIS TO A RANDOM STRING)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string-min-32-chars

# n8n Configuration
N8N_URL=http://n8n:5678
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=n8n_admin_pass_change_this_too

# Frontend URL (replace YOUR_EXTERNAL_IP with your actual IP)
FRONTEND_URL=http://YOUR_EXTERNAL_IP:80

# Backend URL
BACKEND_URL=http://YOUR_EXTERNAL_IP:3000
```

**To edit in nano:**
- Replace `YOUR_EXTERNAL_IP` with your actual VM external IP
- Generate a random JWT_SECRET (you can use: `openssl rand -hex 32`)
- Change n8n password to something secure

**To save and exit nano:**
1. Press `Ctrl + X`
2. Press `Y` (yes to save)
3. Press `Enter` (confirm filename)

**Validation:**
```bash
# Verify file was created
cat .env

# Should show your configuration
# Verify IP addresses are correct
```

### 7.3 Verify docker-compose.yml

```bash
# Go back to project root
cd ~/lite-crm

# View docker-compose.yml
cat docker-compose.yml
```

**Check that these ports are mapped:**
- Frontend: `"80:80"` or `"8080:80"`
- Backend: `"3000:3000"`
- n8n: `"5678:5678"`
- Database: No external port (internal only)

**If ports are different, note them down.**

---

## 8. Configuration & Testing

### 8.1 Install Nginx (Recommended)

**Why:** Nginx acts as a reverse proxy, making it easier to manage multiple services.

```bash
# Install Nginx
sudo apt install nginx -y

# Create configuration file
sudo nano /etc/nginx/sites-available/lite-crm
```

**Paste this configuration (replace YOUR_EXTERNAL_IP):**

```nginx
server {
    listen 80;
    server_name YOUR_EXTERNAL_IP;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # n8n (optional)
    location /n8n {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/lite-crm /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Should show: "syntax is ok" and "test is successful"

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

**Validation:**
- `nginx -t` should show "syntax is ok"
- `systemctl status nginx` should show "active (running)"

### 8.2 Start Docker Services

```bash
# Navigate to project directory
cd ~/lite-crm

# Start all services
docker compose up -d

# Watch the logs (optional, press Ctrl+C to exit)
docker compose logs -f
```

**Expected Output:**
```
[+] Running 5/5
 ✔ Container lite-crm-db-1       Started
 ✔ Container lite-crm-n8n-1      Started
 ✔ Container lite-crm-backend-1  Started
 ✔ Container lite-crm-frontend-1 Started
```

**Wait 30-60 seconds for all containers to start.**

**Check status:**
```bash
docker compose ps
```

**All services should show "Up" status:**
```
NAME                    STATUS
lite-crm-backend-1      Up
lite-crm-frontend-1     Up
lite-crm-db-1           Up
lite-crm-n8n-1          Up
```

### 8.3 Run Database Migrations

```bash
# Run Prisma migrations
docker compose exec backend npx prisma migrate deploy

# Expected output: migrations applied successfully
```

**Validation:**
- Should show: "Applied migration: xxxxx"
- No error messages

### 8.4 Check Service Logs

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs db
docker compose logs n8n

# Follow logs in real-time
docker compose logs -f backend
```

**Look for:**
- Backend: "Nest application successfully started"
- Frontend: Should show nginx startup
- Database: Should show PostgreSQL startup
- n8n: Should show n8n startup

**Common Issues:**
- If backend shows "Can't reach database": Wait a bit longer, database might still be starting
- If frontend shows errors: Check if backend is running first

---

## 9. Testing Your Deployment

### 9.1 Test from Browser

Open these URLs in your browser (replace YOUR_EXTERNAL_IP):

1. **Frontend**: http://YOUR_EXTERNAL_IP
   - Should show Lite CRM login page
   - If blank/error: Check frontend logs

2. **Backend API**: http://YOUR_EXTERNAL_IP:3000
   - Should show API response or 404 (normal if no root route)
   - Test: http://YOUR_EXTERNAL_IP:3000/api/health (if you have health check)

3. **n8n**: http://YOUR_EXTERNAL_IP:5678
   - Should show n8n setup/login page
   - If setup page: Follow n8n setup (create admin account)

### 9.2 Test from Command Line

```bash
# Test backend
curl http://localhost:3000

# Test frontend
curl http://localhost:80

# Test database connection (from backend container)
docker compose exec backend npx prisma db pull
```

### 9.3 Create Test Account

1. Open frontend: http://YOUR_EXTERNAL_IP
2. Click "Sign Up"
3. Fill in details
4. Create account
5. Should redirect to dashboard

**Validation:**
- Can create account
- Can log in
- Dashboard loads
- Can create a lead

---

## 10. Post-Deployment Setup

### 10.1 Set Up Auto-Start (Systemd Service)

**Why:** Ensures services start automatically when VM restarts.

```bash
# Create systemd service file
sudo nano /etc/systemd/system/lite-crm.service
```

**Paste this (replace YOUR_USERNAME with actual username - run `whoami` to check):**

```ini
[Unit]
Description=Lite CRM Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/YOUR_USERNAME/lite-crm
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0
User=YOUR_USERNAME

[Install]
WantedBy=multi-user.target
```

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable lite-crm

# Start service
sudo systemctl start lite-crm

# Check status
sudo systemctl status lite-crm
```

**Validation:**
- Status should show "active (exited)"
- After VM restart, services should auto-start

### 10.2 Set Up Monitoring (Optional)

```bash
# Install monitoring tools
sudo apt install htop -y

# View system resources
htop

# Check disk usage
df -h

# Check memory
free -h

# Check Docker resources
docker stats
```

### 10.3 Set Up Backups (Recommended)

**Database Backup Script:**

```bash
# Create backup directory
mkdir -p ~/backups

# Create backup script
nano ~/backup-db.sh
```

**Paste:**
```bash
#!/bin/bash
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T db pg_dump -U litecrm litecrm > "$BACKUP_DIR/backup_$DATE.sql"
# Keep only last 7 days
find "$BACKUP_DIR" -name "backup_*.sql" -mtime +7 -delete
```

```bash
# Make executable
chmod +x ~/backup-db.sh

# Test backup
~/backup-db.sh

# Set up daily cron job
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * /home/YOUR_USERNAME/backup-db.sh
```

---

## 11. Troubleshooting

### Issue: Can't Connect via SSH

**Symptoms:** Connection timeout or "Connection refused"

**Solutions:**
1. Check VM is running: Google Cloud Console → VM Instances
2. Check firewall rule for port 22 exists
3. Verify external IP is correct
4. Try Google Cloud Shell instead

### Issue: Docker Permission Denied

**Symptoms:** `permission denied while trying to connect to Docker daemon`

**Solution:**
```bash
# Add user to docker group (if not done)
sudo usermod -aG docker $USER

# Log out and back in
exit
# Reconnect via SSH

# Verify
docker ps
```

### Issue: Services Won't Start

**Symptoms:** Containers show "Exited" status

**Check logs:**
```bash
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

**Common causes:**
- Database not ready: Wait longer, database takes time to start
- Port conflicts: Check if ports are already in use
- Environment variables: Verify .env file is correct
- Out of memory: Check `free -h` (e2-micro may not have enough RAM)

### Issue: Out of Memory

**Symptoms:** Containers crash, system becomes unresponsive

**Solutions:**
1. Upgrade VM to larger instance (e2-small or e2-medium)
2. Reduce Docker memory limits in docker-compose.yml
3. Stop unnecessary services

### Issue: Can't Access Frontend

**Symptoms:** Browser shows "This site can't be reached" or timeout

**Check:**
1. Firewall rules: Port 80 and 443 should be open
2. Services running: `docker compose ps`
3. Frontend logs: `docker compose logs frontend`
4. Try direct port: http://YOUR_IP:3000 (backend) to verify connectivity

### Issue: Database Connection Errors

**Symptoms:** Backend shows "Can't reach database server"

**Solutions:**
```bash
# Check database container is running
docker compose ps db

# Check database logs
docker compose logs db

# Test connection from backend container
docker compose exec backend ping db

# Restart services
docker compose restart
```

### Issue: n8n Not Accessible

**Symptoms:** Can't access http://YOUR_IP:5678

**Check:**
1. Firewall rule for port 5678 exists
2. n8n container is running: `docker compose ps n8n`
3. n8n logs: `docker compose logs n8n`
4. Wait a bit - n8n takes longer to start

### Issue: High Costs

**Symptoms:** Getting charged more than expected

**Solutions:**
1. Check billing: Google Cloud Console → Billing
2. Stop VM when not in use (you only pay for compute when running)
3. Use smaller instance type
4. Delete unused resources (disks, IPs, snapshots)
5. Set up budget alerts

---

## 12. Useful Commands Reference

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

# View system resources
htop
df -h
free -h
docker stats

# Check firewall rules (from VM)
sudo ufw status

# Check what's using a port
sudo netstat -tulpn | grep :3000

# View system logs
journalctl -u lite-crm
sudo journalctl -xe
```

---

## 13. Security Checklist

- [ ] Changed JWT_SECRET to a random string
- [ ] Changed n8n admin password
- [ ] Changed database password (update in .env and docker-compose.yml)
- [ ] Set up firewall rules (only necessary ports open)
- [ ] Set up SSL/HTTPS (recommended for production)
- [ ] Regular system updates: `sudo apt update && sudo apt upgrade`
- [ ] Set up backups
- [ ] Monitor logs regularly
- [ ] Use strong passwords
- [ ] Limit SSH access (optional: use SSH keys only)

---

## 14. Next Steps

1. **Domain Setup**: Point your domain to the static IP
2. **SSL Certificate**: Install Let's Encrypt SSL certificate
3. **Monitoring**: Set up Google Cloud Monitoring
4. **Backups**: Configure automated backups
5. **CI/CD**: Set up automated deployments
6. **Scaling**: Plan for scaling if needed
7. **Production Hardening**: Review security settings

---

## Support & Resources

- **Google Cloud Documentation**: https://cloud.google.com/docs
- **Compute Engine Docs**: https://cloud.google.com/compute/docs
- **Docker Docs**: https://docs.docker.com
- **Project Issues**: Check GitHub issues or contact support

---

**Congratulations!** Your Lite CRM should now be deployed and accessible. If you encounter any issues not covered here, check the logs first, then refer to the troubleshooting section.
