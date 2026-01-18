# Lite CRM - Deployment Readme

## 🚀 Quick Deployment to GCP

### Prerequisites

1. **GCP VM Instance** (Ubuntu 22.04 recommended)
   - Minimum: 2 CPU, 4GB RAM
   - Recommended: 4 CPU, 8GB RAM
   - 50GB+ disk space

2. **Git Repository** - Code should be pushed to Git

3. **Domain Name** (optional but recommended for SSL)

### Step-by-Step Deployment

#### 1. Push Code to Git

```bash
# On your local machine
cd /path/to/lite-crm

# Add all changes
git add .

# Commit changes
git commit -m "Prepare for GCP deployment"

# Push to repository
git push origin main
```

#### 2. Setup GCP VM

**Create VM:**
```bash
gcloud compute instances create lite-crm-vm \
  --zone=us-central1-a \
  --machine-type=e2-standard-4 \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB
```

**Configure Firewall:**
```bash
gcloud compute firewall-rules create allow-http --allow tcp:80
gcloud compute firewall-rules create allow-https --allow tcp:443
gcloud compute firewall-rules create allow-ssh --allow tcp:22
```

#### 3. SSH into VM

```bash
gcloud compute ssh lite-crm-vm --zone=us-central1-a
```

#### 4. Install Docker & Git on VM

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt update && sudo apt install -y git

# Log out and back in
exit
# SSH back in
```

#### 5. Clone Repository

```bash
sudo mkdir -p /opt/lite-crm
sudo chown $USER:$USER /opt/lite-crm
cd /opt/lite-crm

# Clone your repository
git clone https://github.com/your-org/lite-crm.git .
# OR
git clone git@github.com:your-org/lite-crm.git .
```

#### 6. Configure Environment

```bash
cd /opt/lite-crm

# Create backend .env file
cp backend/.env.example backend/.env
nano backend/.env  # Edit with your production values

# Create root .env for docker-compose
cat > .env << 'EOF'
POSTGRES_DB=litecrm
POSTGRES_USER=litecrm
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD
VITE_API_URL=https://yourdomain.com
EOF
```

**Important:** Update all values in `backend/.env` with your production credentials!

#### 7. Deploy Application

```bash
cd /opt/lite-crm

# Make deployment script executable
chmod +x deploy-gcp.sh

# Run deployment
./deploy-gcp.sh

# OR manually:
docker compose -f docker-compose.prod.yml up -d --build
```

#### 8. Initialize Database

```bash
# Run migrations
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

# Seed super admin
docker compose -f docker-compose.prod.yml run --rm backend npm run seed:admin
```

#### 9. Setup Nginx (Optional - for SSL/HTTPS)

```bash
# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure Nginx (see GCP_DEPLOYMENT.md for full config)
sudo nano /etc/nginx/sites-available/lite-crm

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## 📝 Environment Variables Checklist

Make sure these are set in `backend/.env`:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Strong secret (32+ chars)
- [ ] `FRONTEND_URL` - Your domain URL
- [ ] `SMTP_*` - Email configuration
- [ ] `SUPER_ADMIN_EMAIL` - Admin email
- [ ] `SUPER_ADMIN_PASSWORD` - Admin password
- [ ] `ENCRYPTION_KEY` - 32+ character encryption key

## 🔄 Updating Application

```bash
cd /opt/lite-crm
git pull origin main
./deploy-gcp.sh
```

## 📊 Monitoring

```bash
# Check service status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check specific service
docker compose -f docker-compose.prod.yml logs backend --tail 50
```

## 🛠️ Troubleshooting

### Services not starting
```bash
docker compose -f docker-compose.prod.yml logs
docker compose -f docker-compose.prod.yml ps
```

### Database connection issues
```bash
# Test database
docker compose -f docker-compose.prod.yml exec db psql -U litecrm -d litecrm -c "SELECT 1;"

# Check DATABASE_URL in backend/.env
cat backend/.env | grep DATABASE_URL
```

### Port conflicts
```bash
# Check what's using ports
sudo netstat -tulpn | grep -E ':(3000|8080|5432)'
```

## 📚 More Information

- Full deployment guide: `GCP_DEPLOYMENT.md`
- General deployment: `DEPLOYMENT_GUIDE.md`
- Production config: `docker-compose.prod.yml`
