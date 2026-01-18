# Deployment Checklist

## Pre-Deployment (Local)

- [ ] All code changes committed and pushed to Git
- [ ] `.env` files are in `.gitignore` (✅ Already done)
- [ ] `backend/.env.example` exists with all required variables
- [ ] Test locally to ensure everything works

## GCP VM Setup

- [ ] GCP VM instance created
- [ ] Firewall rules configured (HTTP/HTTPS/SSH)
- [ ] Docker installed on VM
- [ ] Docker Compose installed on VM
- [ ] Git installed on VM

## Code Deployment

- [ ] Repository cloned to `/opt/lite-crm` on VM
- [ ] `backend/.env` file created with production values
- [ ] Root `.env` file created for docker-compose.prod.yml
- [ ] All environment variables set correctly

## Database Setup

- [ ] Database container started
- [ ] Migrations run: `npx prisma migrate deploy`
- [ ] Super admin seeded: `npm run seed:admin`

## Application Deployment

- [ ] Services built and started: `docker compose -f docker-compose.prod.yml up -d --build`
- [ ] All services running: `docker compose -f docker-compose.prod.yml ps`
- [ ] Backend accessible on port 3000
- [ ] Frontend accessible on port 8080

## SSL/HTTPS (Optional but Recommended)

- [ ] Nginx installed and configured
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] Nginx reverse proxy configured
- [ ] HTTP to HTTPS redirect working

## Post-Deployment Verification

- [ ] Frontend loads correctly
- [ ] Backend API responding
- [ ] Login works with super admin credentials
- [ ] Database connections working
- [ ] Email sending works (test with OTP)
- [ ] All features accessible

## Backup & Monitoring

- [ ] Database backup script configured
- [ ] Cron job for daily backups set up
- [ ] Log monitoring in place
- [ ] Disk space monitoring configured

## Security

- [ ] Strong passwords set for all services
- [ ] `.env` files not accessible publicly
- [ ] Firewall rules properly configured
- [ ] SSL certificates valid and auto-renewal set up
