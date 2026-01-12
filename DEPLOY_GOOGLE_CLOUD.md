# Deploy Lite CRM on Google Cloud Platform

This guide will help you deploy Lite CRM on Google Cloud Platform using the Free Tier.

## Prerequisites

- Google Cloud account (sign up at cloud.google.com)
- Credit card required (for verification, but free tier won't charge you)
- Basic knowledge of Linux commands
- SSH client (Google Cloud Shell or local SSH)

## Google Cloud Free Tier Overview

**Free Trial**: $300 credit for 90 days (new accounts)

**Always Free Tier** (after trial):
- 1 e2-micro VM instance per month (limited regions)
- 30GB standard persistent disk
- 1GB egress per month
- **Note**: e2-micro has limited resources (0.5-1 vCPU, 1GB RAM) - may need more for full stack

**Recommended for UAT**: Use Free Trial credit ($300) which gives you more resources

## Step 1: Create Google Cloud Account

1. Go to https://cloud.google.com
2. Click "Get started for free"
3. Sign in with your Google account
4. Provide payment info (for verification - free tier won't charge)
5. Start with $300 free credit (valid for 90 days)

## Step 2: Create a New Project

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Click the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `lite-crm-uat`
5. Click **"Create"**
6. Select the new project from dropdown

## Step 3: Enable Required APIs

1. Go to **"APIs & Services"** → **"Library"**
2. Enable these APIs (search and click "Enable"):
   - **Compute Engine API**
   - **Cloud Resource Manager API**

## Step 4: Create a Compute Engine Instance (VM)

### 4.1 Create VM Instance

1. Go to **"Compute Engine"** → **"VM instances"**
2. Click **"Create Instance"**
3. Fill in the details:

   **Name**: `lite-crm-vm`

   **Region**: Choose a region (us-central1, us-east1 are common)
   - For Always Free: us-central1, us-east1, us-west1, europe-west1, asia-east1

   **Zone**: Select any zone in the region

   **Machine configuration**:
   - **Machine family**: General-purpose
   - **Series**: E2
   - **Machine type**: 
     - **Free Tier**: e2-micro (0.5-1 vCPU, 1GB RAM) - **Limited for full stack**
     - **Recommended for UAT**: e2-small (2 vCPU, 2GB RAM) or e2-medium (2 vCPU, 4GB RAM)
     - Using $300 credit: e2-medium is recommended

   **Boot disk**:
   - Click **"Change"**
   - **Operating System**: Ubuntu
   - **Version**: Ubuntu 22.04 LTS
   - **Boot disk type**: Standard persistent disk
   - **Size**: 30 GB (free tier) or 50 GB (recommended)
   - Click **"Select"**

   **Firewall**:
   - ✅ **Allow HTTP traffic**
   - ✅ **Allow HTTPS traffic**

   **Advanced Options** → **Networking**:
   - **Network tags**: Add `http-server`, `https-server` (optional)
   - **Network interface** → **External IP**: Ephemeral (or create static IP)

4. Click **"Create"**
5. Wait 1-2 minutes for the instance to be created
6. Note the **External IP** address

### 4.2 Configure Firewall Rules

1. Go to **"VPC Network"** → **"Firewall"**
2. Click **"Create Firewall Rule"**

   **Rule 1 - Backend API**:
   - Name: `allow-backend-api`
   - Direction: Ingress
   - Targets: All instances in the network
   - Source IP ranges: `0.0.0.0/0`
   - Protocols and ports: TCP, Port `3000`
   - Click **"Create"**

   **Rule 2 - n8n**:
   - Name: `allow-n8n`
   - Direction: Ingress
   - Targets: All instances in the network
   - Source IP ranges: `0.0.0.0/0`
   - Protocols and ports: TCP, Port `5678`
   - Click **"Create"**

   **Note**: HTTP (80) and HTTPS (443) are already allowed if you checked the boxes during VM creation

## Step 5: Connect to Your Instance

### Option 1: Using Google Cloud Shell (Easiest)

1. Click the **"SSH"** button next to your VM instance
2. This opens a browser-based terminal
3. You're now connected!

### Option 2: Using Local SSH

1. Generate SSH key (if you don't have one):
   ```bash
   ssh-keygen -t rsa -f ~/.ssh/gcp-lite-crm -C "your-email@example.com"
   ```

2. Add SSH key to Google Cloud:
   - Go to **"Compute Engine"** → **"Metadata"** → **"SSH Keys"**
   - Click **"Add Item"**
   - Paste your public key: `cat ~/.ssh/gcp-lite-crm.pub`
   - Click **"Save"**

3. Connect via SSH:
   ```bash
   ssh -i ~/.ssh/gcp-lite-crm <USERNAME>@<EXTERNAL_IP>
   ```
   (Username is usually your Gmail username or "ubuntu")

## Step 6: Install Required Software

Once connected via SSH, run:

### 6.1 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 6.2 Install Docker
```bash
# Remove old versions
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

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in (or run: newgrp docker)
exit
```

**Reconnect via SSH** and verify Docker:
```bash
docker --version
docker compose version
```

### 6.3 Install Git
```bash
sudo apt install git -y
```

### 6.4 Install Node.js (optional, for building)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## Step 7: Clone and Configure Your Application

### 7.1 Clone Repository
```bash
cd ~
git clone <YOUR_REPO_URL> lite-crm
cd lite-crm
```

**Or upload files manually:**
1. Use Google Cloud Shell's file upload feature
2. Or use `scp` from local machine:
   ```bash
   scp -i ~/.ssh/gcp-lite-crm -r /path/to/lite-crm/* <USER>@<EXTERNAL_IP>:~/lite-crm/
   ```

### 7.2 Configure Environment Variables

Create `.env` file for backend:

```bash
cd ~/lite-crm/backend
nano .env
```

Add these variables:
```env
# Database (Docker service name)
DATABASE_URL=postgresql://litecrm:litecrm_password@db:5432/litecrm

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# n8n
N8N_URL=http://n8n:5678
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=n8n_admin_pass_change_this

# Frontend URL
FRONTEND_URL=http://<EXTERNAL_IP>:80

# Backend URL
BACKEND_URL=http://<EXTERNAL_IP>:3000
```

**Replace `<EXTERNAL_IP>` with your VM's external IP**

Save and exit (Ctrl+X, Y, Enter)

### 7.3 Verify docker-compose.yml

Check that ports are mapped correctly:
```bash
cd ~/lite-crm
cat docker-compose.yml
```

Ensure:
- Frontend: `80:80`
- Backend: `3000:3000`
- n8n: `5678:5678`
- Database: Internal only

## Step 8: Set Up Nginx Reverse Proxy (Recommended)

### 8.1 Install Nginx
```bash
sudo apt install nginx -y
```

### 8.2 Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/lite-crm
```

Add configuration:
```nginx
server {
    listen 80;
    server_name <EXTERNAL_IP>;  # Replace with domain if you have one

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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/lite-crm /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Step 9: Start the Application

### 9.1 Start Docker Services
```bash
cd ~/lite-crm
docker compose up -d
```

### 9.2 Run Database Migrations
```bash
docker compose exec backend npx prisma migrate deploy
```

### 9.3 Check Services Status
```bash
docker compose ps
```

All services should show "Up" status.

### 9.4 View Logs (if needed)
```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f n8n
```

## Step 10: Access Your Application

- **Frontend**: http://<EXTERNAL_IP>
- **Backend API**: http://<EXTERNAL_IP>:3000
- **n8n**: http://<EXTERNAL_IP>:5678

## Step 11: Set Up Static IP (Recommended)

To avoid IP changes on VM restart:

1. Go to **"VPC Network"** → **"External IP addresses"**
2. Click **"Reserve Static Address"**
3. Name: `lite-crm-static-ip`
4. Region: Same as your VM
5. Click **"Reserve"**
6. Go back to **"VM instances"**
7. Click on your VM → **"EDIT"**
8. Under **"Network interfaces"**, click the network interface
9. Change **"External IP"** to your reserved static IP
10. Click **"Save"**

## Step 12: Set Up Domain and SSL (Optional)

### 12.1 Point Domain to Static IP

1. Go to your domain registrar
2. Add A record: `@` → `<STATIC_IP>`

### 12.2 Install Certbot (Let's Encrypt SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

Follow the prompts to get free SSL certificate.

## Step 13: Set Up Auto-Start on Boot

Create systemd service:

```bash
sudo nano /etc/systemd/system/lite-crm.service
```

Add:
```ini
[Unit]
Description=Lite CRM Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/<USERNAME>/lite-crm
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0
User=<USERNAME>

[Install]
WantedBy=multi-user.target
```

**Replace `<USERNAME>` with your username (run `whoami` to check)**

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable lite-crm
sudo systemctl start lite-crm
```

## Step 14: Monitor Costs

1. Go to **"Billing"** → **"Budgets & alerts"**
2. Create a budget to track spending
3. Set alerts at 50%, 90%, 100% of budget

## Troubleshooting

### VM won't start
- Check quotas: **"IAM & Admin"** → **"Quotas"**
- Check billing account is active
- Verify project has billing enabled

### Can't connect via SSH
- Check firewall rules
- Verify external IP is correct
- Check VM is running

### Services won't start
- Check logs: `docker compose logs`
- Verify environment variables
- Check disk space: `df -h`
- Check memory: `free -h` (e2-micro has only 1GB RAM)

### Out of memory errors
- e2-micro (1GB RAM) may not be enough
- Upgrade to e2-small (2GB) or e2-medium (4GB)
- Or optimize Docker resource usage

### Database connection errors
- Verify DATABASE_URL in backend/.env
- Check if db container is running: `docker compose ps`
- Check db logs: `docker compose logs db`

### Port conflicts
- Check if ports are in use: `sudo netstat -tulpn | grep LISTEN`
- Change ports in docker-compose.yml if needed

## Cost Optimization Tips

1. **Use Preemptible VMs** (optional):
   - 80% cheaper but can be terminated
   - Good for development/testing

2. **Stop VM when not in use**:
   - You only pay for compute when VM is running
   - Storage (disk) costs continue (~$2/month for 50GB)

3. **Use smaller machine types**:
   - Start with e2-micro (free tier)
   - Upgrade only if needed

4. **Clean up unused resources**:
   - Delete unused static IPs
   - Remove old snapshots
   - Delete unused disks

5. **Monitor usage**:
   - Set up billing alerts
   - Check "Cost breakdown" regularly

## Estimated Costs

### Using Free Trial ($300 credit):
- **e2-medium VM**: ~$30/month
- **50GB disk**: ~$8/month
- **Network egress**: ~$10-20/month (first 1GB free)
- **Total**: ~$50-60/month
- **With $300 credit**: Free for ~5-6 months

### Using Always Free Tier:
- **e2-micro VM**: Free (1 per month)
- **30GB disk**: Free
- **1GB egress**: Free
- **Total**: $0/month
- **Note**: e2-micro (1GB RAM) may struggle with full stack

## Resource Recommendations

| Use Case | VM Type | vCPU | RAM | Cost/month |
|----------|---------|------|-----|------------|
| Free Tier | e2-micro | 0.5-1 | 1GB | Free |
| UAT (minimal) | e2-small | 2 | 2GB | ~$15 |
| UAT (recommended) | e2-medium | 2 | 4GB | ~$30 |
| Production | e2-standard-2+ | 2+ | 8GB+ | $50+ |

## Next Steps

- Set up monitoring (Cloud Monitoring)
- Configure backups (automated snapshots)
- Set up CI/CD (Cloud Build)
- Implement logging (Cloud Logging)
- Set up alerts (Cloud Monitoring)

## Support Resources

- Google Cloud Documentation: https://cloud.google.com/docs
- Compute Engine Docs: https://cloud.google.com/compute/docs
- Free Tier Guide: https://cloud.google.com/free/docs/free-cloud-features

---

**Note**: This guide is for UAT/testing. For production:
- Use managed database (Cloud SQL)
- Set up proper backups
- Implement monitoring and alerting
- Use load balancing
- Set up SSL certificates
- Implement security best practices
- Consider Cloud Run or GKE for better scalability
