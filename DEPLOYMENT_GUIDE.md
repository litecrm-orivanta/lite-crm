# Lite CRM - Production Deployment Guide

## Server Requirements

### Minimum Requirements (Small/Medium Deployment)
- **CPU**: 2 cores (4 cores recommended)
- **RAM**: 4 GB (8 GB recommended)
- **Storage**: 50 GB SSD (100 GB recommended for growth)
- **OS**: Ubuntu 22.04 LTS / Debian 11+ / CentOS 8+ / RHEL 8+
- **Network**: Public IP address with DNS configured

### Recommended Requirements (Production/Large Scale)
- **CPU**: 4-8 cores
- **RAM**: 16 GB
- **Storage**: 200+ GB SSD with automated backups
- **OS**: Ubuntu 22.04 LTS (recommended)
- **Network**: Static IP, dedicated domain with SSL

---

## Pre-Deployment Checklist

### 1. Operating System Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential utilities
sudo apt install -y curl wget git ufw fail2ban htop
```

### 2. Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose (standalone)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and back in for group changes to take effect
```

### 3. Network & Firewall Configuration

```bash
# Configure UFW (Uncomplicated Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application ports (optional, if not using reverse proxy)
sudo ufw allow 3000/tcp  # Backend
sudo ufw allow 8080/tcp  # Frontend (if direct access needed)

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## Application Deployment

### 1. Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/lite-crm
sudo chown $USER:$USER /opt/lite-crm
cd /opt/lite-crm

# Clone repository (replace with your repo URL)
git clone https://github.com/your-org/lite-crm.git .

# Or if already cloned, pull latest
git pull origin main
```

### 2. Environment Configuration

#### Backend Environment Variables (`backend/.env`)

```bash
# Database Configuration
DATABASE_URL="postgresql://litecrm:YOUR_STRONG_PASSWORD@db:5432/litecrm?schema=public"

# JWT Configuration
JWT_SECRET="YOUR_STRONG_JWT_SECRET_MIN_32_CHARS"
JWT_ISSUER="lite-crm"  # Optional
JWT_AUDIENCE="lite-crm-users"  # Optional

# Application Configuration
NODE_ENV="production"
PORT=3000
FRONTEND_URL="https://yourdomain.com"

# SMTP Configuration (Email)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Lite CRM <no-reply@yourdomain.com>"

# Encryption Key (for sensitive data)
ENCRYPTION_KEY="YOUR_32_CHAR_ENCRYPTION_KEY"

# Razorpay Configuration (if using)
RAZORPAY_KEY_ID_UAT="rzp_test_..."
RAZORPAY_KEY_SECRET_UAT="..."
RAZORPAY_KEY_ID_PROD="rzp_live_..."
RAZORPAY_KEY_SECRET_PROD="..."
RAZORPAY_WEBHOOK_SECRET_UAT="..."
RAZORPAY_WEBHOOK_SECRET_PROD="..."

# Google OAuth (if using)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Audit Log Retention (days)
AUDIT_RETENTION_DAYS=180

# CORS (optional, auto-detected from FRONTEND_URL)
# CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

**Security Best Practices:**
- Use strong, randomly generated secrets (minimum 32 characters)
- Never commit `.env` files to version control
- Rotate secrets regularly
- Use environment-specific secrets for staging/production

#### Frontend Environment (Build-time)

Update `frontend/.env.production` or pass as build args:

```bash
VITE_API_URL=https://api.yourdomain.com
```

### 3. Production Docker Compose Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: litecrm
      POSTGRES_USER: litecrm
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backups:/backups  # For backup storage
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U litecrm"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "127.0.0.1:3000:3000"  # Bind to localhost only, use reverse proxy
    env_file:
      - ./backend/.env
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL}
    ports:
      - "127.0.0.1:8080:80"  # Bind to localhost only, use reverse proxy
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app-network

volumes:
  pgdata:
    driver: local

networks:
  app-network:
    driver: bridge
```

### 4. SSL/HTTPS with Nginx Reverse Proxy

Install and configure Nginx:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Nginx configuration (`/etc/nginx/sites-available/lite-crm`):

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Webhook endpoints (longer timeout)
    location /api/payments/razorpay/webhook {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Important: Preserve raw body for webhook signature verification
        proxy_set_header Content-Type $http_content_type;
        
        # Longer timeout for webhook processing
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Enable site and get SSL certificate:

```bash
sudo ln -s /etc/nginx/sites-available/lite-crm /etc/nginx/sites-enabled/
sudo nginx -t

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 5. Database Migration

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d db

# Wait for database to be ready
sleep 10

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# (Optional) Seed initial data
docker-compose -f docker-compose.prod.yml exec backend npm run seed:admin
docker-compose -f docker-compose.prod.yml exec backend npm run seed:templates
```

### 6. Start Application

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

---

## Backup & Recovery

### Automated Database Backups

Create backup script (`/opt/lite-crm/backup.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/opt/lite-crm/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f /opt/lite-crm/docker-compose.prod.yml exec -T db pg_dump -U litecrm litecrm | gzip > $BACKUP_DIR/litecrm_$DATE.sql.gz

# Remove backups older than retention period
find $BACKUP_DIR -name "litecrm_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Upload to S3/Cloud Storage (optional)
# aws s3 cp $BACKUP_DIR/litecrm_$DATE.sql.gz s3://your-backup-bucket/
```

Make executable and add to cron:

```bash
chmod +x /opt/lite-crm/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/lite-crm/backup.sh") | crontab -
```

### Restore Database

```bash
# Stop application
docker-compose -f docker-compose.prod.yml stop backend

# Restore from backup
gunzip < /opt/lite-crm/backups/litecrm_YYYYMMDD_HHMMSS.sql.gz | \
  docker-compose -f docker-compose.prod.yml exec -T db psql -U litecrm litecrm

# Start application
docker-compose -f docker-compose.prod.yml start backend
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check service health
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs backend --tail=100
docker-compose -f docker-compose.prod.yml logs frontend --tail=100
docker-compose -f docker-compose.prod.yml logs db --tail=100
```

### Log Management

```bash
# Configure Docker log rotation
# Add to docker-compose.prod.yml under each service:
# logging:
#   driver: "json-file"
#   options:
#     max-size: "10m"
#     max-file: "3"
```

### System Monitoring (Optional)

Install monitoring tools:

```bash
# Install Netdata (lightweight monitoring)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access at http://your-server-ip:19999
```

---

## Security Hardening

### 1. Fail2Ban Configuration

```bash
# Configure fail2ban for SSH and Nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Disable Root Login

```bash
# Edit /etc/ssh/sshd_config
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

sudo systemctl restart sshd
```

### 3. Regular Security Updates

```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 4. Environment Variable Security

- Never commit `.env` files
- Use secrets management (e.g., AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly
- Use different secrets for staging/production

---

## Scaling Considerations

### Horizontal Scaling (Multiple Servers)

1. **Load Balancer**: Use AWS ALB, Nginx Plus, or HAProxy
2. **Database**: Use managed PostgreSQL (AWS RDS, DigitalOcean Managed DB) or PostgreSQL with read replicas
3. **File Storage**: Use S3-compatible storage for attachments
4. **Session Management**: Use Redis for session storage if scaling backend

### Vertical Scaling (Single Server)

- Increase CPU/RAM as needed
- Use PostgreSQL connection pooling (PgBouncer)
- Enable database query caching
- Use CDN for static assets

---

## Common Issues & Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3000

# Kill process or change port in docker-compose.yml
```

### Database Connection Issues

```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Test database connection
docker-compose -f docker-compose.prod.yml exec db psql -U litecrm -d litecrm -c "SELECT 1;"
```

### SSL Certificate Renewal

```bash
# Certbot auto-renewal should be set up automatically
# Manual renewal:
sudo certbot renew

# Restart Nginx after renewal
sudo systemctl restart nginx
```

---

## Deployment Checklist

- [ ] Server meets minimum requirements
- [ ] Docker and Docker Compose installed
- [ ] Firewall configured (SSH, HTTP, HTTPS)
- [ ] Domain DNS configured (A record pointing to server IP)
- [ ] SSL certificate obtained and configured
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Application running and accessible
- [ ] Health checks passing
- [ ] Backup strategy configured
- [ ] Monitoring set up
- [ ] Security hardening completed

---

## Quick Start Command Summary

```bash
# 1. Server setup
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh

# 2. Deploy application
cd /opt/lite-crm
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# 4. Setup SSL
sudo certbot --nginx -d yourdomain.com

# 5. Verify
curl https://yourdomain.com/api/health
```

---

## Support & Documentation

- **Docker Documentation**: https://docs.docker.com/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
