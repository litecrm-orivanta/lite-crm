# GCP Deployment Guide for Lite CRM

This guide covers deploying Lite CRM to Google Cloud Platform (GCP) using Docker.

## Prerequisites

1. **GCP Account** with billing enabled
2. **Google Cloud SDK (gcloud)** installed locally
3. **Git** installed
4. **Docker** installed (for local builds, optional)

## Step 1: GCP Project Setup

### 1.1 Create GCP Project

```bash
# Set your project ID
export PROJECT_ID="lite-crm-production"
export REGION="us-central1"
export ZONE="us-central1-a"

# Create project (or use existing)
gcloud projects create $PROJECT_ID --name="Lite CRM"

# Set as active project
gcloud config set project $PROJECT_ID

# Enable billing (replace BILLING_ACCOUNT_ID)
gcloud billing projects link $PROJECT_ID --billing-account=BILLING_ACCOUNT_ID
```

### 1.2 Enable Required APIs

```bash
# Enable Compute Engine API
gcloud services enable compute.googleapis.com

# Enable Cloud SQL API (if using managed database)
gcloud services enable sqladmin.googleapis.com

# Enable Container Registry API (for Docker images)
gcloud services enable containerregistry.googleapis.com
```

## Step 2: Create GCP VM Instance

### 2.1 Create VM Instance

```bash
# Create VM instance with Docker support
gcloud compute instances create lite-crm-vm \
  --project=$PROJECT_ID \
  --zone=$ZONE \
  --machine-type=e2-standard-4 \
  --network-interface=network-tier=PREMIUM,stack-type=IPV4,subnet=default \
  --maintenance-policy=MIGRATE \
  --provisioning-model=STANDARD \
  --service-account=default \
  --scopes=https://www.googleapis.com/auth/cloud-platform \
  --create-disk=auto-delete=yes,boot=yes,device-name=lite-crm-vm,image=projects/ubuntu-os-cloud/global/images/ubuntu-2204-jammy-v20240111,mode=rw,size=50,type=projects/$PROJECT_ID/zones/$ZONE/diskTypes/pd-standard \
  --no-shielded-secure-boot \
  --shielded-vtpm \
  --shielded-integrity-monitoring \
  --labels=env=production \
  --reservation-affinity=any

# Get external IP
gcloud compute instances describe lite-crm-vm --zone=$ZONE --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

### 2.2 Configure Firewall Rules

```bash
# Allow HTTP
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow HTTP traffic"

# Allow HTTPS
gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow HTTPS traffic"

# Allow SSH (optional, for debugging)
gcloud compute firewall-rules create allow-ssh \
  --allow tcp:22 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow SSH"
```

## Step 3: SSH into VM and Setup

### 3.1 Connect to VM

```bash
# SSH into the VM
gcloud compute ssh lite-crm-vm --zone=$ZONE

# Or use standard SSH
ssh -i ~/.ssh/gcp_key user@EXTERNAL_IP
```

### 3.2 Install Docker & Docker Compose on VM

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose (standalone)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and back in for group changes
exit
# SSH back in
```

### 3.3 Install Git

```bash
sudo apt install -y git
```

## Step 4: Clone Repository

### 4.1 Clone from Git

```bash
# Create application directory
sudo mkdir -p /opt/lite-crm
sudo chown $USER:$USER /opt/lite-crm
cd /opt/lite-crm

# Clone repository (replace with your repo URL)
git clone https://github.com/your-org/lite-crm.git .

# Or if using SSH
git clone git@github.com:your-org/lite-crm.git .
```

## Step 5: Configure Environment Variables

### 5.1 Create Backend .env File

```bash
cd /opt/lite-crm
cp backend/.env.example backend/.env 2>/dev/null || touch backend/.env
nano backend/.env  # or use vi/vim
```

**Required backend/.env variables:**

```env
# Database
DATABASE_URL=postgresql://litecrm:YOUR_STRONG_PASSWORD@db:5432/litecrm

# JWT
JWT_SECRET=YOUR_STRONG_JWT_SECRET_MIN_32_CHARS

# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
SMTP_FROM=no-reply@yourdomain.com

# Super Admin
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=YOUR_SECURE_PASSWORD
SUPER_ADMIN_NAME=Admin

# Encryption
ENCRYPTION_KEY=YOUR_32_CHAR_ENCRYPTION_KEY

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
```

### 5.2 Create Production .env for Docker Compose

```bash
cd /opt/lite-crm
cat > .env << 'EOF'
# Database credentials (for docker-compose.prod.yml)
POSTGRES_DB=litecrm
POSTGRES_USER=litecrm
POSTGRES_PASSWORD=YOUR_STRONG_DB_PASSWORD

# Frontend API URL
VITE_API_URL=https://yourdomain.com
EOF
```

## Step 6: Initialize Database

### 6.1 Start Database First

```bash
cd /opt/lite-crm
docker compose -f docker-compose.prod.yml up -d db

# Wait for database to be ready
sleep 10
docker compose -f docker-compose.prod.yml exec -T db psql -U litecrm -d litecrm -c "SELECT 1;"
```

### 6.2 Run Migrations

```bash
# Sync database schema
docker compose -f docker-compose.prod.yml run --rm backend npx prisma db push

# OR run migrations
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
```

### 6.3 Seed Super Admin

```bash
docker compose -f docker-compose.prod.yml run --rm backend npm run seed:admin
```

## Step 7: Deploy Application

### 7.1 Build and Start Services

```bash
cd /opt/lite-crm

# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 7.2 Verify Services

```bash
# Check backend is running
curl http://localhost:3000/health || echo "Health endpoint may not exist"

# Check frontend
curl http://localhost:8080

# Check container logs
docker compose -f docker-compose.prod.yml logs backend --tail 50
docker compose -f docker-compose.prod.yml logs frontend --tail 50
```

## Step 8: Setup Nginx Reverse Proxy (Optional but Recommended)

### 8.1 Install Nginx

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 8.2 Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lite-crm
```

**Nginx configuration:**

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8.3 Enable Site and Get SSL Certificate

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lite-crm /etc/nginx/sites-enabled/
sudo nginx -t

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Restart nginx
sudo systemctl restart nginx
```

## Step 9: Setup Automatic Updates (Optional)

### 9.1 Create Update Script

```bash
cat > /opt/lite-crm/update.sh << 'EOF'
#!/bin/bash
cd /opt/lite-crm

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations if needed
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

echo "Update complete!"
EOF

chmod +x /opt/lite-crm/update.sh
```

### 9.2 Setup Systemd Service (Optional)

```bash
sudo nano /etc/systemd/system/lite-crm.service
```

```ini
[Unit]
Description=Lite CRM Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/lite-crm
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
sudo systemctl enable lite-crm.service
sudo systemctl start lite-crm.service
```

## Step 10: Backup Strategy

### 10.1 Database Backup Script

```bash
cat > /opt/lite-crm/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/lite-crm/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker compose -f docker-compose.prod.yml exec -T db pg_dump -U litecrm litecrm | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /opt/lite-crm/backup-db.sh
```

### 10.2 Schedule Daily Backups

```bash
# Add to crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /opt/lite-crm/backup-db.sh
```

## Quick Deploy Commands

```bash
# Full deployment from scratch
cd /opt/lite-crm
git pull origin main
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check status
docker compose -f docker-compose.prod.yml ps

# Restart services
docker compose -f docker-compose.prod.yml restart

# Update application
cd /opt/lite-crm
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
```

## Troubleshooting

### Check Service Status
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs db
```

### Restart Services
```bash
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
```

### Database Connection Issues
```bash
# Test database connection
docker compose -f docker-compose.prod.yml exec backend npx prisma db pull

# Reset database (⚠️ destroys data)
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d db
docker compose -f docker-compose.prod.yml run --rm backend npx prisma db push
```

### Check Disk Space
```bash
df -h
docker system df
```

### View Container Resources
```bash
docker stats
```
