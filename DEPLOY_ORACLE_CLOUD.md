# Deploy Lite CRM on Oracle Cloud Infrastructure (Free Tier)

This guide will help you deploy Lite CRM on Oracle Cloud Infrastructure using the Always Free Tier.

## Prerequisites

- Oracle Cloud account (sign up at cloud.oracle.com - no credit card required for free tier)
- Basic knowledge of Linux commands
- SSH client (PuTTY on Windows, Terminal on Mac/Linux)

## Step 1: Create Oracle Cloud Account

1. Go to https://cloud.oracle.com
2. Click "Start for Free"
3. Sign up (requires email, phone verification)
4. **No credit card required** for Always Free Tier
5. Complete the account setup

## Step 2: Create a Compute Instance (Free VM)

### 2.1 Access the Console

1. Log into Oracle Cloud Console
2. Make sure you're in the correct region (choose one with "Always Free" label)
3. Click the hamburger menu (☰) → **Compute** → **Instances**

### 2.2 Create Instance

1. Click **"Create Instance"**
2. Fill in the details:

   **Name**: `lite-crm-uat` (or any name you prefer)

   **Placement**: Keep default

   **Image and Shape**:
   - Click **"Edit"** next to Image
   - Select **"Canonical Ubuntu"** (20.04 or 22.04)
   - Click **"Select Image"**
   - Click **"Edit"** next to Shape
   - Select **"VM.Standard.A1.Flex"** (ARM-based, Always Free eligible)
   - Configure: **2 OCPUs**, **12 GB memory** (this is the free tier limit)
   - Click **"Select Shape"**

   **Networking**:
   - Keep default VCN (Virtual Cloud Network)
   - Keep default subnet
   - **Assign a public IP address**: Select "Assign a public IPv4 address"

   **Add SSH keys**:
   - Option 1: Generate a new key pair (download the private key)
   - Option 2: Paste your existing SSH public key
   - **Save the private key securely** (you'll need it to connect)

3. Click **"Create"**
4. Wait 2-3 minutes for the instance to be ready
5. Note the **Public IP address** (you'll see it in the instance details)

## Step 3: Configure Security Rules (Firewall)

1. In the instance details, click on the **Subnet** link
2. Click on **"Security Lists"** → Click the default security list
3. Click **"Add Ingress Rules"**
4. Add the following rules:

   **Rule 1 - HTTP**:
   - Source Type: CIDR
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: TCP
   - Destination Port Range: `80`
   - Description: `Allow HTTP`

   **Rule 2 - HTTPS**:
   - Source Type: CIDR
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: TCP
   - Destination Port Range: `443`
   - Description: `Allow HTTPS`

   **Rule 3 - Backend API**:
   - Source Type: CIDR
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: TCP
   - Destination Port Range: `3000`
   - Description: `Allow Backend API`

   **Rule 4 - n8n**:
   - Source Type: CIDR
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: TCP
   - Destination Port Range: `5678`
   - Description: `Allow n8n`

   **Rule 5 - SSH** (if not already there):
   - Source Type: CIDR
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: TCP
   - Destination Port Range: `22`
   - Description: `Allow SSH`

5. Click **"Add Ingress Rules"** after each rule

## Step 4: Connect to Your Instance

### On Mac/Linux:
```bash
chmod 400 /path/to/your-private-key.key
ssh -i /path/to/your-private-key.key ubuntu@<PUBLIC_IP>
```

### On Windows (using PuTTY):
1. Open PuTTYgen
2. Load your private key and convert to .ppk format
3. Open PuTTY
4. Host: `ubuntu@<PUBLIC_IP>`
5. Connection → SSH → Auth → Browse and select your .ppk file
6. Click "Open"

**Replace `<PUBLIC_IP>` with your instance's public IP address**

## Step 5: Install Required Software

Once connected via SSH, run these commands:

### 5.1 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 5.2 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and log back in for group changes to take effect
exit
```

**Reconnect via SSH** (the usermod requires a new session)

### 5.3 Install Git
```bash
sudo apt install git -y
```

### 5.4 Install Node.js (for building if needed)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## Step 6: Clone and Configure Your Application

### 6.1 Clone Repository
```bash
cd ~
git clone <YOUR_REPO_URL> lite-crm
cd lite-crm
```

**Or if you don't have a repo yet:**
```bash
# Create directory and copy files via SCP from your local machine
mkdir -p ~/lite-crm
```

**Then from your local machine:**
```bash
scp -i /path/to/private-key.key -r /path/to/lite-crm/* ubuntu@<PUBLIC_IP>:~/lite-crm/
```

### 6.2 Configure Environment Variables

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

# Frontend URL (use your public IP or domain)
FRONTEND_URL=http://<PUBLIC_IP>:80

# Backend URL
BACKEND_URL=http://<PUBLIC_IP>:3000
```

**Save and exit** (Ctrl+X, then Y, then Enter)

### 6.3 Update docker-compose.yml

Edit `docker-compose.yml` to ensure all services are exposed correctly:

```bash
cd ~/lite-crm
nano docker-compose.yml
```

Make sure ports are mapped:
- Frontend: `80:80` (or `8080:80` if you prefer)
- Backend: `3000:3000`
- n8n: `5678:5678`
- Database: Only internal (no need to expose)

## Step 7: Set Up Nginx Reverse Proxy (Optional but Recommended)

Since you'll have multiple services, set up Nginx as a reverse proxy:

### 7.1 Install Nginx
```bash
sudo apt install nginx -y
```

### 7.2 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/lite-crm
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name <PUBLIC_IP>;  # Replace with your domain if you have one

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

    # n8n (optional - expose if needed)
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
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Step 8: Start the Application

### 8.1 Start Docker Services

```bash
cd ~/lite-crm
docker-compose up -d
```

### 8.2 Run Database Migrations

```bash
docker-compose exec backend npx prisma migrate deploy
```

### 8.3 Check Services Status

```bash
docker-compose ps
```

All services should show "Up" status.

### 8.4 View Logs (if needed)

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f n8n
```

## Step 9: Access Your Application

- **Frontend**: http://<PUBLIC_IP>
- **Backend API**: http://<PUBLIC_IP>:3000
- **n8n**: http://<PUBLIC_IP>:5678

## Step 10: Set Up Domain (Optional)

If you want to use a domain instead of IP:

1. Purchase a domain (Namecheap, GoDaddy, etc.)
2. Add an A record pointing to your Oracle Cloud public IP
3. Update Nginx config with your domain name
4. Optionally set up SSL with Let's Encrypt (certbot)

## Step 11: Set Up Automatic Startup (Systemd)

Create a systemd service to auto-start Docker Compose on boot:

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
WorkingDirectory=/home/ubuntu/lite-crm
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable lite-crm
sudo systemctl start lite-crm
```

## Troubleshooting

### Can't connect via SSH
- Check Security List rules (SSH port 22)
- Verify you're using the correct private key
- Ensure instance is running

### Services won't start
- Check logs: `docker-compose logs`
- Verify environment variables
- Check disk space: `df -h`
- Check memory: `free -h`

### Database connection errors
- Verify DATABASE_URL in backend/.env
- Check if db container is running: `docker-compose ps`
- Check db logs: `docker-compose logs db`

### Port conflicts
- Check if ports are in use: `sudo netstat -tulpn | grep LISTEN`
- Change ports in docker-compose.yml if needed

### n8n not accessible
- Check Security List rule for port 5678
- Verify n8n container is running
- Check n8n logs: `docker-compose logs n8n`

## Cost Breakdown (Free Tier)

Oracle Cloud Always Free Tier includes:
- **2 VM.Standard.A1.Flex instances** (4 OCPUs, 24GB RAM total)
- **200GB block storage**
- **10TB outbound data transfer per month**
- **2 Autonomous Databases** (optional)

Your Lite CRM UAT deployment will use:
- 1 VM instance (2 OCPUs, 12GB RAM)
- ~20-30GB storage (for Docker images and data)
- Minimal data transfer for UAT

**Total Cost: $0/month** (stays within free tier limits)

## Security Recommendations

1. **Change default passwords**:
   - Database password
   - n8n admin password
   - JWT secret

2. **Set up firewall rules** (ufw):
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **Regular updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Set up SSL/HTTPS** (use Let's Encrypt)

5. **Restrict SSH access** (optional):
   - Use SSH keys only
   - Disable password authentication

## Next Steps

- Set up monitoring (optional)
- Configure backups for database
- Set up CI/CD pipeline
- Configure domain and SSL
- Set up email notifications

## Support

If you encounter issues:
1. Check Docker logs: `docker-compose logs`
2. Check system logs: `journalctl -u lite-crm`
3. Verify all services: `docker-compose ps`
4. Check Oracle Cloud console for instance status

---

**Note**: This guide is for UAT/testing. For production, consider:
- Using a managed database service
- Setting up proper backups
- Implementing monitoring and alerting
- Using a load balancer
- Setting up SSL certificates
- Implementing proper security measures
